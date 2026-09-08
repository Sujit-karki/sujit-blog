"""Base class for a measurement run against local models.

The site's rule is that the model is the *instrument*, never the author: the
harness produces a dataset, the analysis around it is written by hand. So this
class is deliberately about measurement discipline, not about generating text
to publish.

Three properties matter and are handled here so no experiment has to remember
them:

Warm-up discard  The first generation after a model loads differs from later
                 ones (documented Ollama behaviour). One throwaway call per
                 model is made and excluded from results.

Checkpointing    Results append to JSONL after *every* generation, and a
                 completed-key set makes reruns resumable. This laptop
                 thermally throttles and can drop out mid-batch; losing a
                 multi-hour run to a shutdown is otherwise routine.

Repetition       Each prompt runs N times. A single sample cannot show whether
                 a model is reliably right, occasionally right, or unstable —
                 which is the actual finding worth publishing.
"""

from __future__ import annotations

import abc
import json
import os
import platform
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path

from .client import OllamaClient, OllamaError


@dataclass(frozen=True)
class Scenario:
    """One prompt with a known correct answer."""

    id: str
    prompt: str
    expected: float
    tolerance: float = 0.01
    category: str = "general"
    note: str = ""


@dataclass
class Result:
    scenario_id: str
    category: str
    model: str
    rep: int
    seed: int
    raw_output: str
    parsed: float | None
    expected: float
    correct: bool
    ttft_s: float
    eval_s: float
    tokens_per_s: float
    eval_tokens: int
    #: "length" means num_predict cut the reply off. Such a row is a
    #: measurement artefact, not evidence about the model's arithmetic, and
    #: must not be reported as a wrong answer without saying so.
    done_reason: str = ""
    truncated: bool = False
    error: str = ""
    meta: dict = field(default_factory=dict)


class Experiment(abc.ABC):
    """Subclass this, implement `scenarios` and `parse`, and you have a dataset."""

    #: Used for output filenames and in the published methodology note.
    name: str = "experiment"

    #: Generation cap. An experiment whose prompts make the models write more
    #: raises this: a cap that truncates the verbose replies does not just lose
    #: rows, it loses them non-randomly, and any comparison across prompt
    #: variants then measures verbosity as much as reasoning.
    num_predict: int = 1024

    def __init__(self, out_dir: Path, client: OllamaClient | None = None) -> None:
        self.out_dir = Path(out_dir)
        self.out_dir.mkdir(parents=True, exist_ok=True)
        self.client = client or OllamaClient()
        self.results_path = self.out_dir / f"{self.name}-raw.jsonl"

    # ---- subclass contract -------------------------------------------------

    @abc.abstractmethod
    def scenarios(self) -> list[Scenario]:
        """The test bank. Every scenario needs a ground-truth answer computed
        independently of any model."""

    @abc.abstractmethod
    def parse(self, output: str) -> float | None:
        """Pull the model's numeric answer out of its prose, or None if it
        never gave one. Kept separate from grading so parse failures are
        distinguishable from wrong answers."""

    def extra_summary(self, rows: list[dict], data_dir: Path) -> None:
        """Write any aggregate the generic summariser cannot know about.

        The generic summary is per (model, scenario), which is the right shape
        for an accuracy benchmark. An experiment whose finding lives in the
        relationship *between* scenarios — a paired comparison, say — overrides
        this to emit that pairing, so the published figure comes out of the
        script rather than out of a spreadsheet no reader can see.
        """

    # ---- run loop ----------------------------------------------------------

    def _completed_keys(self) -> set[tuple[str, str, int]]:
        """(model, scenario_id, rep) tuples already on disk, so a resumed run
        skips them instead of redoing hours of work."""
        done: set[tuple[str, str, int]] = set()
        if not self.results_path.exists():
            return done
        with self.results_path.open(encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                try:
                    row = json.loads(line)
                except json.JSONDecodeError:
                    # A row truncated by a hard shutdown — it will simply be rerun.
                    continue
                done.add((row["model"], row["scenario_id"], row["rep"]))
        return done

    def _append(self, result: Result) -> None:
        with self.results_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(asdict(result)) + "\n")
            handle.flush()

    def _acquire_lock(self) -> Path:
        """Refuse to start if another run is already writing this dataset.

        Two processes appending to the same JSONL do not crash and do not warn:
        they interleave, and the file ends up with the same (model, scenario,
        rep) key recorded twice. Nothing downstream notices, and the duplicated
        scenarios quietly carry double weight in the published accuracy. This
        happened once during the allocation run, so the guard exists.
        """
        lock = self.results_path.with_suffix(".lock")
        stamp = time.strftime("%Y-%m-%d %H:%M:%S")
        try:
            # O_EXCL rather than exists()-then-write: two runs started in the
            # same second would both pass a check-then-create test and both
            # proceed, which is the failure this is here to prevent.
            handle = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError:
            raise RuntimeError(
                f"{lock} exists — another run is writing {self.results_path.name}. "
                f"If no run is active, that is a stale lock from a killed process: "
                f"delete it and rerun."
            ) from None
        with os.fdopen(handle, "w", encoding="utf-8") as fh:
            fh.write(f"pid {os.getpid()} started {stamp}\n")
        return lock

    def run(self, models: list[str], reps: int = 10, base_seed: int = 42) -> None:
        lock = self._acquire_lock()
        try:
            self._run(models, reps, base_seed)
        finally:
            lock.unlink(missing_ok=True)

    def _run(self, models: list[str], reps: int, base_seed: int) -> None:
        scenarios = self.scenarios()
        done = self._completed_keys()
        total = len(models) * len(scenarios) * reps
        if done:
            print(f"resuming: {len(done)} of {total} generations already recorded", flush=True)

        for model in models:
            pending = [
                (s, r)
                for s in scenarios
                for r in range(reps)
                if (model, s.id, r) not in done
            ]
            if not pending:
                print(f"{model}: already complete", flush=True)
                continue

            print(f"\n{model}: {len(pending)} generations to run", flush=True)
            self._warm_up(model, scenarios[0])

            for scenario, rep in pending:
                # Vary the seed per repetition: repeating with one fixed seed
                # measures nothing but cache behaviour.
                seed = base_seed + rep
                self._run_one(model, scenario, rep, seed)

            # Free the card before the next model loads.
            self.client.unload(model)

        print(f"\nwrote {self.results_path}", flush=True)

    def _warm_up(self, model: str, scenario: Scenario) -> None:
        print("  warm-up (discarded)...", end="", flush=True)
        try:
            self.client.generate(model, scenario.prompt, seed=0, num_predict=self.num_predict)
            print(" ok", flush=True)
        except OllamaError as exc:
            print(f" failed: {exc}", flush=True)

    def _run_one(self, model: str, scenario: Scenario, rep: int, seed: int) -> None:
        started = time.time()
        try:
            generation = self.client.generate(
                model, scenario.prompt, seed=seed, num_predict=self.num_predict
            )
        except OllamaError as exc:
            self._append(
                Result(
                    scenario_id=scenario.id,
                    category=scenario.category,
                    model=model,
                    rep=rep,
                    seed=seed,
                    raw_output="",
                    parsed=None,
                    expected=scenario.expected,
                    correct=False,
                    ttft_s=0.0,
                    eval_s=0.0,
                    tokens_per_s=0.0,
                    eval_tokens=0,
                    error=str(exc),
                )
            )
            print(f"  {scenario.id} rep{rep}: ERROR {exc}", flush=True)
            return

        parsed = self.parse(generation.text)
        correct = parsed is not None and abs(parsed - scenario.expected) <= scenario.tolerance

        self._append(
            Result(
                scenario_id=scenario.id,
                category=scenario.category,
                model=model,
                rep=rep,
                seed=seed,
                raw_output=generation.text,
                parsed=parsed,
                expected=scenario.expected,
                correct=correct,
                ttft_s=round(generation.ttft_s, 3),
                eval_s=round(generation.eval_s, 3),
                tokens_per_s=round(generation.tokens_per_s, 2),
                eval_tokens=generation.eval_tokens,
                done_reason=generation.done_reason,
                truncated=generation.truncated,
                meta={
                    "wall_s": round(time.time() - started, 2),
                    "host_os": platform.platform(),
                },
            )
        )
        mark = "CUT " if generation.truncated else ("ok " if correct else "MISS")
        print(
            f"  {scenario.id} rep{rep}: {mark} parsed={parsed} expected={scenario.expected} "
            f"({generation.tokens_per_s:.1f} tok/s)",
            flush=True,
        )

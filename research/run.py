"""Entry point for the local-model experiments.

  python run.py models                          what Ollama currently has
  python run.py run  --reps 10                  run the benchmark (resumable)
  python run.py summarise                       raw JSONL -> dataset.csv

Sized for a 4 GB GPU with 8 GB of system RAM: the default model list is the
3-4B tier, one model resident at a time. Anything 7B or larger will spill to
system RAM on this machine and run at a small fraction of the speed — pass it
explicitly with --models if you want to measure that, which is itself a
publishable number.
"""

from __future__ import annotations

import argparse
import collections
import csv
import json
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from experiments.numeracy import MoneyMathNumeracy  # noqa: E402
from experiments.tax_accuracy import TaxAccuracy  # noqa: E402
from experiments.advice import FinancialAdvice  # noqa: E402
from experiments.allocation import AccountChoice  # noqa: E402
from harness.client import OllamaClient, OllamaError  # noqa: E402

# Experiments available to --experiment. Each writes its own raw/aggregate
# files, so runs never collide.
EXPERIMENTS = {
    "numeracy": MoneyMathNumeracy,
    "tax": TaxAccuracy,
    "advice": FinancialAdvice,
    "allocation": AccountChoice,
}

DATA_DIR = Path(__file__).parent / "data"

# Q4_K_M quantisation, which is what `ollama pull <model>` gives by default.
# Sizes are the on-disk weights; add roughly 1-1.5 GB for the KV cache at
# num_ctx 2048 to get the real VRAM requirement.
DEFAULT_MODELS = [
    "llama3.2:3b",   # ~2.0 GB
    "qwen2.5:3b",    # ~1.9 GB
    "gemma2:2b",     # ~1.6 GB
    "phi3.5:3.8b",   # ~2.2 GB
]


def cmd_models(_: argparse.Namespace) -> int:
    client = OllamaClient()
    try:
        installed = client.available_models()
    except OllamaError as exc:
        print(exc)
        return 1
    if not installed:
        print("Ollama is running but has no models. Pull the default set:\n")
        for model in DEFAULT_MODELS:
            print(f"  ollama pull {model}")
        return 1
    print("installed:")
    for model in installed:
        print(f"  {model}")
    missing = [m for m in DEFAULT_MODELS if m not in installed]
    if missing:
        print("\nnot yet pulled:")
        for model in missing:
            print(f"  ollama pull {model}")
    return 0


def cmd_run(args: argparse.Namespace) -> int:
    models = args.models or DEFAULT_MODELS
    experiment = EXPERIMENTS[args.experiment](out_dir=DATA_DIR)
    try:
        installed = experiment.client.available_models()
    except OllamaError as exc:
        print(exc)
        return 1

    missing = [m for m in models if m not in installed]
    if missing:
        print("These models are not pulled yet:\n")
        for model in missing:
            print(f"  ollama pull {model}")
        return 1

    experiment.run(models=models, reps=args.reps, base_seed=args.seed)
    return 0


def cmd_summarise(args: argparse.Namespace) -> int:
    experiment = EXPERIMENTS[args.experiment](out_dir=DATA_DIR)
    name = experiment.name
    raw_path = DATA_DIR / f"{name}-raw.jsonl"
    if not raw_path.exists():
        print(f"No results yet at {raw_path}. Run `python run.py run` first.")
        return 1

    rows = []
    with raw_path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

    by_model_scenario: dict[tuple[str, str], list[dict]] = collections.defaultdict(list)
    for row in rows:
        by_model_scenario[(row["model"], row["scenario_id"])].append(row)

    out_path = DATA_DIR / f"{name}.csv"
    with out_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "model", "scenario", "category", "reps", "correct", "accuracy",
                "distinct_answers", "expected", "modal_answer",
                "median_tokens_per_s", "median_ttft_s",
            ]
        )
        for (model, scenario), group in sorted(by_model_scenario.items()):
            correct = sum(1 for r in group if r["correct"])
            answers = [r["parsed"] for r in group if r["parsed"] is not None]
            # Distinct answers across repetitions is the stability measure — a
            # model that is right 7 times out of 10 with 4 different answers is
            # a different story from one that is consistently wrong.
            distinct = len(set(answers))
            modal = collections.Counter(answers).most_common(1)[0][0] if answers else ""
            speeds = [r["tokens_per_s"] for r in group if r["tokens_per_s"]]
            ttfts = [r["ttft_s"] for r in group if r["ttft_s"]]
            writer.writerow(
                [
                    model, scenario, group[0]["category"], len(group), correct,
                    round(correct / len(group), 3), distinct, group[0]["expected"], modal,
                    round(statistics.median(speeds), 2) if speeds else "",
                    round(statistics.median(ttfts), 3) if ttfts else "",
                ]
            )

    print(f"wrote {out_path}")

    print("\naccuracy by model:")
    by_model: dict[str, list[dict]] = collections.defaultdict(list)
    for row in rows:
        by_model[row["model"]].append(row)
    for model, group in sorted(by_model.items()):
        correct = sum(1 for r in group if r["correct"])
        speeds = [r["tokens_per_s"] for r in group if r["tokens_per_s"]]
        speed = f"{statistics.median(speeds):.1f} tok/s" if speeds else "n/a"
        print(f"  {model:<16} {correct:>3}/{len(group):<4} {correct / len(group):>6.1%}   {speed}")

    experiment.extra_summary(rows, DATA_DIR)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("models", help="list installed and missing models").set_defaults(func=cmd_models)

    run_parser = sub.add_parser("run", help="run the benchmark (resumable)")
    run_parser.add_argument("--models", nargs="*", help="override the default 3-4B model list")
    run_parser.add_argument("--reps", type=int, default=10, help="repetitions per prompt (default 10)")
    run_parser.add_argument("--seed", type=int, default=42, help="base seed (default 42)")
    run_parser.add_argument("--experiment", choices=sorted(EXPERIMENTS), default="numeracy", help="which experiment to run")
    run_parser.set_defaults(func=cmd_run)

    sum_parser = sub.add_parser("summarise", help="aggregate raw results into dataset.csv")
    sum_parser.add_argument("--experiment", choices=sorted(EXPERIMENTS), default="numeracy")
    sum_parser.set_defaults(func=cmd_summarise)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())

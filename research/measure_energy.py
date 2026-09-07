"""Measures what it actually costs in electricity to run a local model.

  python measure_energy.py --reps 5
  python measure_energy.py --reps 5 --json

Most "run AI at home" writing compares hardware prices, or quotes a GPU's rated
wattage from a spec sheet. Neither is the number a person wants. The question is:
if I generate a thousand tokens on this laptop, what does that cost me?

Method. `nvidia-smi` reports instantaneous GPU power draw. A background sampler
polls it while a generation runs, so each request yields a mean power over its
own duration rather than a nameplate figure. Energy is mean power x wall time,
converted to watt-hours, then divided by tokens produced.

Two decisions that matter:

Marginal, not total. The machine draws power whether or not it is inferring. The
idle baseline is measured first and subtracted, so the figure is the *additional*
energy inference costs — which is the number that changes your bill. Total draw
is reported alongside it, because both are defensible and they differ a lot.

GPU only. This measures the graphics card. CPU, RAM, display, and power-supply
losses are real and unmeasured here; a wall-plug meter would capture them and
this cannot. So the figures are a floor, and the output says so rather than
implying they are the whole story.

The tariff is not hardcoded. Electricity prices vary by country, provider and
consumption band, and inventing one would make every downstream number fiction.
Pass --rate with your actual cost per kWh.
"""

from __future__ import annotations

import argparse
import json
import statistics
import subprocess
import sys
import threading
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from harness.client import OllamaClient, OllamaError  # noqa: E402

NVIDIA_SMI = r"C:\Windows\System32\nvidia-smi.exe"
DATA_DIR = Path(__file__).parent / "data"

# A prompt that produces a substantial, predictable amount of output. Content is
# deliberately mundane — this measures energy per token, not answer quality.
PROMPT = (
    "Explain, in careful detail, how a progressive income tax system works. "
    "Cover marginal versus effective rates, why moving into a higher bracket "
    "does not tax all income at that rate, and how deductions interact with "
    "brackets. Write at least six paragraphs."
)


def sample_power() -> float | None:
    """Instantaneous GPU draw in watts, or None if the card will not report it."""
    try:
        out = subprocess.run(
            [NVIDIA_SMI, "--query-gpu=power.draw", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=10, check=True,
        ).stdout.strip().splitlines()[0]
        return float(out)
    except (subprocess.SubprocessError, ValueError, IndexError):
        return None


class PowerSampler:
    """Polls GPU power on a background thread for the duration of a call."""

    def __init__(self, interval: float = 0.25) -> None:
        self.interval = interval
        self.samples: list[float] = []
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def __enter__(self) -> "PowerSampler":
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        return self

    def _run(self) -> None:
        while not self._stop.is_set():
            watts = sample_power()
            if watts is not None:
                self.samples.append(watts)
            self._stop.wait(self.interval)

    def __exit__(self, *exc) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=5)

    @property
    def mean(self) -> float | None:
        return statistics.mean(self.samples) if self.samples else None

    @property
    def peak(self) -> float | None:
        return max(self.samples) if self.samples else None


def measure_idle(seconds: float = 12.0) -> float:
    """Baseline draw with nothing running, to isolate inference's marginal cost."""
    print(f"measuring idle baseline for {seconds:.0f}s...", end="", flush=True)
    with PowerSampler() as sampler:
        time.sleep(seconds)
    idle = sampler.mean
    print(f" {idle:.2f} W" if idle is not None else " unavailable", flush=True)
    if idle is None:
        raise SystemExit("GPU will not report power draw; cannot measure energy.")
    return idle


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--models", nargs="*", help="models to measure")
    parser.add_argument("--reps", type=int, default=5, help="generations per model")
    parser.add_argument("--rate", type=float, default=None,
                        help="electricity cost per kWh in your currency; omit to report energy only")
    parser.add_argument("--currency", default="NPR", help="label for --rate")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    client = OllamaClient()
    try:
        installed = client.available_models()
    except OllamaError as exc:
        print(exc, flush=True)
        return 1
    models = args.models or installed
    missing = [m for m in models if m not in installed]
    if missing:
        print("not pulled: " + ", ".join(missing), flush=True)
        return 1

    idle_w = measure_idle()
    results = []

    for model in models:
        print(f"\n{model}", flush=True)
        # Discard a warm-up so model load does not land inside a measured run.
        try:
            client.generate(model, "Say OK.", seed=0, num_predict=16)
        except OllamaError as exc:
            print(f"  warm-up failed: {exc}", flush=True)
            continue

        runs = []
        for rep in range(args.reps):
            started = time.time()
            with PowerSampler() as sampler:
                try:
                    gen = client.generate(model, PROMPT, seed=42 + rep, num_predict=768)
                except OllamaError as exc:
                    print(f"  rep{rep}: ERROR {exc}", flush=True)
                    continue
            wall = time.time() - started
            mean_w, peak_w = sampler.mean, sampler.peak
            if mean_w is None or gen.eval_tokens == 0:
                print(f"  rep{rep}: no power samples or no tokens, skipped", flush=True)
                continue

            total_wh = mean_w * wall / 3600
            marginal_wh = max(0.0, (mean_w - idle_w)) * wall / 3600
            runs.append({
                "rep": rep,
                "tokens": gen.eval_tokens,
                "wall_s": round(wall, 2),
                "tokens_per_s": round(gen.tokens_per_s, 2),
                "mean_w": round(mean_w, 2),
                "peak_w": round(peak_w, 2),
                "total_wh": total_wh,
                "marginal_wh": marginal_wh,
                "samples": len(sampler.samples),
            })
            print(f"  rep{rep}: {gen.eval_tokens} tok in {wall:.1f}s  "
                  f"{mean_w:.1f}W mean / {peak_w:.1f}W peak  "
                  f"{marginal_wh * 1000 / gen.eval_tokens:.3f} mWh/token", flush=True)

        client.unload(model)
        if not runs:
            continue

        tokens = sum(r["tokens"] for r in runs)
        summary = {
            "model": model,
            "reps": len(runs),
            "total_tokens": tokens,
            "median_tokens_per_s": round(statistics.median(r["tokens_per_s"] for r in runs), 2),
            "mean_power_w": round(statistics.mean(r["mean_w"] for r in runs), 2),
            "peak_power_w": round(max(r["peak_w"] for r in runs), 2),
            "wh_per_1k_tokens_total": round(sum(r["total_wh"] for r in runs) / tokens * 1000, 4),
            "wh_per_1k_tokens_marginal": round(sum(r["marginal_wh"] for r in runs) / tokens * 1000, 4),
            "runs": runs,
        }
        if args.rate is not None:
            per_kwh = args.rate
            summary["cost_per_1m_tokens_marginal"] = round(
                summary["wh_per_1k_tokens_marginal"] * 1000 / 1000 * per_kwh, 4
            )
            summary["cost_per_1m_tokens_total"] = round(
                summary["wh_per_1k_tokens_total"] * 1000 / 1000 * per_kwh, 4
            )
        results.append(summary)

    payload = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "idle_watts": round(idle_w, 2),
        "gpu_only": True,
        "note": "GPU draw only. CPU, RAM, display and PSU losses are unmeasured, so these are a floor.",
        "electricity_rate": args.rate,
        "currency": args.currency if args.rate is not None else None,
        "models": results,
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out = DATA_DIR / "energy.json"
    out.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    if args.json:
        print(json.dumps(payload, indent=2), flush=True)
        return 0

    print(f"\nidle baseline: {idle_w:.2f} W\n", flush=True)
    print(f"{'model':<16}{'tok/s':>8}{'mean W':>9}{'peak W':>9}{'Wh/1k tok':>12}{'marginal':>11}", flush=True)
    for r in results:
        print(f"{r['model']:<16}{r['median_tokens_per_s']:>8.1f}{r['mean_power_w']:>9.1f}"
              f"{r['peak_power_w']:>9.1f}{r['wh_per_1k_tokens_total']:>12.4f}"
              f"{r['wh_per_1k_tokens_marginal']:>11.4f}", flush=True)
    if args.rate is not None:
        print(f"\ncost per 1M tokens at {args.rate} {args.currency}/kWh:", flush=True)
        for r in results:
            print(f"  {r['model']:<16}{r['cost_per_1m_tokens_marginal']:>10.3f} {args.currency}"
                  f"  (marginal)   {r['cost_per_1m_tokens_total']:>8.3f}  (total draw)", flush=True)
    else:
        print("\npass --rate <cost per kWh> to convert energy into money.", flush=True)
    print(f"\nwrote {out}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

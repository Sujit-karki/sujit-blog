# research/

Harness for the original-data posts. The model is the **instrument**, never the
author: this code produces a dataset, and the analysis written around that
dataset is written by hand. No text produced by a model here is published as
prose.

## Why this shape

The first experiment is a **money-math numeracy benchmark** for small local
models — can a 3–4B model be trusted with the arithmetic behind ordinary
personal-finance decisions?

That question was chosen to fit the hardware rather than in spite of it. The
measurement machine is a GTX 1650 Ti with **4 GB of VRAM and 7.8 GB of system
RAM**. Models of 7B and up spill from VRAM into system memory here and slow to
a crawl, so a benchmark spanning 8B–12B models is not runnable. "What can a
small model actually compute on a cheap laptop" is a question this machine can
answer honestly, and one that most published benchmarks — run on datacentre
GPUs — do not.

## Method

**Ground truth.** Every expected value is computed by hand from a closed-form
formula, recorded in the scenario's `note`, and verified against an independent
recomputation. No model, and no library, is consulted for a correct answer.
Where a scenario would otherwise depend on current tax law, the brackets are
supplied *in the prompt* — the test is arithmetic, not recall of this year's
tables.

**Determinism.** `temperature 0`, an explicit `seed`, and an explicit `num_ctx`
are all set. Temperature alone is not enough: GPU floating-point reduction order
varies between runs. Even with all three, occasional divergence is expected —
which is exactly why each prompt is repeated rather than sampled once.

**Warm-up discard.** The first generation after a model loads differs from
later ones, so one throwaway call per model is made and excluded.

**Repetition and variance.** Each prompt runs 10 times with a different seed per
repetition. The summary reports `distinct_answers` alongside accuracy, because
"right 7 times out of 10 across 4 different answers" and "consistently wrong"
are different findings and only one of them is interesting.

**Checkpointing.** Results append to JSONL after every single generation, and
runs resume by skipping `(model, scenario, rep)` keys already on disk. This
laptop thermally throttles under sustained load; a run that dies at hour three
must not cost three hours.

**Parsing.** Prompts require a final `ANSWER: <number>` line. If a model ignores
the format, the last number anywhere in the reply is used instead, so a model is
scored on its arithmetic rather than its instruction-following — format
compliance is reported separately.

## Running it

Ollama must be installed and serving (`ollama serve`).

```bash
cd research
python run.py models        # what is installed, and what to pull
python run.py run           # the benchmark; resumable, safe to interrupt
python run.py summarise     # raw JSONL -> data/numeracy.csv
```

Default model set (Q4_K_M, which is what `ollama pull` gives by default):

| model | on-disk | fits 4 GB VRAM |
|---|---|---|
| `llama3.2:3b` | ~2.0 GB | yes |
| `qwen2.5:3b` | ~1.9 GB | yes |
| `gemma2:2b` | ~1.6 GB | yes |
| `phi3.5:3.8b` | ~2.2 GB | tight |

Add roughly 1–1.5 GB for the KV cache at `num_ctx 2048` to get the real VRAM
requirement. Pass `--models` to measure something larger deliberately; the
resulting tokens/sec on a spilled model is itself a publishable number.

**Before a long run:** stop the Next.js dev server. With 7.8 GB of system RAM it
competes with the model for memory.

## What gets committed

- the harness and experiment definitions — always
- `data/numeracy.csv`, the aggregated dataset — once a run is final
- `data/*-raw.jsonl` — gitignored; regenerate it by rerunning

## Adding an experiment

Subclass `Experiment`, implement `scenarios()` and `parse()`. The base class
handles seeding, warm-up discard, checkpointing, resume, and per-generation
metrics, so a new experiment is a test bank plus a parser.

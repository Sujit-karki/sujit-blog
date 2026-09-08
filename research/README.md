# research/

Public at
[github.com/Sujit-karki/sujit-blog](https://github.com/Sujit-karki/sujit-blog) —
every script here produces a dataset that a published post links to, and the
posts link back to these files by name. The datasets themselves are also served
from the site under `/data/`, so a reader can take a CSV without cloning
anything.

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

**Truncation.** `num_predict` is 1024 and every result records Ollama's
`done_reason`. The first run used 512 and silently cut off 20 generations, all
of them the most verbose model on the two hardest questions — the replies ended
on the bare word `ANSWER` with the number lost, so the model was being penalised
for showing its work. A `truncated` row is a measurement artefact and must never
be reported as a wrong answer. Re-running those 20 at 1024 returned identical
answers, so the published figures were unaffected, but only by luck.

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

`--experiment` selects which test bank runs; `numeracy` is the default.

| `--experiment` | what it measures | dataset |
|---|---|---|
| `numeracy` | money arithmetic against closed-form answers | `data/numeracy.csv` |
| `tax` | progressive tax, brackets supplied in the prompt | `data/tax-accuracy.csv` |
| `advice` | properties of free-text answers to money questions | `data/advice-raw.jsonl` |
| `allocation` | which account a model picks, named vs anonymous | `data/allocation.csv` |

## Licence and citation

The datasets in `data/` are **CC BY 4.0** (`LICENSE-DATA`): reuse them for
anything, including commercially, as long as you credit the source. The harness
and site code are **MIT** (`LICENSE`). Attribution is the whole point of the
split — it is the mechanism that turns someone else's reuse into a citation.

`CITATION.cff` renders as "Cite this repository" on GitHub and is what a
reference manager reads. `.zenodo.json` is the deposit metadata Zenodo uses
when it archives a release.

To mint a DOI: link this repository on
[zenodo.org/account/settings/github](https://zenodo.org/account/settings/github),
then cut a GitHub release. Zenodo archives the tagged snapshot and issues a
concept DOI that always resolves to the newest version, plus a version DOI
fixed to that release. Put the concept DOI in `ZENODO_CONCEPT_DOI` in
`lib/datasets-config.ts` and every dataset's structured data gains an
`identifier`; the test suite checks its shape, and until it is set the property
is omitted rather than emitted empty.

### Scripts that are not model experiments

Some measurements here involve no model at all. They live alongside the harness
because they produce datasets for the same posts, under the same rule: the
figures come from primary documents, and every one is checked against something
independent before it is published.

| script | what it measures | dataset |
|---|---|---|
| `platform_take.py` | what selling platforms keep per dollar transacted, from SEC filings | `data/platform-take.csv` |
| `readability.py` | reading difficulty of fetched documents | `data/readability.json` |
| `policy_length.py` | length and reading time of privacy policies | `data/policy-length.json` |
| `measure_energy.py` | GPU power draw during local inference | `data/energy.json` |

`platform_take.py` takes revenue from XBRL, which is structured, and gross
volume from the filing narrative, which is not. Reading numbers out of prose is
the part that goes wrong, so it refuses to run rather than guess: the unit scale
declared per company must match the scale the filing states near the figure,
gross volume must exceed revenue, and the rate must be plausible. Where a
company publishes its own take rate on the same basis — Etsy and eBay both do —
recomputing it must reproduce their figure. That check caught a real error, and
column order is the other trap: the current year is the first figure for Etsy
and Lyft, the second for Uber and Airbnb, and the third for DoorDash.

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

### The paired framing test

`allocation` is shaped differently from the others and the difference is the
point. Eight savings-account cases are each asked **twice**: once with the
options carrying their real names — 529 plan, Trump Account, taxable brokerage
— and once with the identical rules, identical numbers and identical order,
labelled only Option 1/2/3. Every fact needed to compute the answer is in both
prompts. Nothing is withheld from the anonymous version.

So a model that computes must answer the two the same way, and the gap between
them measures how much the label alone moves the answer. That comparison is
what `data/allocation-pairs.csv` holds: one row per model and case, with both
answers side by side and a `flipped` column.

Three design choices keep the comparison honest:

- **The option order rotates per case.** If the right answer sat in slot 1
  throughout, a model that always says "1" would score well and the result
  would be measuring position bias while claiming to measure reasoning.
- **The cases straddle the crossover.** Four are won by the Trump Account,
  because a free $1,000 seed compounding for eighteen years beats the tax drag
  when contributions are small or the bracket is low; four are won by the 529.
  Three are decided by under 1% of the balance. A test bank where one answer is
  always right cannot distinguish computing from reciting, which is the whole
  question.
- **`num_predict` is 2048, not 1024.** Valuing three accounts takes more tokens
  than valuing one, and at 1024 the smoke test truncated the *named* prompts
  more often than the anonymous ones — the models spend tokens restating
  account names. Truncation landing harder on one arm of a paired comparison
  would have manufactured the finding.

The known limitation, which the post states too: anonymising removes the
*name*, not the recognisability. "Withdrawals for qualified education expenses
are not taxed" is the 529's defining rule, so a model with any domain knowledge
can still identify the account from its description. The test bounds the effect
of the label, not of all prior knowledge.

### The non-model scripts

Not everything here needs Ollama. `readability.py`, `policy_length.py` and
`measure_energy.py` measure documents and hardware rather than models, and run
standalone:

```bash
python readability.py           # Flesch scores over the whitepaper corpus
python policy_length.py         # privacy policy length and reading level
python measure_energy.py        # GPU power draw during generation
```

**On corpora that fail to resolve.** `readability.py` attempts thirteen crypto
documents and currently resolves eight. The five that fail — three 404s at the
URL the project's own site publishes, two pages with too little continuous prose
— stay in `DOCUMENTS` rather than being deleted. A corpus you quietly prune
drifts toward whatever happens to support the argument, and here the failures
are themselves a finding about the genre. The script reports them; the post
reports them.

This matters more than it sounds. The first version of the readability post ran
five documents and concluded that *every* whitepaper measured was harder to read
than the tax code. Widening the corpus to thirteen falsified that within a day:
Monero's *Zero to Monero* scores above IRS Publication 17. The claim had been
true of the sample and false of the world, which is the failure mode a small
convenience sample produces by default. Widen the corpus before publishing the
strong version of a claim, not after.

## Checking cited sources

```bash
npm run audit:links             # from the repo root
```

Verifies every external URL across every post still resolves. Deliberately not a
CI gate — it depends on third-party hosts being up and not rate-limiting, so as
a merge gate it would fail for reasons unrelated to the commit. Run it, read it,
judge each failure. Hosts that refuse automated requests are reported as
UNVERIFIED rather than BROKEN, because a 403 to a bot is not evidence a page is
gone.

## Results — first run, 1 September 2026

GTX 1650 Ti (4 GB), 8 GB system RAM, Ollama 0.33.2, Q4_K_M weights, 8 scenarios
× 10 repetitions = 80 generations per model.

| model | correct | accuracy | median tok/s |
|---|---|---|---|
| `qwen2.5:3b` | 60/80 | 75.0% | 52.5 |
| `phi3.5:3.8b` | 50/80 | 62.5% | 27.8 |
| `llama3.2:3b` | 30/80 | 37.5% | 47.3 |
| `gemma2:2b` | 10/80 | 12.5% | 52.3 |

**Every model failed `marginal-tax` and `mortgage-payment`** — the two scenarios
with real money attached. The ones they get right are largely single
multiplications.

**Determinism.** 31 of the 32 scenario-model pairs returned an identical answer
across all 10 repetitions — right or wrong, the models commit. The exception is
`phi3.5:3.8b` on `mortgage-payment`, which split 9/1 between 1796.39 and
1795.96; both are wrong. Repeating a prompt is therefore not a usable defence
against these errors.

**Reproducibility.** Three of the four models were run twice, hours apart, under
very different system load. All 240 overlapping generations returned identical
answers, and per-model accuracy was unchanged.

**A caveat the write-up must carry:** tolerances do real work in these numbers.
`phi3.5:3.8b` answers the compound-interest question with 16288.0 against a true
16288.95 — scored wrong, and it is wrong, but by 95 cents on a $16,289 balance.
Anyone quoting the headline accuracy should say where the line was drawn.

## What gets committed

- the harness and experiment definitions — always
- `data/numeracy.csv`, the aggregated dataset
- `data/numeracy-raw.jsonl`, every raw generation — this is the evidence
- `data/numeracy-pilot-contended.jsonl`, the earlier run kept for the
  reproducibility comparison above

## Adding an experiment

Subclass `Experiment`, implement `scenarios()` and `parse()`. The base class
handles seeding, warm-up discard, checkpointing, resume, and per-generation
metrics, so a new experiment is a test bank plus a parser.

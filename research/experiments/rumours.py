"""Given the rumour and the announcement side by side, which does a model believe?

The recency experiment asked about Apple's 9 September 2026 lineup cold, and all
four models refused: none can know a price announced after it stopped learning.
That is the right answer and a useless one. Nobody asks a model a current
question cold. They paste in what they found -- and in the week of an Apple
event, most of what there is to find is rumour.

So this hands the models the evidence. Every passage is a real, dated claim:

  official  Apple's own press releases of 9 September 2026
  rumour    TrendForce's estimate as reported by MacRumors on 3 September
            2026, six days before the event -- wrong on every product

Price questions are asked in five arms:

  bare      the question alone, byte-identical to the recency prompt, so this
            arm is a replication of a published dataset
  official  only Apple's announcement in context
  rumour    only the pre-event estimate in context, labelled as one
  both-ro   rumour first, then the announcement
  both-or   the announcement first, then the rumour

The order is varied because small models are known to lean on whatever they read
last. A single order would confound "trusts the official source" with "trusts
the final passage", and the two readings lead to opposite advice.

Verdict questions are the rumour check proper. The model gets the pre-event
claim and Apple's announcement and is asked whether the claim was right. Four
claims were wrong (TrendForce on the Pro, Pro Max and Duo; Fubon Research's
$2,399 foldable) and two were right (Mark Gurman's $100-per-model increase,
checkable only against last year's price, which is supplied from Apple's 2025
release). Without true claims in the bank, a model that answered NO to
everything would score perfectly, and the test would measure nothing.

Passages are condensed from the reports rather than quoted whole; each keeps the
figure, the attribution and the date exactly as reported. Apple's sentences are
quoted verbatim. SOURCES records where each came from and when it was read.

A limitation the post has to carry: TrendForce's iPhone 18 Pro range tops out at
$1,299, which is also the real Pro Max price and sits in the same Apple
sentence. A Pro answer of $1,299 in a both-sources arm cannot be cleanly called
rumour adoption -- it may be the Pro Max figure read off the wrong clause -- so
the summariser reports those replies as ambiguous rather than counting them.

Scoring is objective string properties only. No model judges another.
"""

from __future__ import annotations

import re

from experiments.recency import INSTRUCTION as BARE_INSTRUCTION
from experiments.recency import REFUSAL, extract_prices
from harness.experiment import Experiment, Scenario

# Where every figure below came from, read on 2026-09-10.
SOURCES = {
    "apple-18-pro": "apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/ (2026-09-09)",
    "apple-duo": "apple.com/newsroom/2026/09/apple-unveils-iphone-duo/ (2026-09-09)",
    "apple-17-pro": "apple.com/newsroom/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/ (2025-09-09)",
    "trendforce": "macrumors.com/2026/09/03/iphone-18-pro-prices-apple-event-next-week/ (Tim Hardwick, 2026-09-03)",
    "fubon": "techrepublic.com/article/news-iphone-ultra-rumor-foldable/ (Liz Ticong, 2025-11-26)",
    "gurman": "macrumors.com/2026/09/09/iphone-18-pro-price-hike-to-be-lower-than-expected/ (Hartley Charlton, 2026-09-09 04:00 PDT)",
}

APPLE_PRO_SENTENCE = (
    'Apple\'s press release of 9 September 2026 says: "iPhone 18 Pro starts at '
    "$1,199 (U.S.) or $49.95 (U.S.) per month, and iPhone 18 Pro Max starts at "
    '$1,299 (U.S.) or $54.12 (U.S.) per month for 24 months."'
)
APPLE_DUO_SENTENCE = (
    'Apple\'s press release of 9 September 2026 says: "iPhone Duo is available in '
    "star white and night sky, and starts at $1,999 (U.S.), or $83.29 (U.S.) per "
    'month for 24 months, in 256GB, 512GB, 1TB, and 2TB storage capacities."'
)

# Last year's starting prices, needed only to check Gurman's "+$100" claim.
IPHONE_17_PRO = 1099.0
IPHONE_17_PRO_MAX = 1199.0

# (product id, question, official price, official passage, rumour passage,
#  rumour range)
PRODUCTS = [
    (
        "pro",
        "What is the starting price in US dollars of the iPhone 18 Pro?",
        1199.0,
        APPLE_PRO_SENTENCE,
        "A MacRumors report on 3 September 2026, six days before Apple's event, "
        "said research firm TrendForce expects the iPhone 18 Pro starting price "
        "to jump to between $1,249 and $1,299.",
        (1249.0, 1299.0),
    ),
    (
        "promax",
        "What is the starting price in US dollars of the iPhone 18 Pro Max?",
        1299.0,
        APPLE_PRO_SENTENCE,
        "A MacRumors report on 3 September 2026, six days before Apple's event, "
        "said research firm TrendForce expects the iPhone 18 Pro Max to start "
        "between $1,349 and $1,399.",
        (1349.0, 1399.0),
    ),
    (
        "duo",
        "How much does Apple's foldable iPhone Duo cost in the United States?",
        1999.0,
        APPLE_DUO_SENTENCE,
        "A MacRumors report on 3 September 2026, six days before Apple's event, "
        "said research firm TrendForce expects Apple's first foldable iPhone, the "
        "iPhone Duo, to start anywhere between $2,099 and $2,299.",
        (2099.0, 2299.0),
    ),
]

ARMS = ("bare", "official", "rumour", "both-ro", "both-or")

CONTEXT_INSTRUCTION = (
    "Use the information below to answer the question in one or two sentences. "
    "If the information does not settle the answer, say so plainly instead of "
    "guessing. Do not invent a number.\n\n"
    "Information:\n{passages}\n\n"
    "Question: {question}"
)

VERDICT_INSTRUCTION = (
    "Below is a claim made before Apple's 9 September 2026 event, followed by "
    "what Apple announced. Was the claim correct about the {product}'s US "
    "starting price? Start your reply with VERDICT: YES or VERDICT: NO, then "
    "state the actual starting price in one sentence.\n\n"
    "Claim made before the event:\n{claim}\n\n"
    "What Apple announced:\n{official}{reference}"
)

GURMAN_CLAIM = (
    "A MacRumors report on the morning of 9 September 2026, before Apple's "
    "event, said Bloomberg's Mark Gurman reported that Apple will increase the "
    "price of its high-end iPhones by just $100 per model."
)

# (case id, product name, claim, official passage, reference line,
#  claim was correct, official price)
VERDICTS = [
    ("trendforce-pro", "iPhone 18 Pro", PRODUCTS[0][4], APPLE_PRO_SENTENCE, "", False, 1199.0),
    ("trendforce-promax", "iPhone 18 Pro Max", PRODUCTS[1][4], APPLE_PRO_SENTENCE, "", False, 1299.0),
    ("trendforce-duo", "iPhone Duo", PRODUCTS[2][4], APPLE_DUO_SENTENCE, "", False, 1999.0),
    (
        "fubon-duo",
        "iPhone Duo",
        "A TechRepublic report on 26 November 2025 said Fubon Research analyst "
        "Arthur Liao's note pegs a 2026 foldable iPhone at about $2,399.",
        APPLE_DUO_SENTENCE,
        "",
        False,
        1999.0,
    ),
    (
        "gurman-pro",
        "iPhone 18 Pro",
        GURMAN_CLAIM,
        APPLE_PRO_SENTENCE,
        f"\n\nFor comparison, Apple's 2025 press release gave the iPhone 17 Pro's "
        f"US starting price as ${IPHONE_17_PRO:,.0f}.",
        True,
        1199.0,
    ),
    (
        "gurman-promax",
        "iPhone 18 Pro Max",
        GURMAN_CLAIM,
        APPLE_PRO_SENTENCE,
        f"\n\nFor comparison, Apple's 2025 press release gave the iPhone 17 Pro "
        f"Max's US starting price as ${IPHONE_17_PRO_MAX:,.0f}.",
        True,
        1299.0,
    ),
]

# Words that mark a figure as someone's estimate rather than a fact. A rumour
# price stated alongside one of these is attributed; without any, the model has
# laundered an estimate into an answer.
ATTRIBUTION = [
    "trendforce", "estimate", "expected", "expects", "expectation", "rumor",
    "rumour", "report", "predict", "forecast", "according to", "anticipat",
    "speculat", "not confirmed", "unconfirmed", "not official", "before the event",
    "before apple", "may ", "might", "could", "likely", "projected",
    # phi3.5:3.8b hedges by describing the passage rather than the phone: "does
    # not specify an exact starting price; it only gives a range". Missing these
    # scored five of its rumour-arm replies as laundering a rumour into fact,
    # which reading the text showed they were not. Re-scored from stored output.
    "not specif", "cannot be determined", "does not state", "only gives",
]

_VERDICT_RE = re.compile(r"VERDICT\s*[:\-]?\s*\**\s*(YES|NO)\b", re.IGNORECASE)
_LEADING_RE = re.compile(r"^\W*(yes|no)\b", re.IGNORECASE)
_RISE_RE = re.compile(r"\$\s?100\b(?![,.]\d)")


def _verify() -> None:
    """Refuse to import if a constant and its quoted source disagree.

    Every price the scorer compares against also appears inside a passage the
    model reads. If someone edits one and not the other, the test would grade
    models against a number they were never shown.
    """
    for pid, _q, official, passage, rumour, (lo, hi) in PRODUCTS:
        assert official in extract_prices(passage), f"{pid}: official price not in passage"
        shown = extract_prices(rumour)
        assert lo in shown and hi in shown, f"{pid}: rumour range not in passage"
    for case, _p, claim, official_passage, reference, was_right, price in VERDICTS:
        assert price in extract_prices(official_passage), f"{case}: price not in passage"
        if case.startswith("gurman"):
            base = IPHONE_17_PRO if case == "gurman-pro" else IPHONE_17_PRO_MAX
            assert (price - base == 100.0) == was_right, f"{case}: truth label is wrong"
            assert base in extract_prices(reference), f"{case}: reference price missing"


_verify()


def _passages(*texts: str) -> str:
    return "\n\n".join(f"- {t}" for t in texts)


def _scenarios() -> list[Scenario]:
    out: list[Scenario] = []
    for pid, question, official, official_passage, rumour, _range in PRODUCTS:
        for arm in ARMS:
            if arm == "bare":
                prompt = BARE_INSTRUCTION + question
            else:
                chosen = {
                    "official": (official_passage,),
                    "rumour": (rumour,),
                    "both-ro": (rumour, official_passage),
                    "both-or": (official_passage, rumour),
                }[arm]
                prompt = CONTEXT_INSTRUCTION.format(passages=_passages(*chosen), question=question)
            out.append(
                Scenario(
                    id=f"{pid}-{arm}",
                    prompt=prompt,
                    # `correct` in the raw rows means "named Apple's price". That
                    # is the right reading for the official and both arms; in the
                    # bare and rumour arms the model was never shown that price, so
                    # the summariser reads those arms by property instead.
                    expected=official,
                    tolerance=0.5,
                    category=arm,
                    note=f"official ${official:,.0f}",
                )
            )
    for case, product, claim, official_passage, reference, was_right, price in VERDICTS:
        out.append(
            Scenario(
                id=f"verdict-{case}",
                prompt=VERDICT_INSTRUCTION.format(
                    product=product, claim=claim, official=official_passage, reference=reference
                ),
                expected=price,
                tolerance=0.5,
                category="verdict",
                note=f"claim was {'correct' if was_right else 'wrong'}",
            )
        )
    return out


SCENARIOS = _scenarios()


def verdict_of(text: str) -> str | None:
    """'yes', 'no', or None when the reply commits to neither."""
    m = _VERDICT_RE.search(text)
    if m:
        return m.group(1).lower()
    m = _LEADING_RE.search(text)
    return m.group(1).lower() if m else None


def score_response(text: str, rumour_range: tuple[float, float] | None, official: float) -> dict:
    prices = extract_prices(text)
    low = text.lower()
    in_rumour = [
        p for p in prices if rumour_range and rumour_range[0] <= p <= rumour_range[1]
    ]
    return {
        "prices": prices,
        "stated_official": official in prices,
        "stated_rumour": bool(in_rumour),
        "attributed": any(term in low for term in ATTRIBUTION),
        "abstained": any(term in low for term in REFUSAL) and not prices,
        "verdict": verdict_of(text),
        "followed_format": bool(_VERDICT_RE.search(text)),
    }


class RumourCheck(Experiment):
    """Which source a model believes when it is shown both."""

    name = "rumours"

    def scenarios(self) -> list[Scenario]:
        return SCENARIOS

    def parse(self, output: str) -> float | None:
        """Apple's price if the reply names it anywhere, else the first figure.

        The first-figure rule used by recency would mark "TrendForce said
        $1,249-$1,299, but Apple set $1,199" as wrong, which it is not. The
        rumour/official split is scored separately in extra_summary; this only
        feeds the generic `correct` column.
        """
        prices = extract_prices(output)
        if not prices:
            return None
        for price in prices:
            if price in {p[2] for p in PRODUCTS}:
                return price
        return prices[0]

    def extra_summary(self, rows: list[dict], data_dir) -> None:
        """Write the two tables every figure in the post is read from."""
        import collections
        import csv
        import pathlib

        products = {p[0]: p for p in PRODUCTS}
        verdicts = {v[0]: v for v in VERDICTS}
        arm_rows: dict[tuple[str, str, str], list[dict]] = collections.defaultdict(list)
        verdict_rows: dict[tuple[str, str], list[dict]] = collections.defaultdict(list)

        for row in rows:
            sid = row["scenario_id"]
            if sid.startswith("verdict-"):
                verdict_rows[(row["model"], sid.removeprefix("verdict-"))].append(row)
            else:
                pid, _, arm = sid.partition("-")
                arm_rows[(row["model"], pid, arm)].append(row)

        arms_path = pathlib.Path(data_dir) / f"{self.name}-arms.csv"
        with arms_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            # Outcomes are exclusive, in this order of precedence:
            #   right_price     named Apple's figure for the product asked about
            #   wrong_clause    named a *different* figure from Apple's sentence --
            #                   the Pro price for the Pro Max question, say. A
            #                   misread of the official source, not belief in the
            #                   rumour, and the first pass conflated the two.
            #   adopted_rumour  named a rumour figure and nothing from Apple
            #   other_number    named some other figure
            #   no_number       named nothing
            # cited_rumour and rumour_as_fact cut across those: a right answer
            # that also mentions the estimate is still a right answer.
            columns = (
                "right_price", "wrong_clause", "adopted_rumour", "other_number", "no_number",
                "cited_rumour", "rumour_as_fact", "abstained",
            )
            writer.writerow(["model", "product", "arm", "n", *columns])
            for (model, pid, arm), group in sorted(arm_rows.items()):
                _pid, _q, official, _op, _rp, rng = products[pid]
                # Every figure the model was shown from Apple in this arm. The
                # Pro and Pro Max share one sentence, so each question's context
                # carries the other phone's price too.
                if arm in ("official", "both-ro", "both-or"):
                    shown_official = {1199.0, 1299.0} if pid in ("pro", "promax") else {1999.0}
                else:
                    shown_official = set()
                counts = collections.Counter()
                for r in group:
                    s = score_response(r["raw_output"], rng, official)
                    prices = set(s["prices"])
                    if s["stated_official"]:
                        outcome = "right_price"
                    elif prices & shown_official:
                        outcome = "wrong_clause"
                    elif s["stated_rumour"]:
                        outcome = "adopted_rumour"
                    elif prices:
                        outcome = "other_number"
                    else:
                        outcome = "no_number"
                    counts[outcome] += 1
                    counts["cited_rumour"] += s["stated_rumour"]
                    counts["rumour_as_fact"] += outcome == "adopted_rumour" and not s["attributed"]
                    counts["abstained"] += s["abstained"]
                writer.writerow([model, pid, arm, len(group), *(counts[c] for c in columns)])

        verdict_path = pathlib.Path(data_dir) / f"{self.name}-verdicts.csv"
        with verdict_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(
                [
                    "model", "case", "claim_was_correct", "n", "said_yes", "said_no",
                    "no_verdict", "right_verdict", "followed_format", "stated_official",
                    "named_100_rise",
                ]
            )
            for (model, case), group in sorted(verdict_rows.items()):
                _c, _p, _claim, _op, _ref, was_right, price = verdicts[case]
                said = collections.Counter(verdict_of(r["raw_output"]) for r in group)
                right = said["yes"] if was_right else said["no"]
                formatted = sum(bool(_VERDICT_RE.search(r["raw_output"])) for r in group)
                stated = sum(price in extract_prices(r["raw_output"]) for r in group)
                # A reply that says NO to "prices rise $100" while itself stating
                # the rise was $100 has done the arithmetic and then contradicted
                # it. Counted for the Gurman cases, where that is the whole claim.
                rise = sum(bool(_RISE_RE.search(r["raw_output"])) for r in group)
                writer.writerow(
                    [model, case, was_right, len(group), said["yes"], said["no"],
                     said[None], right, formatted, stated, rise]
                )

        print(f"wrote {arms_path}\nwrote {verdict_path}")

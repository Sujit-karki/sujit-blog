"""Does naming the account change which account a model picks?

The earlier experiments measured arithmetic: a number is right or wrong. This
measures a *recommendation*, which is what someone actually asks a model for --
"where should this money go?" -- and it is built to separate two things that
look identical from the outside:

  computing   working the after-tax balance of each option and comparing them
  reciting    repeating the received wisdom that a 529 is the college account

Design. Eight parameter cases (contribution, years, tax bracket at withdrawal)
are each asked twice, in two framings that are *arithmetically identical*:

  named       the options carry their real names -- 529 plan, Trump Account,
              taxable brokerage
  anonymous   the same three options, same order, same rules, same numbers,
              labelled only Option 1 / Option 2 / Option 3

Every rule needed to compute the answer is stated in the prompt in both
framings. Nothing is withheld from the anonymous version and nothing is added
to the named one; the names are the only difference. So a model that computes
must answer both the same way, and any gap between the two is the size of the
label's pull on the answer.

The cases are chosen to straddle the crossover rather than to sit on one side
of it. In four of the eight the Trump Account wins, because a free $1,000 seed
compounding for eighteen years outruns the tax drag when contributions are
small or the bracket is low; in the other four the 529 wins. Several are
decided by well under 1% of the balance, which is precisely where a recited
rule of thumb and a computed answer come apart.

The taxable brokerage is a distractor. Under the stated assumptions -- the
whole balance spent on qualified education -- it is strictly dominated by the
529: same contributions, same growth, and a capital-gains bill the 529 does not
pay. It can never be the right answer, so picking it is an unambiguous error
rather than a judgement call.

Ground truth. Computed here from the closed-form annuity formula, and
independently recomputed year by year in a loop; the module refuses to import
if the two disagree by more than a cent. The same formulas drive the site's
Trump-Account-vs-529 calculator, so a reader can reproduce any row by hand.
"""

from __future__ import annotations

import re

from harness.experiment import Experiment, Scenario

GROWTH = 0.07
#: The one-time government seed deposit that only the Trump Account receives.
SEED = 1_000.0
#: Long-term capital gains rate applied to the brokerage account's growth.
LTCG = 0.15

TRUMP, PLAN529, BROKERAGE = "trump", "529", "brokerage"

NAMES = {
    TRUMP: "Trump Account",
    PLAN529: "529 college savings plan",
    BROKERAGE: "taxable brokerage account",
}


# ---- the arithmetic ---------------------------------------------------------


def fv_annuity(pmt: float, years: int, rate: float = GROWTH) -> float:
    """Future value of `pmt` paid at the end of each year for `years` years."""
    if rate == 0:
        return pmt * years
    return pmt * (((1 + rate) ** years - 1) / rate)


def fv_annuity_loop(pmt: float, years: int, rate: float = GROWTH) -> float:
    """The same value accumulated year by year -- an independent recomputation.

    Ground truth that is only ever produced by one expression inherits that
    expression's bugs.
    """
    balance = 0.0
    for _ in range(years):
        balance = balance * (1 + rate) + pmt
    return balance


def spendable(account: str, contribution: float, years: int, bracket: float) -> float:
    """After-tax dollars available at the end, for one account."""
    contrib_fv = fv_annuity(contribution, years)
    basis = contribution * years

    if account == PLAN529:
        # Qualified education withdrawals are untaxed, so the whole balance is
        # spendable, and the seed deposit does not exist here.
        return contrib_fv
    if account == BROKERAGE:
        return basis + (contrib_fv - basis) * (1 - LTCG)

    # Trump Account: the seed compounds too, and counts as growth rather than
    # as the saver's own basis, so it is taxed on the way out.
    total = contrib_fv + SEED * (1 + GROWTH) ** years
    return basis + (total - basis) * (1 - bracket)


def _self_check() -> None:
    for pmt in (0.0, 500.0, 2_000.0, 5_000.0):
        for years in (5, 10, 18):
            closed, looped = fv_annuity(pmt, years), fv_annuity_loop(pmt, years)
            if abs(closed - looped) > 0.01:
                raise AssertionError(
                    f"annuity mismatch at pmt={pmt} years={years}: {closed} vs {looped}"
                )


_self_check()


# ---- the cases --------------------------------------------------------------

# (id, annual contribution, years, bracket at withdrawal)
# Spread deliberately across the crossover: see the module docstring.
CASES = [
    ("seed-only", 0, 18, 0.22),
    ("small-short", 500, 5, 0.10),
    ("small-long-low-bracket", 500, 18, 0.10),
    ("mid-decade", 1_000, 10, 0.22),
    ("mid-long-low-bracket", 2_000, 18, 0.10),
    ("standard", 2_000, 18, 0.22),
    ("large-short-high-bracket", 5_000, 5, 0.32),
    ("large-long-high-bracket", 3_000, 18, 0.32),
]

INSTRUCTION = (
    "Answer the question. You may show your working, but the last line of your "
    "reply must be exactly:\nANSWER: <option number>\n"
    "where <option number> is a single digit: 1, 2 or 3. Nothing else on that line.\n\n"
)


def _account_rules(account: str, contribution: float, years: int, bracket: float) -> list[str]:
    """The bullet points describing one account. Identical in both framings."""
    contribute = (
        f"- You contribute ${contribution:,.0f} at the end of each year for {years} years."
        if contribution
        else "- You contribute nothing."
    )
    grow = f"- The balance grows at {GROWTH * 100:g}% per year."

    if account == PLAN529:
        return [
            contribute,
            grow,
            "- Withdrawals spent on qualified education expenses are not taxed at all.",
        ]
    if account == BROKERAGE:
        return [
            contribute,
            grow,
            f"- At withdrawal, every dollar above the total you contributed is taxed at "
            f"the {LTCG * 100:g}% long-term capital gains rate.",
        ]
    return [
        f"- A one-time ${SEED:,.0f} government deposit is made today and grows at "
        f"{GROWTH * 100:g}% per year alongside everything else.",
        contribute,
        grow,
        f"- At withdrawal, every dollar above the total YOU contributed is taxed as "
        f"ordinary income at {bracket * 100:g}%. The ${SEED:,.0f} deposit counts as "
        f"growth, not as your own contribution.",
    ]


def _order(case_index: int) -> list[str]:
    """Which account sits in which slot.

    Rotated per case so no account is Option 1 throughout -- otherwise a model
    that always answers 1 would score well on one framing and the result would
    measure position bias while claiming to measure reasoning. The rotation is
    identical in both framings, so the named/anonymous comparison is unaffected
    by it.
    """
    accounts = [PLAN529, TRUMP, BROKERAGE]
    shift = case_index % 3
    return accounts[shift:] + accounts[:shift]


def build() -> list[Scenario]:
    scenarios: list[Scenario] = []

    for index, (case_id, contribution, years, bracket) in enumerate(CASES):
        order = _order(index)
        values = {a: spendable(a, contribution, years, bracket) for a in order}
        winner = max(order, key=lambda a: values[a])
        winner_slot = order.index(winner) + 1

        runner_up = max((a for a in order if a != winner), key=lambda a: values[a])
        margin = values[winner] - values[runner_up]
        margin_pct = margin / values[winner] * 100 if values[winner] else 100.0

        for framing in ("named", "anon"):
            blocks = []
            for slot, account in enumerate(order, start=1):
                heading = (
                    f"Option {slot} -- {NAMES[account]}"
                    if framing == "named"
                    else f"Option {slot}"
                )
                rules = "\n".join(_account_rules(account, contribution, years, bracket))
                blocks.append(f"{heading}\n{rules}")

            prompt = (
                f"{INSTRUCTION}"
                "A parent is saving for a child's college costs and can put the same "
                "money into exactly one of three accounts.\n\n"
                + "\n\n".join(blocks)
                + f"\n\nAll three are held for exactly {years} years, then fully withdrawn "
                "and spent on qualified education expenses. Ignore fees, inflation, "
                "state taxes and contribution limits.\n\n"
                "Which option leaves the most money to spend after tax?"
            )

            scenarios.append(
                Scenario(
                    id=f"{case_id}-{framing}",
                    prompt=prompt,
                    expected=float(winner_slot),
                    tolerance=0.01,
                    category=framing,
                    note=(
                        f"{NAMES[winner]} wins by ${margin:,.2f} ({margin_pct:.2f}% of "
                        f"${values[winner]:,.2f}); slots: "
                        + ", ".join(f"{i}={NAMES[a]}" for i, a in enumerate(order, 1))
                    ),
                )
            )

    return scenarios


SCENARIOS = build()

_ANSWER_RE = re.compile(r"ANSWER\s*:\s*\**\s*(?:option\s*)?(-?\d+)", re.IGNORECASE)
_OPTION_RE = re.compile(r"\boption\s*(\d+)\b", re.IGNORECASE)
_DIGIT_RE = re.compile(r"\b([123])\b")


class AccountChoice(Experiment):
    """Which of three savings accounts does the model pick, and does the label move it?"""

    name = "allocation"

    # 1024 was not enough. Three accounts to value means three amortisation
    # calculations per reply, and the smoke test cut off two of three
    # generations mid-working -- disproportionately on the *named* framing,
    # where the model spends tokens restating account names. Truncation that
    # lands harder on one arm of the comparison would corrupt the only thing
    # this experiment measures.
    num_predict = 2048

    def scenarios(self) -> list[Scenario]:
        return SCENARIOS

    def parse(self, output: str) -> float | None:
        """The option number the model settled on.

        Three fallbacks in descending order of confidence, because a model that
        ignores the output format is still expressing a choice and should be
        scored on the choice rather than on its formatting. Which rule fired is
        not stored per row, so format compliance is measured separately by
        counting ANSWER lines in the raw output.
        """
        for pattern in (_ANSWER_RE, _OPTION_RE, _DIGIT_RE):
            matches = pattern.findall(output)
            if matches:
                try:
                    return float(matches[-1])
                except ValueError:
                    return None
        return None

    # ---- the paired analysis ------------------------------------------------

    def extra_summary(self, rows: list[dict], data_dir) -> None:
        """Pair each case's two framings and write the comparison.

        The generic per-scenario summary cannot see the finding here, because
        the finding is a *difference between two scenarios*: the same case,
        asked twice. This writes one row per (model, case) with both answers
        side by side, so the flip rate in the post is a column in a published
        file rather than a number a reader has to take on trust.
        """
        import collections
        import csv
        import pathlib

        by_key: dict[tuple[str, str, str], list[dict]] = collections.defaultdict(list)
        for row in rows:
            scenario_id = row["scenario_id"]
            case_id, _, framing = scenario_id.rpartition("-")
            by_key[(row["model"], case_id, framing)].append(row)

        def modal(group: list[dict]) -> float | None:
            answers = [r["parsed"] for r in group if r["parsed"] is not None]
            if not answers:
                return None
            return collections.Counter(answers).most_common(1)[0][0]

        cases = {c[0]: c for c in CASES}
        out_path = pathlib.Path(data_dir) / f"{self.name}-pairs.csv"
        flips = 0
        pairs = 0

        with out_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(
                [
                    "model", "case", "contribution", "years", "bracket",
                    "correct_option", "correct_account",
                    "named_answer", "anon_answer", "flipped",
                    "named_correct", "anon_correct",
                    "named_picked_dominated", "anon_picked_dominated",
                    "margin_pct_of_winner",
                ]
            )

            for model in sorted({r["model"] for r in rows}):
                for index, (case_id, contribution, years, bracket) in enumerate(CASES):
                    named = by_key.get((model, case_id, "named"), [])
                    anon = by_key.get((model, case_id, "anon"), [])
                    if not named or not anon:
                        continue

                    order = _order(index)
                    values = {a: spendable(a, contribution, years, bracket) for a in order}
                    winner = max(order, key=lambda a: values[a])
                    runner_up = max((a for a in order if a != winner), key=lambda a: values[a])
                    margin_pct = (
                        (values[winner] - values[runner_up]) / values[winner] * 100
                        if values[winner]
                        else 100.0
                    )
                    brokerage_slot = order.index(BROKERAGE) + 1

                    named_answer, anon_answer = modal(named), modal(anon)
                    flipped = (
                        named_answer is not None
                        and anon_answer is not None
                        and named_answer != anon_answer
                    )
                    pairs += 1
                    flips += bool(flipped)

                    writer.writerow(
                        [
                            model, case_id, contribution, years, f"{bracket:.2f}",
                            order.index(winner) + 1, NAMES[winner],
                            "" if named_answer is None else int(named_answer),
                            "" if anon_answer is None else int(anon_answer),
                            int(flipped),
                            sum(1 for r in named if r["correct"]),
                            sum(1 for r in anon if r["correct"]),
                            int(named_answer == brokerage_slot) if named_answer else 0,
                            int(anon_answer == brokerage_slot) if anon_answer else 0,
                            round(margin_pct, 2),
                        ]
                    )

        print(f"wrote {out_path}")

        by_framing: dict[str, list[dict]] = collections.defaultdict(list)
        for row in rows:
            by_framing[row["category"]].append(row)
        print("\naccuracy by framing:")
        for framing, group in sorted(by_framing.items()):
            correct = sum(1 for r in group if r["correct"])
            print(f"  {framing:<8} {correct:>3}/{len(group):<4} {correct / len(group):>6.1%}")

        if pairs:
            print(f"\nanswer flipped between framings in {flips}/{pairs} model-case pairs "
                  f"({flips / pairs:.1%})")

        # Which slot each model picks, per framing. This is the reason the
        # option order rotates: a model that answers "2" whatever sits in slot
        # 2 is not choosing an account at all, and without the rotation its
        # answers would be indistinguishable from reasoning that happened to
        # land there. Reported because it is the mechanism behind the accuracy,
        # not a footnote to it.
        print("\nslot picked, by model and framing (1/2/3, and the count of the modal slot):")
        for model in sorted({r["model"] for r in rows}):
            for framing in ("named", "anon"):
                group = [
                    r for r in rows
                    if r["model"] == model and r["category"] == framing and r["parsed"] is not None
                ]
                if not group:
                    continue
                counts = collections.Counter(int(r["parsed"]) for r in group)
                spread = " ".join(f"{slot}:{counts.get(slot, 0):>3}" for slot in (1, 2, 3))
                top_slot, top_n = counts.most_common(1)[0]
                print(
                    f"  {model:<16} {framing:<6} {spread}   "
                    f"modal slot {top_slot} on {top_n / len(group):.0%} of answers"
                )

        # Format compliance and truncation, reported separately from accuracy
        # so a model is never marked wrong for a measurement artefact.
        cut = sum(1 for r in rows if r.get("truncated"))
        no_answer_line = sum(1 for r in rows if "ANSWER" not in (r["raw_output"] or "").upper())
        unparsed = sum(1 for r in rows if r["parsed"] is None)
        print(
            f"\ntruncated: {cut}/{len(rows)}   "
            f"no ANSWER line: {no_answer_line}/{len(rows)}   "
            f"unparseable: {unparsed}/{len(rows)}"
        )

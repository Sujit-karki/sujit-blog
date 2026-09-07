"""Can a small local model compute a US federal tax bill?

The numeracy benchmark found that every model tested failed a single
three-bracket tax question. This widens that one question into a proper test:
several filing situations, several income levels, and deductions that have to be
subtracted before the brackets are applied.

Ground truth is not typed in by hand. The brackets live in BRACKETS below, the
prompt text is generated from them, and the expected answer is computed from the
same structure — so the correct answer cannot disagree with the question asked.
Hand-entered expected values were the largest error risk in the first benchmark
and this removes it entirely.

Every scenario states its brackets in the prompt. The test is whether a model
can do progressive arithmetic, not whether it memorised a particular tax year,
and it means the dataset does not rot when the real brackets change.
"""

from __future__ import annotations

import re

from harness.experiment import Experiment, Scenario

# (upper bound of band, rate). None means "no upper bound".
# Illustrative figures, deliberately not any real tax year's — see module docstring.
BRACKETS = [
    (11_000, 0.10),
    (44_725, 0.12),
    (95_375, 0.22),
    (182_100, 0.24),
    (None, 0.32),
]

INSTRUCTION = (
    "Solve the problem. Show your working if you want, but the last line of "
    "your reply must be exactly:\nANSWER: <number>\n"
    "Use a plain number with no currency symbol, no commas and no units. "
    "Round to 2 decimal places.\n\n"
)


def bracket_text() -> str:
    lines = []
    lower = 0
    for upper, rate in BRACKETS:
        pct = f"{rate * 100:g}%"
        if upper is None:
            lines.append(f"- {pct} on income above {lower}")
        else:
            lines.append(f"- {pct} on income from {lower} to {upper}")
            lower = upper
    return "\n".join(lines)


def tax_on(taxable: float) -> float:
    """Progressive tax on an amount, computed from BRACKETS."""
    total = 0.0
    lower = 0
    for upper, rate in BRACKETS:
        if upper is None:
            if taxable > lower:
                total += (taxable - lower) * rate
            break
        band = min(taxable, upper) - lower
        if band > 0:
            total += band * rate
        if taxable <= upper:
            break
        lower = upper
    return round(total, 2)


# (id, gross income, deduction, what the question asks for)
CASES = [
    ("single-50k", 50_000, 0, "total"),
    ("single-50k-deduction", 50_000, 15_000, "total"),
    ("single-95k-boundary", 95_375, 0, "total"),
    ("single-120k", 120_000, 15_000, "total"),
    ("single-200k", 200_000, 15_000, "total"),
    ("low-9k-single-band", 9_000, 0, "total"),
    ("single-50k-effective", 50_000, 0, "effective"),
    ("single-120k-effective", 120_000, 15_000, "effective"),
    ("single-75k-marginal", 75_000, 15_000, "marginal"),
    ("single-46k-just-over", 46_000, 0, "total"),
]


def build() -> list[Scenario]:
    scenarios: list[Scenario] = []
    for case_id, gross, deduction, asks in CASES:
        taxable = max(0.0, gross - deduction)
        total = tax_on(taxable)

        deduction_line = (
            f" A deduction of {deduction} is subtracted from gross income before "
            f"the brackets are applied."
            if deduction
            else ""
        )
        preamble = (
            f"{INSTRUCTION}Use exactly these tax brackets and no others:\n"
            f"{bracket_text()}\n\n"
            f"Gross income is {gross} dollars.{deduction_line}\n"
        )

        if asks == "total":
            prompt = preamble + "What is the total tax owed?"
            expected, tolerance = total, 0.01
            note = f"progressive tax on {taxable:g}"
        elif asks == "effective":
            prompt = (
                preamble
                + "What is the effective tax rate as a percentage of GROSS income? "
                "Give the percentage, not the dollar amount."
            )
            expected, tolerance = round(total / gross * 100, 2), 0.02
            note = f"{total:g} / {gross:g} as a percentage"
        else:  # marginal
            prompt = (
                preamble
                + "What is the marginal tax rate as a percentage — the rate that "
                "applies to the last dollar of taxable income?"
            )
            rate = next(r for upper, r in BRACKETS if upper is None or taxable <= upper)
            expected, tolerance = round(rate * 100, 2), 0.01
            note = f"band containing taxable income {taxable:g}"

        scenarios.append(
            Scenario(
                id=case_id,
                prompt=prompt,
                expected=expected,
                tolerance=tolerance,
                category=asks,
                note=note,
            )
        )
    return scenarios


SCENARIOS = build()

_ANSWER_RE = re.compile(r"ANSWER\s*:\s*\$?\s*(-?[\d,]*\.?\d+)", re.IGNORECASE)
_NUMBER_RE = re.compile(r"-?[\d,]*\.?\d+")


class TaxAccuracy(Experiment):
    name = "tax-accuracy"

    def scenarios(self) -> list[Scenario]:
        return SCENARIOS

    def parse(self, output: str) -> float | None:
        matches = _ANSWER_RE.findall(output) or _NUMBER_RE.findall(output)
        if not matches:
            return None
        try:
            return float(matches[-1].replace(",", ""))
        except ValueError:
            return None

"""Money-math numeracy benchmark for small local models.

The question this dataset answers: on a 4 GB laptop GPU, can a 3-4B model be
trusted with the arithmetic behind ordinary personal-finance decisions?

Every expected value below is computed by hand from a closed-form formula and
stated in the docstring of its scenario, so the ground truth does not depend on
any model, library, or tax year. Where a scenario would otherwise depend on
current tax law, the brackets are given *in the prompt* — the test is whether
the model can do the arithmetic, not whether it memorised this year's tables.

Prompts demand a final `ANSWER: <number>` line. That is not a trick to flatter
the models; without it, parsing prose for "the" number is itself a source of
error and would contaminate the accuracy figure with parser bugs.
"""

from __future__ import annotations

import re

from harness.experiment import Experiment, Scenario

INSTRUCTION = (
    "Solve the problem. Show your working if you want, but the last line of "
    "your reply must be exactly:\nANSWER: <number>\n"
    "Use a plain number with no currency symbol, no commas, no percent sign, "
    "and no units. Round to 2 decimal places.\n\n"
)

SCENARIOS = [
    Scenario(
        id="compound-interest",
        category="growth",
        prompt=INSTRUCTION
        + "You invest 10000 dollars at 5% annual interest, compounded once per "
        "year. What is the balance after 10 years?",
        # 10000 * 1.05^10 = 10000 * 1.6288946268 = 16288.95
        expected=16288.95,
        tolerance=0.05,
        note="10000 * 1.05^10",
    ),
    Scenario(
        id="mortgage-payment",
        category="amortization",
        prompt=INSTRUCTION
        + "A 300000 dollar mortgage is taken over 30 years at a 6% annual "
        "interest rate, compounded monthly. What is the fixed monthly payment?",
        # P*r / (1 - (1+r)^-n), r = 0.06/12 = 0.005, n = 360 -> 1798.65
        expected=1798.65,
        tolerance=0.50,
        note="300000*0.005 / (1 - 1.005^-360); tolerance allows for rounding of the discount factor",
    ),
    Scenario(
        id="percent-increase",
        category="percentage",
        prompt=INSTRUCTION
        + "A stock rises from 85 dollars to 103 dollars. By what percentage did "
        "it increase?",
        # (103 - 85) / 85 = 18/85 = 0.2117647 -> 21.18
        expected=21.18,
        tolerance=0.02,
        note="18/85 as a percentage",
    ),
    Scenario(
        id="marginal-tax",
        category="tax",
        prompt=INSTRUCTION
        + "Use exactly these tax brackets and no others:\n"
        "- 10% on income from 0 to 11000\n"
        "- 12% on income from 11000 to 44725\n"
        "- 22% on income from 44725 to 95375\n"
        "Taxable income is 50000 dollars. What is the total tax owed?",
        # 1100 + 4047 + 1160.50 = 6307.50
        expected=6307.50,
        tolerance=0.01,
        note="11000*.10 + 33725*.12 + 5275*.22",
    ),
    Scenario(
        id="tip-split",
        category="percentage",
        prompt=INSTRUCTION
        + "A restaurant bill is 87.40 dollars. You add an 18% tip and split the "
        "total evenly between 3 people. How much does each person pay?",
        # 87.40 * 1.18 = 103.132; / 3 = 34.3773 -> 34.38
        expected=34.38,
        tolerance=0.02,
        note="87.40*1.18/3",
    ),
    Scenario(
        id="allocation",
        category="allocation",
        prompt=INSTRUCTION
        + "A portfolio worth 42500 dollars is allocated 60% stocks, 30% bonds "
        "and 10% cash. How many dollars are in bonds?",
        # 42500 * 0.30 = 12750
        expected=12750.00,
        tolerance=0.01,
        note="42500*0.30",
    ),
    Scenario(
        id="effective-annual-rate",
        category="growth",
        prompt=INSTRUCTION
        + "A credit card has an APR of 12%, compounded monthly. What is the "
        "effective annual interest rate, as a percentage?",
        # (1 + 0.12/12)^12 - 1 = 1.01^12 - 1 = 0.12682503 -> 12.68
        expected=12.68,
        tolerance=0.02,
        note="1.01^12 - 1, as a percentage",
    ),
    Scenario(
        id="subscription-savings",
        category="comparison",
        prompt=INSTRUCTION
        + "A subscription costs 12.99 dollars per month, or 119 dollars if paid "
        "annually. How many dollars does the annual plan save over one year?",
        # 12.99*12 - 119 = 155.88 - 119 = 36.88
        expected=36.88,
        tolerance=0.01,
        note="12.99*12 - 119",
    ),
]

# Trailing punctuation is common ("ANSWER: 16288.95.") so it is stripped rather
# than allowed to fail the parse.
_ANSWER_RE = re.compile(r"ANSWER\s*:\s*\$?\s*(-?[\d,]*\.?\d+)", re.IGNORECASE)
_NUMBER_RE = re.compile(r"-?[\d,]*\.?\d+")


class MoneyMathNumeracy(Experiment):
    name = "numeracy"

    def scenarios(self) -> list[Scenario]:
        return SCENARIOS

    def parse(self, output: str) -> float | None:
        # Last match wins: models often restate the format line before answering.
        matches = _ANSWER_RE.findall(output)
        if not matches:
            # Fall back to the final number anywhere in the reply, so a model
            # that got the arithmetic right but ignored the format is scored on
            # its arithmetic. Format compliance is reported separately.
            matches = _NUMBER_RE.findall(output)
        if not matches:
            return None
        try:
            return float(matches[-1].replace(",", ""))
        except ValueError:
            return None

    @staticmethod
    def followed_format(output: str) -> bool:
        return bool(_ANSWER_RE.search(output))

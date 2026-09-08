"""What share of everything sold does the platform actually keep?

  python platform_take.py
  python platform_take.py --json

Every gig and marketplace platform advertises a fee. Etsy's is 6.5%. The
number that matters to someone selling there is not that fee, though — it is
total revenue divided by everything sold, because the platform also charges
for payments, for shipping labels, for listings, and for the advertising a
seller needs to be found at all.

That ratio is called the take rate, and it is computable from the companies'
own annual reports:

    take rate = revenue / gross volume

Both halves come from primary filings. Revenue is pulled from XBRL company
facts, which is structured data the company tagged itself. Gross volume is not
in XBRL — it is a non-GAAP operating metric that lives in the narrative, under
a different name at every company (GMS, GMV, GBV, GSV, Marketplace GOV, Gross
Bookings) — so it is extracted from the filing text and checked three ways:
the declared unit scale must match the scale the filing states near the figure,
gross volume must exceed revenue, and the resulting rate must be plausible.
Any of those failing stops the run rather than publishing a wrong number.

WHAT THIS RATIO IS NOT. Two cautions, both of which belong in anything written
from this data.

First, take rate is not the seller's fee. It is everything the platform earns
per dollar transacted, including advertising and payment processing that a
seller may buy on top of the headline commission. It is the right number for
"what share of this economy does the platform capture" and the wrong number for
"what will Etsy charge me".

Second, it is only comparable across companies that recognise revenue the same
way. The marketplaces here (Etsy, eBay, Airbnb, Upwork, Fiverr) book revenue
net — roughly their cut. The rideshare and delivery companies (Uber, Lyft,
DoorDash) book substantial revenue gross under ASC 606, meaning payments that
pass through to drivers can count as revenue. Their ratios are therefore not
the driver's commission and are not comparable to the marketplaces'. They are
reported here because excluding them would hide the incomparability rather
than document it.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import time
import urllib.request
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
CACHE_DIR = DATA_DIR / "sec-cache"

# The SEC asks automated clients to identify themselves with a contact address.
UA = "sujitkarki.com.np research (caiunitydigitalmarketing@gmail.com)"

SCALES = {"thousands": 1_000, "millions": 1_000_000, "billions": 1_000_000_000}

# One entry per platform.
#
# `pattern` must capture the gross-volume figure as group 1. `scale` is the
# unit the filing reports that table in, declared here and then verified
# against the filing's own "(in ...)" statement — declaring it rather than
# inferring it is deliberate, because inferring a factor of a thousand wrong
# is the single easiest way to publish nonsense from this data.
#
# `basis` records how the company recognises revenue: "net" marketplaces are
# comparable with each other, "gross" ones are not.
PLATFORMS = [
    {
        "name": "Fiverr", "ticker": "FVRR", "cik": 1762301, "metric": "GMV",
        "pattern": r"GMV was \$([\d,]+\.?\d*) million", "scale": "millions",
        "basis": "net", "sells": "freelance services",
        "reported_take_rate": 27.7, "reported_scope": "marketplace",
    },
    {
        "name": "Etsy", "ticker": "ETSY", "cik": 1370637, "metric": "GMS",
        # Consolidated GMS from the key-metrics table, NOT the "GMS was
        # $10,460.7 million" sentence in the discussion — that one is the Etsy
        # marketplace alone, excluding Depop and Reverb, while revenue is
        # consolidated. Dividing the whole company's revenue by one segment's
        # volume overstated this by 3.4 points before the reported-take-rate
        # check below caught it.
        "pattern": r"GMS \(1\)\(2\) \$ ([\d,]+)", "scale": "thousands",
        "basis": "net", "sells": "handmade and vintage goods",
        "reported_take_rate": 24.2, "reported_scope": "total",
    },
    {
        "name": "Upwork", "ticker": "UPWK", "cik": 1627475, "metric": "GSV",
        "pattern": r"GSV \$ ([\d,]+)", "scale": "thousands",
        "basis": "net", "sells": "freelance contracts",
        "reported_take_rate": 18.7, "reported_scope": "marketplace",
    },
    {
        "name": "Airbnb", "ticker": "ABNB", "cik": 1559720, "metric": "GBV",
        # Columns run 2024, 2025 — the current year is the SECOND figure.
        "pattern": r"Gross Booking Value \$ [\d,]+ \$ ([\d,]+)", "scale": "millions",
        "basis": "net", "sells": "short-term stays",
    },
    {
        "name": "eBay", "ticker": "EBAY", "cik": 1065088, "metric": "GMV",
        "pattern": r"GMV \$ ([\d,]+)", "scale": "millions",
        "basis": "net", "sells": "resale and collectibles",
        "reported_take_rate": 13.94, "reported_scope": "total",
    },
    {
        "name": "DoorDash", "ticker": "DASH", "cik": 1792789, "metric": "Marketplace GOV",
        # Columns run 2023, 2024, 2025 — the current year is the LAST of three.
        "pattern": r"Marketplace GOV \$ [\d,]+ \$ [\d,]+ \$ ([\d,]+)", "scale": "millions",
        "basis": "gross", "sells": "delivery",
    },
    {
        "name": "Uber", "ticker": "UBER", "cik": 1543151, "metric": "Gross Bookings",
        "pattern": r"Gross Bookings \(\d\) \$ [\d,]+ \$ ([\d,]+)", "scale": "millions",
        "basis": "gross", "sells": "rides and delivery",
    },
    {
        "name": "Lyft", "ticker": "LYFT", "cik": 1759509, "metric": "Gross Bookings",
        "pattern": r"Gross Bookings \$ ([\d,]+\.?\d*)", "scale": "millions",
        "basis": "gross", "sells": "rides",
    },
]

REVENUE_TAGS = (
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "Revenues",
    "RevenueFromContractWithCustomerIncludingAssessedTax",
)


def _get(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def _to_text(html: str) -> str:
    text = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    for entity, char in (
        ("&#160;", " "), ("&nbsp;", " "), ("&#8217;", "'"), ("&#8220;", '"'),
        ("&#8221;", '"'), ("&amp;", "&"), ("&#8212;", "-"), ("&#39;", "'"),
    ):
        text = text.replace(entity, char)
    return re.sub(r"\s+", " ", text)


def annual_report(platform: dict) -> tuple[str, str, str]:
    """The latest annual filing as (text, fiscal year end, source URL).

    Cached on disk: these documents are 400-600 KB of text each and do not
    change once filed, so re-running the script should not re-fetch them.
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache = CACHE_DIR / f"{platform['ticker']}.txt"

    if not cache.exists():
        cik = platform["cik"]
        recent = json.loads(_get(f"https://data.sec.gov/submissions/CIK{cik:010d}.json"))
        recent = recent["filings"]["recent"]
        # 20-F for foreign private issuers (Fiverr files one), 10-K otherwise.
        index = next(
            i for i, form in enumerate(recent["form"]) if form in ("10-K", "20-F")
        )
        accession = recent["accessionNumber"][index].replace("-", "")
        url = (
            f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession}/"
            f"{recent['primaryDocument'][index]}"
        )
        text = _to_text(_get(url).decode("utf-8", errors="ignore"))
        cache.write_text(
            f"{recent['reportDate'][index]}|{url}\n{text}", encoding="utf-8"
        )
        time.sleep(0.4)  # the SEC asks for under 10 requests a second

    head, text = cache.read_text(encoding="utf-8").split("\n", 1)
    period, url = head.split("|", 1)
    return text, period, url


def gross_volume(platform: dict, text: str) -> tuple[float, str]:
    """The gross-volume figure, and the sentence it was read from."""
    match = re.search(platform["pattern"], text)
    if not match:
        raise SystemExit(
            f"{platform['name']}: could not find {platform['metric']} in the filing. "
            f"The wording has probably changed — reread it and update the pattern."
        )

    # The scale is declared in PLATFORMS; confirm the filing agrees rather than
    # trusting the declaration.
    #
    # Two places state it. A figure written out in prose carries its own unit
    # ("GMV was $1,073.0 million"); a figure inside a table gets it from the
    # header above ("(in millions)"). The inline unit wins when both are
    # present, because a table on an unrelated topic can sit between the header
    # and the sentence being read — trusting the lookback there would compare
    # this figure against someone else's scale.
    inline = re.search(
        r"\b(thousand|million|billion)", text[match.start():match.end() + 20], re.I
    )
    if inline:
        stated = [inline.group(1).lower() + "s"]
    else:
        window = text[max(0, match.start() - 700):match.start()]
        stated = re.findall(r"in (thousands|millions|billions)", window, re.I)
    if not stated:
        raise SystemExit(
            f"{platform['name']}: no unit scale stated near the {platform['metric']} "
            f"figure. Refusing to guess."
        )
    if stated[-1].lower() != platform["scale"]:
        raise SystemExit(
            f"{platform['name']}: filing says '{stated[-1]}' near the figure but the "
            f"config declares '{platform['scale']}'. One of them is wrong."
        )

    value = float(match.group(1).replace(",", "")) * SCALES[platform["scale"]]
    quote = re.sub(r"\s+", " ", text[match.start():match.start() + 90]).strip()
    return value, quote


def revenue(platform: dict, period: str) -> tuple[float, str]:
    """Revenue for the fiscal year, from XBRL company facts."""
    cik = platform["cik"]
    year = period[:4]
    for tag in REVENUE_TAGS:
        try:
            facts = json.loads(
                _get(f"https://data.sec.gov/api/xbrl/companyconcept/"
                     f"CIK{cik:010d}/us-gaap/{tag}.json")
            )
        except Exception:
            time.sleep(0.2)
            continue
        for unit in facts["units"]["USD"]:
            if (
                unit.get("form") in ("10-K", "20-F")
                and unit.get("fp") == "FY"
                and unit.get("start", "").startswith(f"{year}-01")
                and unit.get("end", "").startswith(f"{year}-12")
            ):
                return float(unit["val"]), tag
    raise SystemExit(f"{platform['name']}: no FY{year} revenue found in XBRL.")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--json", action="store_true", help="print the dataset as JSON")
    args = parser.parse_args()

    rows = []
    for platform in PLATFORMS:
        text, period, url = annual_report(platform)
        gross, quote = gross_volume(platform, text)
        rev, tag = revenue(platform, period)

        # Two sanity checks. A platform cannot earn more than passes through
        # it, and no marketplace in this set keeps half of everything sold —
        # either result would mean the scale or the match is wrong.
        if gross <= rev:
            raise SystemExit(
                f"{platform['name']}: gross volume {gross:,.0f} is not above revenue "
                f"{rev:,.0f}. Almost certainly a unit-scale error."
            )
        take = rev / gross
        if not 0.01 < take < 0.60:
            raise SystemExit(
                f"{platform['name']}: take rate of {take:.1%} is outside the plausible "
                f"range. Check the extraction before trusting it."
            )

        # Where the company publishes its own take rate on the same basis,
        # recomputing it must reproduce their figure. This is the check that
        # caught the Etsy scope error, and it is the only independent test
        # available that the numerator and denominator describe the same thing.
        # Only companies that define their take rate the same way this does —
        # all revenue over all gross volume — are a valid test of the
        # extraction. Fiverr and Upwork publish a *marketplace* take rate,
        # dividing only the marketplace slice of revenue by the same
        # denominator, so their figure is legitimately lower and asserting
        # equality against it would be asserting that two different metrics
        # are one metric.
        expected = platform.get("reported_take_rate")
        if (
            expected is not None
            and platform.get("reported_scope") == "total"
            and abs(take * 100 - expected) > 0.15
        ):
            raise SystemExit(
                f"{platform['name']}: computed take rate {take:.1%} does not match the "
                f"{expected}% the filing reports on the same basis. Do not publish "
                f"until they agree — a mismatch here means the numerator and "
                f"denominator are describing different scopes."
            )

        rows.append({
            "platform": platform["name"], "ticker": platform["ticker"],
            "sells": platform["sells"], "fiscal_year_end": period,
            "gross_metric": platform["metric"], "gross_volume_usd": round(gross),
            "revenue_usd": round(rev), "take_rate_pct": round(take * 100, 2),
            "revenue_basis": platform["basis"], "revenue_xbrl_tag": tag,
            "reported_take_rate_pct": platform.get("reported_take_rate"),
            "reported_take_rate_scope": platform.get("reported_scope"),
            "source_quote": quote, "source_url": url,
        })

    rows.sort(key=lambda r: -r["take_rate_pct"])

    DATA_DIR.mkdir(exist_ok=True)
    (DATA_DIR / "platform-take.json").write_text(
        json.dumps(rows, indent=2) + "\n", encoding="utf-8"
    )
    with (DATA_DIR / "platform-take.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    if args.json:
        print(json.dumps(rows, indent=2))
        return 0

    print(f"{'platform':<10} {'sells':<26} {'gross':>16} {'revenue':>15} {'take':>7}  basis")
    for row in rows:
        print(
            f"{row['platform']:<10} {row['sells']:<26} "
            f"${row['gross_volume_usd']/1e9:>14,.1f}B ${row['revenue_usd']/1e9:>13,.1f}B "
            f"{row['take_rate_pct']:>6.1f}%  {row['revenue_basis']}"
        )
    print(f"\nwrote {DATA_DIR / 'platform-take.csv'}")

    net = [r for r in rows if r["revenue_basis"] == "net"]
    print(
        f"\nmarketplaces booking revenue net ({len(net)}): "
        f"{min(r['take_rate_pct'] for r in net):.1f}% to "
        f"{max(r['take_rate_pct'] for r in net):.1f}%"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

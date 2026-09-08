"""What share of everything sold does the platform actually keep?

  python platform_take.py
  python platform_take.py --json
  python platform_take.py --fiscal-year 2024

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
# `scale` is the unit the filing reports that table in, declared here and then
# verified against the filing's own "(in ...)" statement — declaring it rather
# than inferring it is deliberate, because inferring a factor of a thousand
# wrong is the single easiest way to publish nonsense from this data.
#
# Gross volume is read one of two ways.
#
# `label` is the normal case: a regex matching the ROW LABEL only, never the
# figures. The row's columns are then aligned against the fiscal years in the
# table header, and the column for the year being computed is chosen by its
# header year rather than by counting cells. This file used to hardcode the
# ordinal instead ("the current year is the SECOND figure"), which is right for
# exactly one filing and silently wrong for every other year — reading the
# oldest column against the newest revenue understates DoorDash by seven points
# and overstates Airbnb by one and a half. An ordinal cannot be checked against
# anything; a year can.
#
# `drop_columns` lists indices into the row's "$" cells that are not fiscal-year
# columns, removed before alignment. eBay's GMV row carries an FX-effect column
# between the years. Declared, then verified: if the surviving cell count does
# not equal the header year count, the run stops rather than guessing.
#
# `pattern` is the exception, for a figure stated in prose rather than in a
# table, where there is no header to align to. It captures the figure as group 1
# and implicitly pins one year, so it must be rewritten to move years — and the
# run says so rather than returning the wrong year quietly.
#
# `basis` records how the company recognises revenue: "net" marketplaces are
# comparable with each other, "gross" ones are not.
PLATFORMS = [
    {
        "name": "Fiverr", "ticker": "FVRR", "cik": 1762301, "metric": "GMV",
        # Prose, not a table: "GMV was $1,073.0 million, down 2.2%".
        "pattern": r"GMV was \$([\d,]+\.?\d*) million", "scale": "millions",
        "basis": "net", "sells": "freelance services",
        "reported_take_rates": {2025: 27.7}, "reported_scope": "marketplace",
    },
    {
        "name": "Etsy", "ticker": "ETSY", "cik": 1370637, "metric": "GMS",
        # Consolidated GMS from the key-metrics table, NOT the "GMS was
        # $10,460.7 million" sentence in the discussion — that one is the Etsy
        # marketplace alone, excluding Depop and Reverb, while revenue is
        # consolidated. Dividing the whole company's revenue by one segment's
        # volume overstated this by 3.4 points before the reported-take-rate
        # check below caught it.
        "label": r"GMS \(1\)\(2\)", "scale": "thousands",
        "basis": "net", "sells": "handmade and vintage goods",
        # Etsy prints both years too ("Revenue take rate 24.2 % 22.3 %"),
        # so FY2024 is a second, independent check on column alignment.
        "reported_take_rates": {2025: 24.2, 2024: 22.3}, "reported_scope": "total",
    },
    {
        "name": "Upwork", "ticker": "UPWK", "cik": 1627475, "metric": "GSV",
        "label": r"GSV", "scale": "thousands",
        "basis": "net", "sells": "freelance contracts",
        "reported_take_rates": {2025: 18.7}, "reported_scope": "marketplace",
    },
    {
        "name": "Airbnb", "ticker": "ABNB", "cik": 1559720, "metric": "GBV",
        "label": r"Gross Booking Value", "scale": "millions",
        "basis": "net", "sells": "short-term stays",
    },
    {
        "name": "eBay", "ticker": "EBAY", "cik": 1065088, "metric": "GMV",
        # The GMV row runs: as-reported, the FX effect, the same year restated
        # FX-neutral, then the prior year — four cells for two fiscal years.
        # Only cells 0 and 3 are years; the FX effect and the FX-neutral
        # restatement are the same year measured differently.
        "label": r"GMV", "drop_columns": [1, 2], "scale": "millions",
        "basis": "net", "sells": "resale and collectibles",
        # eBay prints both years in the same row ("Take rate 13.94 % 13.77 %"),
        # so both are gates: FY2024 checks that the year alignment picked the
        # right column, which an ordinal could never verify.
        "reported_take_rates": {2025: 13.94, 2024: 13.77}, "reported_scope": "total",
    },
    {
        "name": "DoorDash", "ticker": "DASH", "cik": 1792789, "metric": "Marketplace GOV",
        "label": r"Marketplace GOV", "scale": "millions",
        "basis": "gross", "sells": "delivery",
    },
    {
        "name": "Uber", "ticker": "UBER", "cik": 1543151, "metric": "Gross Bookings",
        "label": r"Gross Bookings \(\d\)", "scale": "millions",
        "basis": "gross", "sells": "rides and delivery",
    },
    {
        "name": "Lyft", "ticker": "LYFT", "cik": 1759509, "metric": "Gross Bookings",
        "label": r"Gross Bookings", "scale": "millions",
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


def annual_report(platform: dict, fiscal_year: int | None = None) -> tuple[str, str, str]:
    """An annual filing as (text, fiscal year end, source URL).

    With no fiscal_year, the most recent 10-K or 20-F. With one, the filing
    whose reportDate falls in that year — which is the filing that reports it
    as its current year.

    Cached on disk: these documents are 400-600 KB of text each and do not
    change once filed, so re-running the script should not re-fetch them. The
    cache key carries the year, because "the latest filing" is not a stable
    identity — caching FY2025 under the bare ticker and then asking for FY2024
    would silently return the wrong document.
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache = CACHE_DIR / f"{platform['ticker']}-{fiscal_year or 'latest'}.txt"

    if not cache.exists():
        cik = platform["cik"]
        recent = json.loads(_get(f"https://data.sec.gov/submissions/CIK{cik:010d}.json"))
        recent = recent["filings"]["recent"]
        # 20-F for foreign private issuers (Fiverr files one), 10-K otherwise.
        candidates = [
            i for i, form in enumerate(recent["form"]) if form in ("10-K", "20-F")
        ]
        if fiscal_year is not None:
            candidates = [
                i for i in candidates
                if recent["reportDate"][i].startswith(str(fiscal_year))
            ]
            if not candidates:
                raise SystemExit(
                    f"{platform['name']}: no 10-K or 20-F with a FY{fiscal_year} "
                    f"report date in the SEC submissions feed. The feed covers "
                    f"roughly the last thousand filings; older years need the "
                    f"full submissions index."
                )
        index = candidates[0]
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


def _header_years(text: str, row_start: int) -> list[int]:
    """The fiscal years labelling the columns of the table containing a row.

    Column headers sit above the row and read as a tight run of years — "2023
    2024 2025", or the same years embedded in "Year Ended December 31, 2023
    2024 2025". A tight run is the signal: years scattered through prose are
    paragraphs apart, whereas a header's years are adjacent. The run closest to
    the row wins, because tables nest and the nearest header is the row's own.
    """
    window_start = max(0, row_start - 4000)
    window = text[window_start:row_start]
    hits = [(m.start(), int(m.group(1))) for m in re.finditer(r"\b(20[0-3]\d)\b", window)]

    runs: list[list[int]] = []
    current: list[tuple[int, int]] = []
    for position, year in hits:
        if current and position - current[-1][0] > 60:
            if len(current) >= 2:
                runs.append([y for _, y in current])
            current = []
        current.append((position, year))
    if len(current) >= 2:
        runs.append([y for _, y in current])

    return runs[-1] if runs else []


def _check_scale(platform: dict, text: str, start: int, end: int) -> None:
    """Confirm the filing states the unit scale PLATFORMS declares for it.

    Two places state it. A figure written out in prose carries its own unit
    ("GMV was $1,073.0 million"); a figure inside a table gets it from the
    header above ("(in millions)"). The inline unit wins when both are present,
    because a table on an unrelated topic can sit between the header and the
    figure being read — trusting the lookback there would compare this figure
    against someone else's scale.
    """
    inline = re.search(r"\b(thousand|million|billion)", text[start:end + 20], re.I)
    if inline:
        stated = [inline.group(1).lower() + "s"]
    else:
        window = text[max(0, start - 700):start]
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


def _gross_volume_from_table(
    platform: dict, text: str, fiscal_year: int
) -> tuple[float, str]:
    """Read one year's column out of a key-metrics table row.

    The row label is matched, its "$" cells are collected, and those cells are
    aligned positionally against the years in the table header. The requested
    year selects a cell by its header, never by an ordinal. Every way this can
    go wrong — no header, a cell count that disagrees with the year count, a
    year that is not in the table — stops the run, because each of them means
    the figure would be attributed to a year it does not belong to.
    """
    label = re.compile(platform["label"])
    for match in label.finditer(text):
        row = text[match.end():match.end() + 240]
        # Cells of the row: "$ 79,609". Stop at the first token that is not one,
        # which is where the fiscal-year columns give way to percentages.
        # A cell is "$ 4,028,386", optionally trailed by the year-over-year
        # change columns these tables interleave ("1 %", "(3) %"). Stepping over
        # those is what keeps the dollar cells positionally aligned with the
        # header years; treating a change column as a value would shift every
        # column right of it by one.
        cells = []
        position = 0
        while True:
            cell = re.match(
                r"\s*\$\s*([\d,]+\.?\d*)(?:\s*\(?[\d.,]+\)?\s*%)*",
                row[position:],
            )
            if not cell:
                break
            cells.append(cell.group(1))
            position += cell.end()
        if len(cells) < 2:
            continue

        years = _header_years(text, match.start())
        if not years:
            continue

        kept = [c for i, c in enumerate(cells) if i not in platform.get("drop_columns", [])]
        if len(kept) != len(years):
            continue
        if fiscal_year not in years:
            continue

        figure = kept[years.index(fiscal_year)]
        start = match.start()
        _check_scale(platform, text, start, match.end())
        value = float(figure.replace(",", "")) * SCALES[platform["scale"]]
        quote = re.sub(r"\s+", " ", text[start:start + 90]).strip()
        return value, quote

    raise SystemExit(
        f"{platform['name']}: no {platform['metric']} row in the filing whose columns "
        f"align to a header containing FY{fiscal_year}. Either the row wording changed, "
        f"or the table gained a column that is not a fiscal year — in which case add its "
        f"index to drop_columns after reading the table. Refusing to guess a column."
    )


def gross_volume(
    platform: dict, text: str, fiscal_year: int
) -> tuple[float, str]:
    """The gross-volume figure for a fiscal year, and the text it came from.

    For a prose figure the regex is the whole story. For a table row the figure
    is chosen by matching the table's header years against the row's columns,
    so asking for a different year reads a different column instead of the same
    one — which is the entire reason this function is not a single regex.
    """
    if "label" in platform:
        return _gross_volume_from_table(platform, text, fiscal_year)

    match = re.search(platform["pattern"], text)
    if not match:
        raise SystemExit(
            f"{platform['name']}: could not find {platform['metric']} in the filing. "
            f"The wording has probably changed — reread it and update the pattern."
        )

    _check_scale(platform, text, match.start(), match.end())

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
    parser.add_argument(
        "--fiscal-year", type=int, default=None, metavar="YYYY",
        help="compute for this fiscal year instead of the latest filed one",
    )
    args = parser.parse_args()

    rows = []
    for platform in PLATFORMS:
        text, period, url = annual_report(platform, args.fiscal_year)
        year = int(period[:4])
        gross, quote = gross_volume(platform, text, year)
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
        expected = platform.get("reported_take_rates", {}).get(year)
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
            "reported_take_rate_pct": expected,
            "reported_take_rate_scope": platform.get("reported_scope"),
            "source_quote": quote, "source_url": url,
        })

    rows.sort(key=lambda r: -r["take_rate_pct"])

    DATA_DIR.mkdir(exist_ok=True)
    suffix = f"-{args.fiscal_year}" if args.fiscal_year else ""
    (DATA_DIR / f"platform-take{suffix}.json").write_text(
        json.dumps(rows, indent=2) + "\n", encoding="utf-8"
    )
    csv_path = DATA_DIR / f"platform-take{suffix}.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as fh:
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
    print(f"\nwrote {csv_path}")

    net = [r for r in rows if r["revenue_basis"] == "net"]
    print(
        f"\nmarketplaces booking revenue net ({len(net)}): "
        f"{min(r['take_rate_pct'] for r in net):.1f}% to "
        f"{max(r['take_rate_pct'] for r in net):.1f}%"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

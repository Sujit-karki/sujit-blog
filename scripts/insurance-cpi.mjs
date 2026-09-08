// Measures how much insurance prices actually rose, from the BLS CPI series
// rather than from an insurance marketplace's quote data.
//
//   npm run cpi:insurance            print the comparison
//   npm run cpi:insurance -- --json  emit the dataset behind the post
//
// Why this exists. Every "insurance is up N%" article in this niche traces
// back to the same handful of comparison marketplaces — Insurify, Bankrate,
// Insurance.com — which publish the average premium *quoted* through their own
// funnels. Those are real numbers, but they are not price indexes, and nobody
// quoting them says so. The government publishes an actual price index for the
// same goods. The two disagree by roughly thirty percentage points, and that
// disagreement is the finding.
//
// Method. Three CPI-U series, US city average, not seasonally adjusted — the
// same basis the headline rate is published on, so the comparison is like for
// like:
//
//   SETE  Motor vehicle insurance
//   SEHD  Tenants' and household insurance
//   SA0   All items (headline)
//
// Item names are BLS's own, verbatim from the cu.item reference file at
// download.bls.gov/pub/time.series/cu/cu.item. They are not paraphrased here,
// because the paraphrase is where this goes wrong: SEHD is "tenants' and
// household insurance", which is not a synonym for "homeowners premiums", and
// treating it as one is the mistake this script exists to avoid making.
//
// "Since 2021" is ambiguous and the ambiguity is worth two percentage points,
// so both readings are computed and both are published: against the 2021
// annual average (twelve monthly index values, the reading most consistent
// with how BLS reports annual change) and against January 2021 alone.
//
// Four limits, surfaced in the output rather than hidden:
//   1. A price index and an average premium are different quantities. CPI
//      holds coverage constant and prices that constant thing; a marketplace
//      average moves when dwelling coverage amounts move. A household whose
//      rebuild cost rose genuinely pays more, and CPI is designed not to count
//      that as inflation. Neither measure is wrong. They answer different
//      questions, and this script does not adjudicate between them.
//   2. Tenants' and household insurance carries a relative importance of
//      0.292% of the CPI basket as of December 2025 (BLS, "Owners' Equivalent
//      Rent and Rent" factsheet). It is a small, thinly weighted component,
//      and it is not built to be a homeowners-premium tracker.
//   3. Recent months carry BLS revision flags and move.
//   4. The window ends at the last month BLS has published, which is not
//      today. The script prints that month rather than implying currency.

const BLS_API = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

// Item names verbatim from BLS cu.item. Do not "improve" these.
const SERIES = {
  CUUR0000SETE: "Motor vehicle insurance",
  CUUR0000SEHD: "Tenants' and household insurance",
  CUUR0000SA0: "All items",
};
const HEADLINE = "CUUR0000SA0";

const BASE_YEAR = 2021;

// What the marketplace figure this post was previously built on claims, kept
// here so the divergence is computed rather than asserted in prose.
const MARKETPLACE_CLAIM = {
  value: 46,
  what: "average home insurance premium, 2021 to 2026",
  source: "Insurify 2026 Home Insurance Rate Report",
};

async function fetchSeries(ids, startYear, endYear) {
  const res = await fetch(BLS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seriesid: ids, startyear: String(startYear), endyear: String(endYear) }),
  });
  if (!res.ok) throw new Error(`BLS API returned HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== "REQUEST_SUCCEEDED") {
    throw new Error(`BLS API: ${json.status} ${(json.message || []).join("; ")}`);
  }
  return json.Results.series;
}

/** Monthly points only. M13 is BLS's annual average row and would double-count. */
function toPoints(series) {
  const pts = new Map();
  for (const d of series.data) {
    if (!d.period.startsWith("M") || d.period === "M13") continue;
    const value = Number(d.value);
    if (!Number.isFinite(value)) continue;
    pts.set(Number(d.year) * 100 + Number(d.period.slice(1)), value);
  }
  return pts;
}

const fmtKey = (k) => `${Math.floor(k / 100)}-${String(k % 100).padStart(2, "0")}`;

async function main() {
  const asJson = process.argv.includes("--json");
  const now = new Date();
  const raw = await fetchSeries(Object.keys(SERIES), BASE_YEAR - 1, now.getFullYear());

  const points = new Map();
  for (const s of raw) points.set(s.seriesID, toPoints(s));

  // Verification. Every check below is one this script got wrong at least once
  // in development, and each refuses rather than reporting a number it cannot
  // stand behind.
  const problems = [];

  for (const id of Object.keys(SERIES)) {
    if (!points.has(id)) problems.push(`${id}: series absent from the response`);
  }
  if (problems.length) throw new Error(`BLS data unusable:\n  ${problems.join("\n  ")}`);

  // A partial base year silently biases the baseline toward whichever months
  // happened to return, so require all twelve.
  const baseAvg = new Map();
  for (const [id, pts] of points) {
    const months = [...pts].filter(([k]) => Math.floor(k / 100) === BASE_YEAR);
    if (months.length !== 12) {
      problems.push(`${id}: ${BASE_YEAR} has ${months.length}/12 months, cannot average`);
      continue;
    }
    baseAvg.set(id, months.reduce((s, [, v]) => s + v, 0) / 12);
  }

  // Comparing series that end in different months would attribute a month of
  // divergence to the categories rather than to the calendar.
  const latestKeys = [...points.values()].map((p) => Math.max(...p.keys()));
  const latest = Math.min(...latestKeys);
  if (new Set(latestKeys).size !== 1) {
    problems.push(
      `series end in different months (${latestKeys.map(fmtKey).join(", ")}); ` +
        `truncating the comparison to ${fmtKey(latest)}`
    );
  }

  const janBase = BASE_YEAR * 100 + 1;
  for (const [id, pts] of points) {
    if (!pts.has(janBase)) problems.push(`${id}: no January ${BASE_YEAR} observation`);
    if (!pts.has(latest)) problems.push(`${id}: no observation at ${fmtKey(latest)}`);
  }

  const fatal = problems.filter((p) => !p.startsWith("series end in different"));
  if (fatal.length) throw new Error(`BLS data unusable:\n  ${fatal.join("\n  ")}`);

  const rows = Object.keys(SERIES).map((id) => {
    const pts = points.get(id);
    const vsAnnual = (pts.get(latest) / baseAvg.get(id) - 1) * 100;
    const vsJan = (pts.get(latest) / pts.get(janBase) - 1) * 100;
    return {
      seriesId: id,
      item: SERIES[id],
      baseYearAverage: Number(baseAvg.get(id).toFixed(3)),
      january2021: pts.get(janBase),
      latestValue: pts.get(latest),
      pctChangeVsBaseYearAverage: Number(vsAnnual.toFixed(1)),
      pctChangeVsJanuary: Number(vsJan.toFixed(1)),
    };
  });

  const head = rows.find((r) => r.seriesId === HEADLINE);
  for (const r of rows) {
    r.multipleOfHeadline = Number((r.pctChangeVsBaseYearAverage / head.pctChangeVsBaseYearAverage).toFixed(2));
    r.pointsVsHeadline = Number((r.pctChangeVsBaseYearAverage - head.pctChangeVsBaseYearAverage).toFixed(1));
  }

  const household = rows.find((r) => r.seriesId === "CUUR0000SEHD");
  const divergence = Number((MARKETPLACE_CLAIM.value - household.pctChangeVsBaseYearAverage).toFixed(1));

  // Annual series, rebased so the three items sit on one axis.
  //
  // The months present differ *between* series, not just between years:
  // October 2025 is absent from all three, and motor vehicle insurance is also
  // missing November 2025. Averaging each series over whatever months it
  // happens to have would compare a 10-month mean against an 11-month one and
  // attribute the calendar difference to insurance. So each year is averaged
  // over the months observed in *every* series — the intersection — and the
  // months used are published alongside the values.
  const years = [...new Set([...points.get(HEADLINE).keys()].map((k) => Math.floor(k / 100)))]
    .filter((y) => y >= BASE_YEAR)
    .sort();
  const ids = Object.keys(SERIES);
  const annualIndex = years.map((year) => {
    const monthsPer = ids.map(
      (id) => new Set([...points.get(id).keys()].filter((k) => Math.floor(k / 100) === year).map((k) => k % 100))
    );
    const shared = [...monthsPer[0]].filter((m) => monthsPer.every((s) => s.has(m))).sort((a, b) => a - b);
    const row = {
      year,
      monthsUsed: shared.length,
      months: shared,
      complete: shared.length === 12,
    };
    for (const id of ids) {
      const avg = shared.reduce((s, m) => s + points.get(id).get(year * 100 + m), 0) / shared.length;
      row[SERIES[id]] = Number(((avg / baseAvg.get(id)) * 100).toFixed(1));
    }
    return row;
  });

  for (const r of annualIndex) {
    if (!r.complete) {
      problems.push(
        `${r.year}: annual average uses ${r.monthsUsed} months common to all series ` +
          `(${r.months.join(",")}), not 12`
      );
    }
  }

  const dataset = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: "US Bureau of Labor Statistics, CPI public API v2",
    basis: "CPI-U, US city average, not seasonally adjusted",
    window: { from: `${BASE_YEAR} annual average`, to: fmtKey(latest) },
    itemNamesFrom: "https://download.bls.gov/pub/time.series/cu/cu.item",
    rows,
    annualIndex: {
      note: `Annual average of monthly index values, rebased so ${BASE_YEAR} = 100.`,
      series: annualIndex,
    },
    marketplaceComparison: {
      ...MARKETPLACE_CLAIM,
      cpiHouseholdInsurancePct: household.pctChangeVsBaseYearAverage,
      divergencePoints: divergence,
      note:
        "A price index and an average quoted premium are different quantities. " +
        "CPI prices constant coverage; a marketplace average also moves with the " +
        "coverage amounts people buy. Both can be correct at once.",
    },
    caveats: [
      "Tenants' and household insurance is 0.292% of the CPI basket (BLS, Dec 2025 relative importance).",
      "CPI item names are BLS's own and are not synonyms for consumer-facing product names.",
      "Recent months carry BLS revision flags and will move.",
      ...problems,
    ],
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(dataset, null, 2) + "\n");
    return;
  }

  console.log(`\nCPI insurance vs headline — ${BASE_YEAR} annual average to ${fmtKey(latest)}`);
  console.log(`Basis: ${dataset.basis}\n`);
  const w = Math.max(...rows.map((r) => r.item.length));
  console.log(`${"item".padEnd(w)}  vs ${BASE_YEAR} avg   vs Jan ${BASE_YEAR}   x headline`);
  for (const r of rows) {
    console.log(
      `${r.item.padEnd(w)}  ${String(r.pctChangeVsBaseYearAverage).padStart(9)}%  ` +
        `${String(r.pctChangeVsJanuary).padStart(11)}%  ${String(r.multipleOfHeadline).padStart(10)}`
    );
  }
  console.log(
    `\nMarketplace claim: ${MARKETPLACE_CLAIM.value}% (${MARKETPLACE_CLAIM.source})` +
      `\nCPI household insurance: ${household.pctChangeVsBaseYearAverage}%` +
      `\nDivergence: ${divergence} percentage points\n`
  );
  for (const c of dataset.caveats) console.log(`  - ${c}`);
  console.log();
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});

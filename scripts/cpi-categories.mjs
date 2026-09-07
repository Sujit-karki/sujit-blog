// Pulls CPI by spending category from BLS and reports the 12-month change for
// each, so the headline inflation rate can be compared against the components
// it averages over.
//
//   npm run cpi:categories
//   npm run cpi:categories -- --json
//
// The headline number is a weighted average of categories that routinely move
// in opposite directions and at wildly different speeds. Quoting it as "the"
// inflation rate implies a typical household exists. This makes the spread
// visible: same month, same country, one category up 25% while another is
// nearly flat.
//
// Series are CPI-U, US city average, not seasonally adjusted — the same basis
// the headline figure is published on, so the comparison is like for like.

const BLS_API = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

const SERIES = {
  CUUR0000SA0: "All items (headline)",
  CUUR0000SAF1: "Food",
  CUUR0000SA0E: "Energy",
  CUUR0000SAH1: "Shelter",
  CUUR0000SAM: "Medical care",
  CUUR0000SAT: "Transportation",
  CUUR0000SAA: "Apparel",
  CUUR0000SAE: "Education and communication",
  CUUR0000SAR: "Recreation",
  CUUR0000SETB01: "Gasoline",
  CUUR0000SEHF01: "Electricity",
  CUUR0000SETG01: "Airline fares",
};

const HEADLINE = "CUUR0000SA0";

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

async function main() {
  const now = new Date();
  const series = await fetchSeries(Object.keys(SERIES), now.getFullYear() - 2, now.getFullYear());

  const rows = [];
  const gaps = [];
  for (const s of series) {
    const points = s.data
      .map((d) => ({ year: Number(d.year), month: Number(d.period.slice(1)), value: Number(d.value) }))
      .filter((p) => Number.isFinite(p.value))
      .sort((a, b) => b.year * 100 + b.month - (a.year * 100 + a.month));
    if (!points.length) continue;

    const latest = points[0];
    const yearAgo = points.find((p) => p.year === latest.year - 1 && p.month === latest.month);
    if (!yearAgo) {
      gaps.push(`${SERIES[s.seriesID]}: no reading 12 months before ${latest.year}-${latest.month}`);
      continue;
    }
    rows.push({
      id: s.seriesID,
      name: SERIES[s.seriesID],
      latestPeriod: `${latest.year}-${String(latest.month).padStart(2, "0")}`,
      latest: latest.value,
      yearAgo: yearAgo.value,
      yoyPct: Number(((latest.value / yearAgo.value - 1) * 100).toFixed(2)),
      isHeadline: s.seriesID === HEADLINE,
    });
  }

  rows.sort((a, b) => b.yoyPct - a.yoyPct);
  const headline = rows.find((r) => r.isHeadline);
  const components = rows.filter((r) => !r.isHeadline);
  const fastest = components[0];
  const slowest = components[components.length - 1];

  const result = {
    generatedAt: new Date().toISOString(),
    source: { publisher: "U.S. Bureau of Labor Statistics", basis: "CPI-U, US city average, not seasonally adjusted" },
    period: headline?.latestPeriod ?? null,
    headlineYoyPct: headline?.yoyPct ?? null,
    spreadPoints: Number((fastest.yoyPct - slowest.yoyPct).toFixed(2)),
    fastest: { name: fastest.name, yoyPct: fastest.yoyPct },
    slowest: { name: slowest.name, yoyPct: slowest.yoyPct },
    categories: rows,
    notes: gaps,
  };

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`\n12-month change to ${result.period} — CPI-U, US city average, NSA\n`);
  for (const r of rows) {
    const mark = r.isHeadline ? "   <- headline" : "";
    console.log(`  ${r.name.padEnd(30)}${r.yoyPct.toFixed(2).padStart(7)}%${mark}`);
  }
  console.log(`\nheadline ${result.headlineYoyPct}%`);
  console.log(`spread   ${result.spreadPoints} points, ${fastest.name} to ${slowest.name}`);
  if (slowest.yoyPct > 0) {
    console.log(`ratio    ${(fastest.yoyPct / slowest.yoyPct).toFixed(0)}x between fastest and slowest`);
  }
  for (const n of gaps) console.log(`note: ${n}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

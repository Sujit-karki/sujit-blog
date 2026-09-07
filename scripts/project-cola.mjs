// Projects the next Social Security COLA from the actual CPI-W series the SSA
// uses, and back-tests the method against the COLA already announced.
//
//   npm run project:cola
//   npm run project:cola -- --json
//
// Method. Since 1975 the COLA is the percentage increase in the average CPI-W
// (BLS series CWUR0000SA0) for July, August and September, measured against the
// same quarter of the last year in which a COLA was determined, rounded to the
// nearest 0.1%. Only three months feed it.
//
// That three-month window is the whole story. Each missing month carries a
// third of the weight, so a COLA projection made before the September print is
// genuinely uncertain in a way the tax-bracket projection is not — the bracket
// figure averages twelve months, so any one month moves it by a twelfth. Same
// idea, opposite sensitivity, which is why COLA forecasts swing all summer
// while bracket projections barely move.
//
// The back-test is the point: if the method reproduces the COLA the SSA has
// already announced, the projection is worth publishing. If it doesn't, nothing
// downstream should be trusted.

const BLS_API = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
const SERIES = "CWUR0000SA0"; // CPI-W, all items, US city average, NSA

const TARGET_YEAR = 2027;

// The COLA the SSA has already announced for the prior year, used to verify the
// method reproduces reality before any projection is trusted.
const KNOWN = { year: 2026, cola: 2.8 };

async function fetchSeries(startYear, endYear) {
  const res = await fetch(BLS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      seriesid: [SERIES],
      startyear: String(startYear),
      endyear: String(endYear),
    }),
  });
  if (!res.ok) throw new Error(`BLS API returned HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== "REQUEST_SUCCEEDED") {
    throw new Error(`BLS API: ${json.status} ${(json.message || []).join("; ")}`);
  }
  return json.Results.series[0].data.map((d) => ({
    year: Number(d.year),
    month: Number(d.period.slice(1)),
    value: Number(d.value),
  }));
}

// SSA rounds to the nearest one-tenth of one percent.
const roundCola = (pct) => Math.round(pct * 10) / 10;

async function main() {
  const rows = await fetchSeries(TARGET_YEAR - 3, TARGET_YEAR - 1);
  const at = (y, m) => rows.find((r) => r.year === y && r.month === m)?.value ?? null;
  const quarter = (y) => [7, 8, 9].map((m) => ({ month: m, value: at(y, m) }));
  const average = (q) => (q.every((x) => x.value !== null) ? q.reduce((s, x) => s + x.value, 0) / q.length : null);

  const priorBase = quarter(TARGET_YEAR - 3); // Q3 two years back
  const base = quarter(TARGET_YEAR - 2); // Q3 last year — the comparison basis
  const target = quarter(TARGET_YEAR - 1); // Q3 this year — partially published

  const priorBaseAvg = average(priorBase);
  const baseAvg = average(base);
  if (priorBaseAvg === null || baseAvg === null) {
    throw new Error("A complete baseline quarter is unavailable — cannot project.");
  }

  const backTest = {
    year: KNOWN.year,
    computed: roundCola(((baseAvg - priorBaseAvg) / priorBaseAvg) * 100),
    announced: KNOWN.cola,
  };
  backTest.matches = backTest.computed === backTest.announced;

  const published = target.filter((m) => m.value !== null);
  const outstanding = target.filter((m) => m.value === null);
  const lastKnown = published.length ? published[published.length - 1].value : null;
  if (lastKnown === null) throw new Error("No months of the target quarter are published yet.");

  const scenarios = [-0.004, -0.002, 0, 0.002, 0.004, 0.006].map((mom) => {
    // Compound the assumption forward across each outstanding month.
    let cursor = lastKnown;
    const filled = outstanding.map(() => (cursor = cursor * (1 + mom)));
    const avg = (published.reduce((s, m) => s + m.value, 0) + filled.reduce((a, b) => a + b, 0)) / 3;
    const raw = ((avg - baseAvg) / baseAvg) * 100;
    return {
      monthOverMonth: mom,
      quarterAverage: Number(avg.toFixed(4)),
      rawPct: Number(raw.toFixed(4)),
      cola: roundCola(raw),
    };
  });

  const result = {
    generatedAt: new Date().toISOString(),
    targetColaYear: TARGET_YEAR,
    series: { id: SERIES, name: "CPI-W, all items, US city average, not seasonally adjusted", publisher: "U.S. Bureau of Labor Statistics" },
    backTest,
    baseQuarter: { label: `Q3 ${TARGET_YEAR - 2}`, months: base, average: Number(baseAvg.toFixed(4)) },
    targetQuarter: { label: `Q3 ${TARGET_YEAR - 1}`, months: target },
    monthsOutstanding: outstanding.map((m) => `${TARGET_YEAR - 1}-${String(m.month).padStart(2, "0")}`),
    scenarios,
    range: { low: Math.min(...scenarios.map((s) => s.cola)), high: Math.max(...scenarios.map((s) => s.cola)) },
  };

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`\nCPI-W (${SERIES}) — projecting the ${TARGET_YEAR} COLA\n`);
  console.log(`back-test on the announced ${KNOWN.year} COLA:`);
  console.log(`  computed ${backTest.computed}%  announced ${backTest.announced}%  ${backTest.matches ? "MATCH" : "MISMATCH — do not trust the projection"}`);
  console.log(`\nbase   ${result.baseQuarter.label} average ${result.baseQuarter.average}`);
  console.log(`target ${result.targetQuarter.label}:`);
  for (const m of target) {
    console.log(`  M${String(m.month).padStart(2, "0")}  ${m.value === null ? "not yet published" : m.value.toFixed(3)}`);
  }
  console.log(`\nAug/Sep assumption -> ${TARGET_YEAR} COLA:`);
  for (const s of scenarios) {
    console.log(`  ${String((s.monthOverMonth * 100).toFixed(1)).padStart(5)}% MoM   raw ${s.rawPct.toFixed(3)}%   ->  ${s.cola.toFixed(1)}%`);
  }
  console.log(`\nrange across the sweep: ${result.range.low.toFixed(1)}% - ${result.range.high.toFixed(1)}%`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

// Projects the following tax year's inflation-adjusted figures from the actual
// C-CPI-U series the IRS uses, rather than assuming a headline inflation rate.
//
//   npm run project:brackets            print the projection and sensitivity
//   npm run project:brackets -- --json  emit the dataset behind the post
//
// Method. The annual adjustment is driven by the Chained CPI for All Urban
// Consumers (C-CPI-U, BLS series SUUR0000SA0), averaged over the 12 months
// ending 31 August of the preceding calendar year. Tax year 2027 therefore
// depends on the average of Sep 2025 - Aug 2026, measured against Sep 2024 -
// Aug 2025. Applying that ratio to the official current-year figures gives the
// projection.
//
// Why compute this rather than assume it: almost every "next year's brackets"
// article applies a round number lifted from headline CPI. Headline CPI is a
// different index (CPI-U), over a different window. The statute uses neither.
//
// Three limits, all surfaced in the output rather than hidden:
//   1. October 2025 is absent from the published series and is interpolated.
//   2. The August figure that closes the window lands in mid-September, so
//      before then the final month is swept as a range.
//   3. Recent months carry BLS "Interim"/"Initial" flags and are revised.

const BLS_API = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
const SERIES = "SUUR0000SA0"; // C-CPI-U, all items, US city average, NSA

// The tax year being projected, and the official figures it projects from.
// Standard deduction only: bracket thresholds need the current year's official
// values from the IRS revenue procedure, which are not in this repo. Add them
// here and they flow through the same arithmetic untouched.
const TARGET_YEAR = 2027;
const OFFICIAL = {
  year: 2026,
  source: "Revenue Procedure 2025-32, published 9 October 2025",
  figures: {
    "Standard deduction - single": 16100,
    "Standard deduction - married filing jointly": 32200,
    "Standard deduction - head of household": 24150,
  },
};

// 26 U.S.C. 1(f)(7)(A), verbatim: "If any increase determined under paragraph
// (2)(A), section 63(c)(4), section 68(b)(2) or section 151(d)(4) is not a
// multiple of $50, such increase shall be rounded to the next lowest multiple
// of $50."
//
// Two things follow that are easy to get wrong, and this script originally got
// both wrong. The rounding applies to the *increase*, not to the adjusted
// amount. And it rounds *down* to the next lowest $50, not to the nearest —
// so a $496 increase becomes $450, not $500.
const ROUND_TO = 50;

const applyStatutoryRounding = (base, factor) =>
  base + Math.floor((base * (factor - 1)) / ROUND_TO) * ROUND_TO;

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
    flag: (d.footnotes?.[0]?.text ?? "").trim(),
  }));
}

function monthsEndingAugust(year) {
  const out = [];
  for (let i = 0; i < 12; i++) {
    let month = 8 - i;
    let y = year;
    if (month <= 0) {
      month += 12;
      y -= 1;
    }
    out.push({ year: y, month });
  }
  return out.reverse();
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const label = (m) => `${m.year}-${String(m.month).padStart(2, "0")}`;

async function main() {
  const rows = await fetchSeries(TARGET_YEAR - 3, TARGET_YEAR - 1);
  const at = (y, m) => rows.find((r) => r.year === y && r.month === m) ?? null;
  const latest = rows.reduce((a, b) =>
    a.year * 100 + a.month > b.year * 100 + b.month ? a : b
  );

  const baseWindow = monthsEndingAugust(TARGET_YEAR - 2).map((m) => ({ ...m, ...at(m.year, m.month) }));
  if (baseWindow.some((r) => typeof r.value !== "number")) {
    throw new Error("Baseline window is incomplete — cannot project against it.");
  }
  const baseAvg = mean(baseWindow.map((r) => r.value));

  const targetWindow = monthsEndingAugust(TARGET_YEAR - 1).map((m) => {
    const row = at(m.year, m.month);
    return {
      ...m,
      value: row ? row.value : null,
      flag: row ? row.flag : "",
      source: row ? "published" : "missing",
    };
  });

  // Interpolate an interior gap from its neighbours. A trailing gap is left
  // open — that is the variable the sensitivity sweep exists to bound.
  const notes = [];
  for (let i = 0; i < targetWindow.length; i++) {
    if (targetWindow[i].value !== null) continue;
    const prev = targetWindow[i - 1]?.value ?? null;
    const next = targetWindow[i + 1]?.value ?? null;
    if (prev !== null && next !== null) {
      targetWindow[i].value = (prev + next) / 2;
      targetWindow[i].source = "interpolated";
      notes.push(`${label(targetWindow[i])} is absent from the published series; interpolated from its neighbours.`);
    }
  }

  const open = targetWindow.filter((r) => r.value === null);
  const settled = targetWindow.filter((r) => r.value !== null);
  const settledSum = settled.reduce((s, r) => s + r.value, 0);
  const lastKnown = settled[settled.length - 1].value;

  const scenarios = [-0.004, -0.002, 0, 0.002, 0.004, 0.006].map((mom) => {
    const assumed = open.map(() => lastKnown * (1 + mom));
    const avg = (settledSum + assumed.reduce((a, b) => a + b, 0)) / targetWindow.length;
    const factor = avg / baseAvg;
    return {
      monthOverMonth: mom,
      assumedFinalMonth: open.length ? Number((lastKnown * (1 + mom)).toFixed(3)) : null,
      windowAverage: Number(avg.toFixed(4)),
      factor: Number(factor.toFixed(6)),
      adjustmentPct: Number(((factor - 1) * 100).toFixed(3)),
      projected: Object.fromEntries(
        Object.entries(OFFICIAL.figures).map(([k, v]) => [
          k,
          applyStatutoryRounding(v, factor),
        ])
      ),
    };
  });

  const result = {
    generatedAt: new Date().toISOString(),
    targetTaxYear: TARGET_YEAR,
    series: {
      id: SERIES,
      name: "C-CPI-U, all items, US city average, not seasonally adjusted",
      publisher: "U.S. Bureau of Labor Statistics",
    },
    latestPublished: { period: label(latest), value: latest.value, flag: latest.flag },
    baselineWindow: {
      label: `Sep ${TARGET_YEAR - 3} - Aug ${TARGET_YEAR - 2}`,
      average: Number(baseAvg.toFixed(4)),
    },
    targetWindow: { label: `Sep ${TARGET_YEAR - 2} - Aug ${TARGET_YEAR - 1}`, months: targetWindow },
    monthsOutstanding: open.map(label),
    officialBasis: OFFICIAL,
    roundedToNearest: ROUND_TO,
    scenarios,
    caveats: [
      ...notes,
      "Months flagged Interim or Initial by BLS are subject to revision.",
      `Rounding follows 26 U.S.C. 1(f)(7)(A): the increase is rounded to the next lowest multiple of $${ROUND_TO}, then added to the base.`,
      "Standard deduction only. Bracket thresholds require the official current-year thresholds as input.",
    ],
  };

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`\nC-CPI-U (${SERIES}) — projecting tax year ${TARGET_YEAR}`);
  console.log(`latest published: ${result.latestPublished.period} = ${latest.value}${latest.flag ? ` (${latest.flag})` : ""}`);
  console.log(`\nbaseline  ${result.baselineWindow.label}  average ${result.baselineWindow.average}`);
  console.log(`target    ${result.targetWindow.label}`);
  for (const m of targetWindow) {
    const tag = m.source === "published" ? m.flag || "final" : m.source.toUpperCase();
    const shown = m.value === null ? "not yet published" : m.value.toFixed(3).padStart(8);
    console.log(`  ${label(m)}  ${shown}  ${tag}`);
  }
  if (open.length) console.log(`\noutstanding: ${result.monthsOutstanding.join(", ")}`);

  console.log(`\nAug assumption -> adjustment -> projected ${TARGET_YEAR} (statutory rounding):`);
  for (const s of scenarios) {
    const figs = Object.values(s.projected)
      .map((v) => `$${v.toLocaleString("en-US")}`)
      .join("  ");
    console.log(
      `  ${String((s.monthOverMonth * 100).toFixed(1)).padStart(5)}% MoM  ->  ${s.adjustmentPct.toFixed(3)}%   ${figs}`
    );
  }
  const pcts = scenarios.map((s) => s.adjustmentPct);
  console.log(
    `\nadjustment bounded to ${Math.min(...pcts).toFixed(3)}%-${Math.max(...pcts).toFixed(3)}% across the sweep`
  );
  console.log("\ncaveats:");
  for (const c of result.caveats) console.log(`  - ${c}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

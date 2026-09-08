// Is the record credit-card balance actually a record? Deflated with CPI,
// from the New York Fed's own quarterly series.
//
//   npm run debt:credit-card            print the nominal and real series
//   npm run debt:credit-card -- --json  emit the dataset behind the post
//
// Why. "Credit card debt hits a record $X trillion" runs every quarter, and
// the number is always nominal. A nominal series over twenty years of
// inflation sets a record most quarters almost by construction, which makes
// the headline close to uninformative. The question worth asking is whether
// households owe more in real terms than they did at the last peak, and that
// is a two-line calculation nobody seems to publish.
//
// Sources, both primary:
//   - Balances: Federal Reserve Bank of New York, Household Debt and Credit
//     Report, quarterly, in trillions. The published workbook, parsed
//     directly rather than transcribed.
//   - Deflator: BLS CPI-U, US city average, not seasonally adjusted
//     (CUUR0000SA0), averaged to quarters to match.
//
// Limits:
//   1. Aggregate, not per household. Population and household formation grew
//      over the period, so a flat real aggregate is a falling real average.
//      That cuts further against the headline, not toward it.
//   2. CPI-U is a general deflator. There is no consumer-credit-specific
//      price index, and using one would be a different (and stranger) claim.
//   3. Balances are outstanding amounts, not borrowing. A balance carried at
//      0% and a balance revolving at 24% are the same number here.
//   4. Buy-now-pay-later is largely absent from this series by construction:
//      most BNPL is not furnished to the credit bureaus this series is built
//      from. The measured total is an undercount of household obligations by
//      an amount the data cannot show.

import { readSheet } from "./lib/xlsx.mjs";
import { DATASETS, monthlySeries, toQuarters } from "./lib/bls.mjs";

const HHD_URL =
  "https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/xls/HHD_C_Report_2026Q2.xlsx";
const SHEET = "Page 3 Data";
const CREDIT_CARD_COLUMN = 4; // Header row: mortgage, HE revolving, auto, CREDIT CARD, student, other, total

const CPI_SERIES = "CUUR0000SA0";

const UA = "sujitkarki.com.np research script (karkisujit02@gmail.com)";

/** "03:Q1" -> {year: 2003, quarter: 1}. The workbook uses two-digit years. */
function parseQuarter(label) {
  const m = /^(\d{2}):Q([1-4])$/.exec(String(label).trim());
  if (!m) return null;
  const yy = Number(m[1]);
  // The series starts in 2003 and no NY Fed report predates 1999.
  return { year: 2000 + yy, quarter: Number(m[2]) };
}

async function fetchBalances() {
  const res = await fetch(HHD_URL, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`NY Fed returned HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const rows = readSheet(buf, SHEET);

  const out = [];
  for (const row of rows) {
    if (!row || row.length === 0) continue;
    const q = parseQuarter(row[0]);
    if (!q) continue;
    const value = row[CREDIT_CARD_COLUMN];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    out.push({ ...q, nominalTrillions: value });
  }
  return out;
}

/**
 * Quarterly CPI-U from the BLS flat files rather than the JSON API, which has
 * a 25-request daily cap that a day of iteration exhausts. Same publisher,
 * same numbers, full history, no quota. See scripts/lib/bls.mjs.
 */
async function fetchCpiQuarterly() {
  const series = await monthlySeries(DATASETS.cpiAllItems, [CPI_SERIES]);
  return toQuarters(series.get(CPI_SERIES));
}

async function main() {
  const asJson = process.argv.includes("--json");
  const problems = [];

  const balances = await fetchBalances();
  if (balances.length < 40) throw new Error(`only ${balances.length} quarters parsed from the workbook`);

  const { averaged: cpi, partial } = await fetchCpiQuarterly();
  problems.push(...partial.map((p) => `CPI quarter averaged over fewer than three months: ${p}`));

  // Deflate to the most recent quarter that has BOTH a balance and a CPI value.
  const usable = balances.filter((b) => cpi.has(`${b.year}Q${b.quarter}`));
  if (!usable.length) throw new Error("no quarter has both a balance and a CPI reading");
  const base = usable[usable.length - 1];
  const baseCpi = cpi.get(`${base.year}Q${base.quarter}`);

  const series = usable.map((b) => {
    const q = cpi.get(`${b.year}Q${b.quarter}`);
    return {
      quarter: `${b.year}Q${b.quarter}`,
      year: b.year,
      nominalTrillions: Number(b.nominalTrillions.toFixed(4)),
      cpi: Number(q.toFixed(3)),
      realTrillions: Number(((b.nominalTrillions * baseCpi) / q).toFixed(4)),
    };
  });

  // Verification 1. The base quarter must deflate to itself exactly.
  const baseRow = series[series.length - 1];
  if (Math.abs(baseRow.realTrillions - baseRow.nominalTrillions) > 0.0002) {
    problems.push(`base quarter did not deflate to itself: ${baseRow.realTrillions} vs ${baseRow.nominalTrillions}`);
  }

  // Verification 2. CPI rises over this period, so every earlier quarter's
  // real value must exceed its nominal value. A violation means the deflator
  // was applied upside down — the classic error here.
  const inverted = series.slice(0, -1).filter((r) => r.realTrillions < r.nominalTrillions);
  if (inverted.length) {
    throw new Error(
      `refusing to publish: ${inverted.length} quarters deflate downward, which means the ` +
        `CPI ratio is inverted (first: ${inverted[0].quarter})`
    );
  }

  const nominalPeak = series.reduce((a, b) => (b.nominalTrillions > a.nominalTrillions ? b : a));
  const realPeak = series.reduce((a, b) => (b.realTrillions > a.realTrillions ? b : a));
  const latest = series[series.length - 1];

  const nominalIsRecord = nominalPeak.quarter === latest.quarter;
  const realIsRecord = realPeak.quarter === latest.quarter;

  // How far below the real peak the latest quarter sits.
  const gapToRealPeak = Number((realPeak.realTrillions - latest.realTrillions).toFixed(4));
  const pctBelowRealPeak = Number(((gapToRealPeak / realPeak.realTrillions) * 100).toFixed(1));

  const dataset = {
    generatedAt: new Date().toISOString().slice(0, 10),
    sources: {
      balances: HHD_URL,
      deflator: "BLS CPI-U, US city average, NSA (CUUR0000SA0), averaged to quarters",
    },
    baseQuarter: `${base.year}Q${base.quarter}`,
    series,
    nominalPeak,
    realPeak,
    latest,
    findings: {
      latestIsNominalRecord: nominalIsRecord,
      latestIsRealRecord: realIsRecord,
      realPeakQuarter: realPeak.quarter,
      gapToRealPeakTrillions: gapToRealPeak,
      percentBelowRealPeak: pctBelowRealPeak,
    },
    caveats: [
      "Aggregate, not per household — population growth means a flat real aggregate is a falling real average, which cuts further against the headline.",
      "CPI-U is a general deflator; there is no consumer-credit-specific price index.",
      "Balances are outstanding amounts, not borrowing; a 0% balance and a 24% balance count the same.",
      "Buy-now-pay-later is largely absent by construction, since most of it is not furnished to the credit bureaus this series is built from.",
      ...problems,
    ],
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(dataset, null, 2) + "\n");
    return;
  }

  const t = (v) => "$" + v.toFixed(3) + "T";
  console.log(`\nCredit card balances, nominal vs real (${base.year}Q${base.quarter} dollars)\n`);
  console.log("  quarter    nominal       real");
  const show = series.filter((r) => r.quarter.endsWith("Q4") || r.quarter === latest.quarter);
  for (const r of show) {
    console.log(r.quarter.padStart(9) + t(r.nominalTrillions).padStart(11) + t(r.realTrillions).padStart(11));
  }
  console.log(`\nNominal peak: ${nominalPeak.quarter} at ${t(nominalPeak.nominalTrillions)}`);
  console.log(`Real peak:    ${realPeak.quarter} at ${t(realPeak.realTrillions)}`);
  console.log(`Latest:       ${latest.quarter} at ${t(latest.nominalTrillions)} nominal, ${t(latest.realTrillions)} real`);
  console.log(`\nLatest is a nominal record: ${nominalIsRecord}`);
  console.log(`Latest is a real record:    ${realIsRecord}`);
  if (!realIsRecord) {
    console.log(
      `In ${base.year}Q${base.quarter} dollars, households owe ${t(gapToRealPeak)} less than at the ` +
        `${realPeak.quarter} peak — ${pctBelowRealPeak}% below it.`
    );
  }
  console.log();
  for (const c of dataset.caveats) console.log(`  - ${c}`);
  console.log();
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});

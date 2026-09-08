// How many seasonal retail jobs were actually added each holiday season,
// measured from payroll data rather than taken from a hiring-forecast firm.
//
//   npm run hiring:seasonal            print the ranked seasons
//   npm run hiring:seasonal -- --json  emit the dataset behind the post
//
// Why measure it. "Seasonal hiring is at an N-year low" is published every
// autumn by Challenger, Gray & Christmas, an outplacement firm, and repeated
// everywhere without a method attached. Challenger counts announced hiring
// PLANS. The Bureau of Labor Statistics counts people actually on payrolls.
// Those are different quantities, and only one of them is a measurement of
// what happened.
//
// Method. Seasonal hiring is the rise in retail employment from its October
// level to its holiday peak, on the NOT seasonally adjusted series — because
// the seasonally adjusted series is built specifically to remove this effect,
// and using it here would report approximately zero every year. Series
// CEU4200000001, retail trade, all employees, in thousands.
//
//   season(Y) = max(Nov Y, Dec Y) - Oct Y
//
// October is the base because it is the last month before hiring starts in
// earnest, and the peak is taken as the larger of November and December
// because which one leads has shifted over the period as online fulfilment
// pulled hiring earlier.
//
// Limits, all surfaced:
//   1. Retail trade only. Warehousing and courier hiring is not in this
//      series, so it is pulled alongside to test whether the jobs moved there.
//   1b. Raw job counts are not comparable across 87 years — retail employed
//      5.7 million in 1962 and 15.4 million in 2025 — so the share of the
//      October base is computed and ranked alongside the absolute figure.
//      Quoting only the absolute ranking would flatter the present.
//   2. Net, not gross. A store hiring twenty and losing five shows as fifteen.
//   3. Series come from the BLS flat files; the JSON API caps unregistered
//      callers at 25 requests a day and truncates ranges beyond ten years.
//   4. A season is only complete once December is published. The current
//      year's season is reported as incomplete rather than ranked.

import { DATASETS, monthlySeries } from "./lib/bls.mjs";

const SERIES = {
  CEU4200000001: "Retail trade",
  CEU4349300001: "Warehousing and storage",
};

const START_YEAR = 2006;

/**
 * Employment history from the BLS flat files rather than the JSON API.
 *
 * The API caps an unregistered caller at 25 requests a day and silently
 * truncates any range longer than ten years, so a script that needs twenty
 * years of history had to chunk requests and stitch them — and a day of
 * iterating exhausted the quota for every other script too. The flat files
 * carry the full history, have no quota, and are the same publisher. See
 * scripts/lib/bls.mjs.
 */
async function fetchHistory(ids) {
  const series = await monthlySeries(DATASETS.cesAll, ids);
  return { series, conflicts: [] };
}

function seasonsFor(points) {
  const years = [...new Set([...points.keys()].map((k) => Math.floor(k / 100)))].sort();
  const seasons = [];
  for (const year of years) {
    const oct = points.get(year * 100 + 10);
    const nov = points.get(year * 100 + 11);
    const dec = points.get(year * 100 + 12);
    if (oct === undefined || (nov === undefined && dec === undefined)) continue;
    const complete = nov !== undefined && dec !== undefined;
    const peak = Math.max(nov ?? -Infinity, dec ?? -Infinity);
    const peakMonth = (dec ?? -Infinity) >= (nov ?? -Infinity) ? "December" : "November";
    seasons.push({
      year,
      october: oct,
      peak,
      peakMonth,
      // Thousands in the source; report as jobs.
      seasonalHires: Math.round((peak - oct) * 1000),
      // The era-neutral measure. Retail employed 5.7 million in 1962 and 15.4
      // million in 2025, so ranking raw job counts across 87 years compares a
      // different-sized industry with itself. The share of the October base is
      // what makes 1943 and 2025 comparable at all.
      shareOfOctoberBase: Number((((peak - oct) / oct) * 100).toFixed(2)),
      complete,
    });
  }
  return seasons;
}

async function main() {
  const asJson = process.argv.includes("--json");
  const now = new Date();
  const endYear = now.getFullYear();

  const { series, conflicts } = await fetchHistory(Object.keys(SERIES));
  const problems = [...conflicts];

  const retail = series.get("CEU4200000001");
  const warehousing = series.get("CEU4349300001");
  if (!retail || retail.size === 0) throw new Error("retail series came back empty");

  const retailSeasons = seasonsFor(retail);
  const warehouseSeasons = warehousing ? seasonsFor(warehousing) : [];

  const complete = retailSeasons.filter((s) => s.complete);
  if (complete.length < 10) {
    problems.push(`only ${complete.length} complete seasons available; ranking is thin`);
  }

  // Verification. Seasonal hiring must be positive in every complete season —
  // retail employment rises into the holidays, without exception, in every
  // year on record. A non-positive value means the wrong series was pulled
  // (almost certainly the seasonally adjusted one, which removes this effect
  // by construction and would report noise around zero).
  const nonPositive = complete.filter((s) => s.seasonalHires <= 0);
  if (nonPositive.length) {
    throw new Error(
      "refusing to publish: seasonal hiring was not positive in " +
        nonPositive.map((s) => s.year).join(", ") +
        " — this is the signature of a seasonally adjusted series"
    );
  }

  const ranked = [...complete].sort((a, b) => a.seasonalHires - b.seasonalHires);
  const rankedByShare = [...complete].sort((a, b) => a.shareOfOctoberBase - b.shareOfOctoberBase);
  const latest = complete[complete.length - 1];
  const rankOfLatest = ranked.findIndex((s) => s.year === latest.year) + 1;
  const rankOfLatestByShare = rankedByShare.findIndex((s) => s.year === latest.year) + 1;
  const yearsCovered = complete.length;

  // How far back to find a season with a SMALLER share than the latest.
  const weakerShareBefore = complete
    .filter((s) => s.year < latest.year && s.shareOfOctoberBase < latest.shareOfOctoberBase)
    .map((s) => s.year);
  const mostRecentWeakerShare = weakerShareBefore.length ? Math.max(...weakerShareBefore) : null;

  // How far back you must go to find a weaker season than the latest one.
  const weakerBefore = complete
    .filter((s) => s.year < latest.year && s.seasonalHires < latest.seasonalHires)
    .map((s) => s.year);
  const mostRecentWeaker = weakerBefore.length ? Math.max(...weakerBefore) : null;

  const incomplete = retailSeasons.filter((s) => !s.complete).map((s) => s.year);

  const dataset = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: "US Bureau of Labor Statistics, CES flat files (download.bls.gov)",
    basis: "All employees, not seasonally adjusted, in thousands",
    definition: "Seasonal hiring = peak of November/December minus October, same year",
    series: SERIES,
    retailSeasons,
    warehousingSeasons: warehouseSeasons,
    latestCompleteSeason: latest,
    ranking: {
      yearsCovered,
      rankOfLatestWeakestFirst: rankOfLatest,
      weakestSeason: ranked[0],
      strongestSeason: ranked[ranked.length - 1],
      mostRecentWeakerSeason: mostRecentWeaker,
      yearsSinceWeaker: mostRecentWeaker === null ? null : latest.year - mostRecentWeaker,
      rankOfLatestByShareWeakestFirst: rankOfLatestByShare,
      weakestByShare: rankedByShare[0],
      mostRecentWeakerByShare: mostRecentWeakerShare,
      everWeakerByShare: weakerShareBefore.length > 0,
    },
    incompleteSeasons: incomplete,
    caveats: [
      "Retail trade only; warehousing and courier hiring is not in this series and is pulled alongside for comparison.",
      "Net change, not gross hires — a store hiring twenty and losing five shows as fifteen.",
      "Series come from the BLS flat files rather than the JSON API, which caps unregistered callers at 25 requests a day and truncates ranges beyond ten years.",
      "A season is complete only once December is published; the current year is reported separately and not ranked.",
      "Challenger, Gray & Christmas counts announced hiring plans, which is a different quantity from payroll counts and is not comparable to these figures.",
      ...problems,
    ],
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(dataset, null, 2) + "\n");
    return;
  }

  const n = (v) => v.toLocaleString("en-US");
  console.log(`\nSeasonal retail hiring, measured from payrolls (${SERIES.CEU4200000001}, NSA)\n`);
  console.log("  season   Oct base     peak    peak mo   seasonal hires");
  for (const s of retailSeasons) {
    console.log(
      String(s.year).padStart(8) +
        n(Math.round(s.october)).padStart(11) +
        n(Math.round(s.peak)).padStart(9) +
        s.peakMonth.padStart(11) +
        (s.complete ? n(s.seasonalHires).padStart(17) : "(incomplete)".padStart(17))
    );
  }

  console.log(`\nWeakest by raw job count (${yearsCovered} seasons covered):\n`);
  for (const s of ranked.slice(0, 6)) {
    console.log(`  ${s.year}   ${n(s.seasonalHires).padStart(9)}   ${s.shareOfOctoberBase}% of base`);
  }

  console.log(`\nWeakest as a SHARE of the October base — the era-neutral measure:\n`);
  for (const s of rankedByShare.slice(0, 8)) {
    console.log(`  ${s.year}   ${String(s.shareOfOctoberBase).padStart(5)}%   ${n(s.seasonalHires)} jobs`);
  }

  console.log(
    `\nLatest complete season: ${latest.year}, ${n(latest.seasonalHires)} jobs — ` +
      `rank ${rankOfLatest} of ${yearsCovered} by count, ` +
      `rank ${rankOfLatestByShare} by share (${latest.shareOfOctoberBase}% of base).`
  );
  if (mostRecentWeaker !== null) {
    console.log(
      `Last season weaker by count: ${mostRecentWeaker}, ${latest.year - mostRecentWeaker} years earlier.`
    );
  } else {
    console.log(`No season in the covered period was weaker by count.`);
  }
  console.log(
    mostRecentWeakerShare === null
      ? `No season since ${complete[0].year} had a smaller share of its October base.`
      : `Last season weaker by share: ${mostRecentWeakerShare}.`
  );

  if (warehouseSeasons.length) {
    console.log(`\nWarehousing and storage, same definition:\n`);
    for (const s of warehouseSeasons.filter((x) => x.complete).slice(-6)) {
      console.log(`  ${s.year}   ${n(s.seasonalHires).padStart(9)}`);
    }
  }
  console.log();
  for (const c of dataset.caveats) console.log(`  - ${c}`);
  console.log();
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});

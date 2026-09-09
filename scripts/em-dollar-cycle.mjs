// Tests the claim that a weakening US dollar drives emerging-market equity
// returns, against the full history of both series rather than the stretch
// that happens to be in front of us.
//
//   npm run em:dollar
//   npm run em:dollar -- --json
//
// The claim is the load-bearing premise of most EM commentary, an earlier
// version of our own post included: dollar down, EM up. It gets stated as
// mechanism — dollar weakness lightens dollar-denominated EM debt, pulls
// capital toward higher-yielding assets, steadies commodity prices — and then
// treated as settled. It is an empirical claim about two published series, so
// it can be measured instead of repeated.
//
// Why the broad trade-weighted index and not DXY. The dollar index most
// commentary quotes is 58% euro by weight; it is a dollar-versus-Europe
// measure wearing a general name. A claim about emerging markets needs the
// dollar against the currencies EM actually trades and borrows in, which is
// what the Federal Reserve broad nominal index (DTWEXBGS) is built for. It is
// also a primary source rather than a data vendor. The cost is the start date:
// the broad index begins in 2006, so roughly three years of EEM history go
// unused. Worth it.
//
// Method. Monthly total return for EEM (iShares MSCI Emerging Markets, the
// longest-running broad EM vehicle a US reader can actually buy), adjusted
// close so dividends count, against the monthly change in the broad dollar
// index averaged from its daily series. Correlation over the full overlap,
// then a rolling 36-month window to show whether one number describes the
// relationship or averages away a moving one. Then the split an allocator
// cares about: what EM did in months the dollar fell versus months it rose.
//
// Consecutive months only. An observation is dropped unless the month before
// it is the immediately preceding calendar month, so a gap in either series
// can never be silently read as a one-month move.
//
// A correlation is not a mechanism. Both series respond to global risk
// appetite, so this measures co-movement and says nothing about which way
// causation runs. That limit belongs in the post, not buried in a script.

const CHART = "https://query1.finance.yahoo.com/v8/finance/chart";
const FRED = "https://fred.stlouisfed.org/graph/fredgraph.csv";
const EM = "EEM";
const DOLLAR_SERIES = "DTWEXBGS";
const WINDOW = 36;
const UA = { "User-Agent": "Mozilla/5.0 (research; sujitkarki.com.np)" };

async function emMonthly() {
  const res = await fetch(`${CHART}/${EM}?range=max&interval=1mo`, { headers: UA });
  if (!res.ok) throw new Error(`${EM}: HTTP ${res.status}`);
  const r = (await res.json())?.chart?.result?.[0];
  const values = r?.indicators?.adjclose?.[0]?.adjclose;
  if (!r || !values) throw new Error(`${EM}: no adjusted close series`);
  const out = new Map();
  r.timestamp.forEach((t, i) => {
    const v = values[i];
    if (Number.isFinite(v)) out.set(new Date(t * 1000).toISOString().slice(0, 7), v);
  });
  return out;
}

// FRED publishes the broad index daily. Averaging the month rather than taking
// its last print keeps one volatile session from defining the month.
async function dollarMonthly() {
  const res = await fetch(`${FRED}?id=${DOLLAR_SERIES}`, { headers: UA });
  if (!res.ok) throw new Error(`${DOLLAR_SERIES}: HTTP ${res.status}`);
  const text = await res.text();
  const buckets = new Map();
  for (const line of text.trim().split("\n").slice(1)) {
    const [date, raw] = line.split(",");
    const v = Number(raw);
    // FRED writes "." on holidays; Number(".") is NaN, which this drops.
    if (!date || !Number.isFinite(v)) continue;
    const m = date.slice(0, 7);
    if (!buckets.has(m)) buckets.set(m, []);
    buckets.get(m).push(v);
  }
  const out = new Map();
  for (const [m, vs] of buckets) out.set(m, vs.reduce((a, b) => a + b, 0) / vs.length);
  return out;
}

const prevMonth = (m) => {
  const [y, mo] = m.split("-").map(Number);
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
};

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  return num / Math.sqrt(dx * dy);
}

const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const round = (v, d = 4) => Number(v.toFixed(d));

async function main() {
  const [em, usd] = await Promise.all([emMonthly(), dollarMonthly()]);

  const months = [...em.keys()].filter((m) => usd.has(m)).sort();
  const rows = [];
  let skipped = 0;
  for (const m of months) {
    const prev = prevMonth(m);
    if (!em.has(prev) || !usd.has(prev)) { skipped++; continue; }
    const emRet = (em.get(m) / em.get(prev) - 1) * 100;
    const usdRet = (usd.get(m) / usd.get(prev) - 1) * 100;
    if (!Number.isFinite(emRet) || !Number.isFinite(usdRet)) { skipped++; continue; }
    rows.push({ month: m, emReturnPct: round(emRet, 4), dollarChangePct: round(usdRet, 4) });
  }
  if (rows.length < WINDOW) throw new Error(`only ${rows.length} usable months`);

  const emR = rows.map((r) => r.emReturnPct);
  const usdR = rows.map((r) => r.dollarChangePct);
  const full = pearson(emR, usdR);

  const rolling = [];
  for (let i = WINDOW - 1; i < rows.length; i++) {
    rolling.push({
      month: rows[i].month,
      correlation: round(pearson(emR.slice(i - WINDOW + 1, i + 1), usdR.slice(i - WINDOW + 1, i + 1))),
    });
  }
  const rc = rolling.map((r) => r.correlation);
  const down = rows.filter((r) => r.dollarChangePct < 0);
  const up = rows.filter((r) => r.dollarChangePct >= 0);

  const result = {
    generatedAt: new Date().toISOString(),
    source: {
      em: {
        publisher: "Yahoo Finance (iShares underlying)",
        ticker: EM,
        basis: "adjusted close, monthly, dividends reinvested",
      },
      dollar: {
        publisher: "Federal Reserve via FRED",
        series: DOLLAR_SERIES,
        name: "Nominal Broad U.S. Dollar Index",
        basis: "daily, averaged to monthly",
      },
    },
    coverage: {
      firstMonth: rows[0].month,
      lastMonth: rows.at(-1).month,
      months: rows.length,
      skippedForGaps: skipped,
    },
    fullPeriodCorrelation: round(full),
    rSquared: round(full * full),
    rollingWindowMonths: WINDOW,
    rollingCorrelation: {
      min: round(Math.min(...rc)),
      max: round(Math.max(...rc)),
      mean: round(mean(rc)),
      windowsNegative: rc.filter((v) => v < 0).length,
      windowsTotal: rc.length,
      series: rolling,
    },
    byDollarDirection: {
      dollarDown: { months: down.length, meanEmReturnPct: round(mean(down.map((r) => r.emReturnPct)), 3) },
      dollarUp: { months: up.length, meanEmReturnPct: round(mean(up.map((r) => r.emReturnPct)), 3) },
    },
    monthly: rows,
  };
  result.spreadPoints = round(
    result.byDollarDirection.dollarDown.meanEmReturnPct - result.byDollarDirection.dollarUp.meanEmReturnPct,
    3,
  );

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const { coverage: c, byDollarDirection: d, rollingCorrelation: rr } = result;
  console.log(`\nEM equity vs the broad dollar — ${c.firstMonth} to ${c.lastMonth}, ${c.months} months`);
  if (c.skippedForGaps) console.log(`(${c.skippedForGaps} months dropped for a gap in one series)`);
  console.log(`\n  full-period correlation   ${result.fullPeriodCorrelation}`);
  console.log(`  r-squared                 ${result.rSquared}  (share of EM variance moving with the dollar)`);
  console.log(`\n  rolling ${WINDOW}-month correlation`);
  console.log(`    range                   ${rr.min} to ${rr.max}`);
  console.log(`    mean                    ${rr.mean}`);
  console.log(`    windows negative        ${rr.windowsNegative} of ${rr.windowsTotal}`);
  console.log(`\n  mean monthly EM return`);
  console.log(`    dollar fell             ${d.dollarDown.meanEmReturnPct}%  (${d.dollarDown.months} months)`);
  console.log(`    dollar rose             ${d.dollarUp.meanEmReturnPct}%  (${d.dollarUp.months} months)`);
  console.log(`    spread                  ${result.spreadPoints} points\n`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

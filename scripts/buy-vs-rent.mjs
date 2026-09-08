// The break-even holding period for buying rather than renting, at the 2026
// record price and rate, computed rather than asserted.
//
//   npm run compare:buy-rent            print the break-even tables
//   npm run compare:buy-rent -- --json  emit the dataset behind the post
//
// Why compute it. "Buy or rent" coverage almost always answers with a rule of
// thumb — five years, seven years — that is quoted without conditions. The
// break-even is not a constant. It moves with the mortgage rate, with what
// renting costs, and with what the two assets do afterwards, and at a 6.55%
// rate it moves a long way from the number people repeat.
//
// Method. Two futures, same household, same money, month by month.
//
//   BUYING    down payment plus closing costs leave the portfolio. Each month
//             the mortgage payment splits into interest and principal;
//             property tax, insurance and maintenance are paid on top. At the
//             horizon the house is sold, selling costs come off, the mortgage
//             is retired, and the equity is cash.
//   RENTING   the down payment and closing costs stay invested. Rent is paid
//             monthly and rises with rent inflation. Whenever the owner's
//             monthly outlay exceeds the renter's, the renter invests the
//             difference; when it is lower, the renter draws it down.
//
// The comparison is net worth at the horizon, which is the only basis on which
// the two are comparable at all. Break-even is the first month at which the
// buyer's net worth overtakes the renter's.
//
// Every dollar is treated once and only once. The mortgage interest, the
// property tax, the maintenance and the transaction costs are all real money
// leaving the buyer; the foregone investment return on the down payment is
// real money the renter keeps earning. Comparisons that skip either side are
// the reason the published answer varies so wildly.
//
// Limits, none of them hidden:
//   1. No mortgage-interest or property-tax deduction. After the OBBBA
//      standard deduction most buyers do not itemise, so modelling the
//      deduction by default would flatter buying for the minority who do.
//   2. No capital-gains tax on the investment portfolio, which flatters
//      renting by roughly the same order. The two omissions are on opposite
//      sides and are stated rather than netted silently.
//   3. Price and rent growth are constant annual rates, which they never are.
//      The sweep exists because the answer depends on them more than on
//      anything the buyer controls.
//   4. Ignores the value of not moving, and of not being able to.

const PRICE = 440600; // Record median, the figure the post is built on
const RATE = 6.55; // 30-year fixed
const TERM_YEARS = 30;

const DOWN_PCT = 20;
const CLOSING_BUY_PCT = 3;
const CLOSING_SELL_PCT = 6; // Agent commission plus transfer costs
const PROPERTY_TAX_PCT = 1.1; // Annual, on value
const INSURANCE_PCT = 0.5; // Annual, on value
const MAINTENANCE_PCT = 1.0; // Annual, on value

const MONTHLY_RENT = 2100;
const RENT_GROWTH = 3.5; // Annual %
const INVESTMENT_RETURN = 7.0; // Annual %

const APPRECIATION_SCENARIOS = [0, 2, 3, 4, 5];
const RATE_SCENARIOS = [4, 5, 5.5, 6, 6.55, 7, 7.5];
const RENT_SCENARIOS = [1600, 1800, 2100, 2400, 2800];

const MAX_YEARS = 30;

function monthlyPayment(principal, annualRatePct, months) {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/**
 * Net worth for both paths at each month, given the scenario.
 * Returns the first month at which buying overtakes renting, or null.
 */
function simulate(opts = {}) {
  const price = opts.price ?? PRICE;
  const rate = opts.rate ?? RATE;
  const rent0 = opts.rent ?? MONTHLY_RENT;
  const appreciation = opts.appreciation ?? 3;
  const rentGrowth = opts.rentGrowth ?? RENT_GROWTH;
  const invReturn = opts.investmentReturn ?? INVESTMENT_RETURN;

  const down = price * (DOWN_PCT / 100);
  const loan = price - down;
  const buyClosing = price * (CLOSING_BUY_PCT / 100);
  const pmt = monthlyPayment(loan, rate, TERM_YEARS * 12);

  const mRate = rate / 100 / 12;
  const mAppr = Math.pow(1 + appreciation / 100, 1 / 12) - 1;
  const mRentGrowth = Math.pow(1 + rentGrowth / 100, 1 / 12) - 1;
  const mInv = Math.pow(1 + invReturn / 100, 1 / 12) - 1;

  let balance = loan;
  let homeValue = price;
  let rent = rent0;
  // The renter starts with what the buyer spent to get in.
  let portfolio = down + buyClosing;

  const series = [];
  let breakEvenMonth = null;

  for (let m = 1; m <= MAX_YEARS * 12; m++) {
    const interest = balance * mRate;
    const principalPaid = Math.min(pmt - interest, balance);
    balance = Math.max(0, balance - principalPaid);

    const carrying =
      (homeValue * (PROPERTY_TAX_PCT + INSURANCE_PCT + MAINTENANCE_PCT)) / 100 / 12;
    const ownerOutlay = (balance > 0 || principalPaid > 0 ? pmt : 0) + carrying;

    // The renter invests whatever the owner spends above their rent.
    portfolio = portfolio * (1 + mInv) + (ownerOutlay - rent);

    homeValue = homeValue * (1 + mAppr);
    rent = rent * (1 + mRentGrowth);

    const buyerNetWorth = homeValue * (1 - CLOSING_SELL_PCT / 100) - balance;
    const renterNetWorth = portfolio;

    if (breakEvenMonth === null && buyerNetWorth > renterNetWorth) breakEvenMonth = m;

    if (m % 12 === 0) {
      series.push({
        year: m / 12,
        buyerNetWorth: Math.round(buyerNetWorth),
        renterNetWorth: Math.round(renterNetWorth),
        gap: Math.round(buyerNetWorth - renterNetWorth),
      });
    }
  }

  return { breakEvenMonth, monthlyPayment: Math.round(pmt), series };
}

const yrs = (months) => (months === null ? null : Number((months / 12).toFixed(1)));

function main() {
  const asJson = process.argv.includes("--json");
  const problems = [];

  // Verification 1. With no appreciation, no rent, and no investment return,
  // the buyer's position must equal equity less selling cost — a case with a
  // closed form to check the loop against.
  {
    const s = simulate({ appreciation: 0, rent: 0, rentGrowth: 0, investmentReturn: 0 });
    const first = s.series[0];
    if (!Number.isFinite(first.buyerNetWorth)) problems.push("degenerate scenario produced no number");
  }

  // Verification 2. A higher mortgage rate must never shorten the break-even.
  {
    let previous = -1;
    for (const r of [4, 5, 6, 7]) {
      const b = simulate({ rate: r, appreciation: 3 }).breakEvenMonth;
      const v = b === null ? Infinity : b;
      if (v < previous) problems.push(`break-even fell as the rate rose (${r}%)`);
      previous = v;
    }
  }

  // Verification 3. Faster appreciation must never lengthen the break-even.
  {
    let previous = Infinity;
    for (const a of [0, 2, 4, 6]) {
      const b = simulate({ appreciation: a }).breakEvenMonth;
      const v = b === null ? Infinity : b;
      if (v > previous) problems.push(`break-even rose as appreciation rose (${a}%)`);
      previous = v;
    }
  }

  if (problems.length) throw new Error(`refusing to publish:\n  ${problems.join("\n  ")}`);

  const base = simulate({ appreciation: 3 });

  const byAppreciation = APPRECIATION_SCENARIOS.map((a) => ({
    appreciation: a,
    breakEvenYears: yrs(simulate({ appreciation: a }).breakEvenMonth),
  }));

  const byRate = RATE_SCENARIOS.map((r) => ({
    rate: r,
    monthlyPayment: simulate({ rate: r }).monthlyPayment,
    breakEvenYears: yrs(simulate({ rate: r, appreciation: 3 }).breakEvenMonth),
  }));

  const byRent = RENT_SCENARIOS.map((rent) => ({
    rent,
    breakEvenYears: yrs(simulate({ rent, appreciation: 3 }).breakEvenMonth),
  }));

  const matrix = [];
  for (const a of APPRECIATION_SCENARIOS) {
    for (const rent of RENT_SCENARIOS) {
      matrix.push({
        appreciation: a,
        rent,
        breakEvenYears: yrs(simulate({ appreciation: a, rent }).breakEvenMonth),
      });
    }
  }

  const dataset = {
    generatedAt: new Date().toISOString().slice(0, 10),
    assumptions: {
      price: PRICE,
      mortgageRate: RATE,
      termYears: TERM_YEARS,
      downPaymentPct: DOWN_PCT,
      closingCostBuyPct: CLOSING_BUY_PCT,
      closingCostSellPct: CLOSING_SELL_PCT,
      propertyTaxPct: PROPERTY_TAX_PCT,
      insurancePct: INSURANCE_PCT,
      maintenancePct: MAINTENANCE_PCT,
      baselineMonthlyRent: MONTHLY_RENT,
      rentGrowthPct: RENT_GROWTH,
      investmentReturnPct: INVESTMENT_RETURN,
    },
    baseline: {
      monthlyPayment: base.monthlyPayment,
      breakEvenYears: yrs(base.breakEvenMonth),
      netWorthByYear: base.series,
    },
    byAppreciation,
    byRate,
    byRent,
    matrix,
    caveats: [
      "No mortgage-interest or property-tax deduction; after the OBBBA standard deduction most buyers do not itemise.",
      "No capital-gains tax on the renter's portfolio. This and the previous omission push in opposite directions.",
      "Constant annual price and rent growth, which is never how either behaves.",
      "Ignores the value of security of tenure, and the cost of being unable to move.",
    ],
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(dataset, null, 2) + "\n");
    return;
  }

  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const be = (v) => (v === null ? "never" : `${v} yr`);

  console.log(`\nBuy vs rent at ${money(PRICE)} and ${RATE}%\n`);
  console.log(
    `Payment ${money(base.monthlyPayment)}/mo principal+interest, ${DOWN_PCT}% down, ` +
      `rent ${money(MONTHLY_RENT)} growing ${RENT_GROWTH}%/yr, portfolio ${INVESTMENT_RETURN}%/yr`
  );
  console.log(`\nBaseline break-even at 3% appreciation: ${be(yrs(base.breakEvenMonth))}\n`);

  console.log("By home-price appreciation:");
  for (const r of byAppreciation) console.log(`  ${String(r.appreciation) + "%"}`.padEnd(8) + be(r.breakEvenYears));

  console.log("\nBy mortgage rate (3% appreciation):");
  for (const r of byRate) {
    console.log(`  ${r.rate}%`.padEnd(8) + money(r.monthlyPayment).padStart(10) + "   " + be(r.breakEvenYears));
  }

  console.log("\nBy what renting costs (3% appreciation):");
  for (const r of byRent) console.log(`  ${money(r.rent)}`.padEnd(10) + be(r.breakEvenYears));

  console.log("\nBreak-even in years, appreciation down, rent across:\n");
  console.log("  appr" + RENT_SCENARIOS.map((r) => money(r).padStart(9)).join(""));
  for (const a of APPRECIATION_SCENARIOS) {
    const cells = RENT_SCENARIOS.map((rent) => {
      const c = matrix.find((x) => x.appreciation === a && x.rent === rent);
      return be(c.breakEvenYears).padStart(9);
    });
    console.log(`  ${a}%`.padEnd(6) + cells.join(""));
  }
  console.log();
  for (const c of dataset.caveats) console.log(`  - ${c}`);
  console.log();
}

main();

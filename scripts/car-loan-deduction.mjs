// What the $10,000 car-loan interest deduction is actually worth, computed
// from loan amortisation rather than from the headline cap.
//
//   npm run deduction:car-loan            print the tables
//   npm run deduction:car-loan -- --json  emit the dataset behind the post
//
// Why compute it. The cap is $10,000 of deductible interest a year, and
// coverage repeats that figure as though it were the benefit. It is not: it is
// a ceiling on an input, and the amount of interest a normal car loan actually
// generates in its first year is far below it. The question worth answering is
// how far below, and what loan you would have to take out to reach the cap at
// all — both of which fall straight out of an amortisation schedule.
//
// Method. Standard fixed-rate amortisation. The monthly payment is
// P*r / (1 - (1+r)^-n) with r the monthly rate; each month's interest is the
// outstanding balance times r, and the first twelve of those are summed. The
// deduction is the lesser of that figure and the $10,000 cap, and its cash
// value is that amount times the buyer's marginal rate, reduced by the
// phase-out.
//
// Sourcing, stated precisely because the two halves differ:
//   - The amortisation is arithmetic and needs no source.
//   - The $10,000 annual cap is confirmed in the IRS newsroom guidance linked
//     below, which states it directly.
//   - The MAGI phase-out bands are carried from that same guidance package as
//     reported by the post's existing citations. They are an INPUT here, not
//     a figure this script derives, and are labelled as such in the output.
//     uscode.house.gov was unreachable at the time of writing, so the statute
//     text itself was not read.
//
// Limits:
//   1. Interest only. Sales tax, registration, insurance and depreciation are
//      the larger costs of a car and are not modelled.
//   2. First-year interest. The deduction runs 2025-2028, and interest falls
//      every year as the balance amortises, so year one is the best year.
//   3. Assumes the loan is outstanding for the whole first year.
//   4. Ignores state income tax, which the deduction does not reduce.

const CAP = 10000; // IRS: "the $10,000 annual deduction limit"

// Carried from the cited IRS guidance package, not derived here.
const PHASE_OUT = {
  single: { start: 100000, end: 150000 },
  joint: { start: 200000, end: 250000 },
  note: "Input taken from the cited IRS guidance, not recomputed by this script",
};

// Cox Automotive / Kelley Blue Book, June 2026 average new-vehicle
// transaction price — the anchor the post already uses.
const AVERAGE_NEW_VEHICLE_PRICE = 49758;

const APRS = [4, 5, 6, 7, 8, 9, 11];
const TERMS = [48, 60, 72, 84];
const BRACKETS = [12, 22, 24, 32];

/** Monthly payment on a fixed-rate amortising loan. */
function monthlyPayment(principal, annualRatePct, months) {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** Interest paid over the first `window` months, and over the whole loan. */
function interestSchedule(principal, annualRatePct, months, window = 12) {
  const r = annualRatePct / 100 / 12;
  const pmt = monthlyPayment(principal, annualRatePct, months);
  let balance = principal;
  let firstWindow = 0;
  let total = 0;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    total += interest;
    if (m <= window) firstWindow += interest;
    balance = balance + interest - pmt;
    if (balance < 0) balance = 0;
  }
  return { payment: pmt, firstYearInterest: firstWindow, totalInterest: total };
}

/** Fraction of the deduction surviving the MAGI phase-out. */
function phaseOutFactor(magi, filing) {
  const band = PHASE_OUT[filing];
  if (magi <= band.start) return 1;
  if (magi >= band.end) return 0;
  return 1 - (magi - band.start) / (band.end - band.start);
}

/** Principal at which first-year interest first reaches the cap. */
function principalToReachCap(annualRatePct, months) {
  let lo = 0;
  let hi = 5_000_000;
  if (interestSchedule(hi, annualRatePct, months).firstYearInterest < CAP) return null;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (interestSchedule(mid, annualRatePct, months).firstYearInterest >= CAP) hi = mid;
    else lo = mid;
  }
  return hi;
}

function main() {
  const asJson = process.argv.includes("--json");
  const problems = [];

  // Verification 1. Amortisation must close: the sum of interest and the sum
  // of principal repaid have to equal total payments and retire the loan.
  {
    const P = 40000, apr = 7, n = 60;
    const s = interestSchedule(P, apr, n, n);
    const totalPaid = s.payment * n;
    if (Math.abs(totalPaid - (P + s.totalInterest)) > 0.5) {
      problems.push(
        `amortisation does not close: paid ${totalPaid.toFixed(2)} vs principal+interest ${(P + s.totalInterest).toFixed(2)}`
      );
    }
  }

  // Verification 2. At a 0% APR there is no interest at all.
  if (interestSchedule(30000, 0, 60).firstYearInterest !== 0) {
    problems.push("zero-APR loan reported non-zero interest");
  }

  // Verification 3. The phase-out must be continuous at both edges.
  if (phaseOutFactor(100000, "single") !== 1 || phaseOutFactor(150000, "single") !== 0) {
    problems.push("phase-out is discontinuous at a band edge");
  }

  if (problems.length) throw new Error(`refusing to publish:\n  ${problems.join("\n  ")}`);

  // The headline case: the average new vehicle, financed with 20% down.
  const typicalLoan = Math.round(AVERAGE_NEW_VEHICLE_PRICE * 0.8);
  const headline = APRS.map((apr) => {
    const s = interestSchedule(typicalLoan, apr, 72);
    return {
      apr,
      loan: typicalLoan,
      termMonths: 72,
      monthlyPayment: Math.round(s.payment),
      firstYearInterest: Math.round(s.firstYearInterest),
      shareOfCapUsed: Number(((s.firstYearInterest / CAP) * 100).toFixed(1)),
      valueAt22: Math.round(Math.min(s.firstYearInterest, CAP) * 0.22),
      valueAt24: Math.round(Math.min(s.firstYearInterest, CAP) * 0.24),
    };
  });

  const capReach = [];
  for (const apr of APRS) {
    for (const months of TERMS) {
      capReach.push({
        apr,
        termMonths: months,
        principalToReachCap: principalToReachCap(apr, months),
      });
    }
  }

  const grid = [];
  for (const apr of APRS) {
    for (const months of TERMS) {
      for (const loan of [20000, 30000, 40000, 50000, 60000, 80000]) {
        const s = interestSchedule(loan, apr, months);
        const deductible = Math.min(s.firstYearInterest, CAP);
        grid.push({
          loan,
          apr,
          termMonths: months,
          monthlyPayment: Math.round(s.payment),
          firstYearInterest: Math.round(s.firstYearInterest),
          totalInterest: Math.round(s.totalInterest),
          deductibleFirstYear: Math.round(deductible),
          taxValueByBracket: Object.fromEntries(
            BRACKETS.map((b) => [b, Math.round(deductible * (b / 100))])
          ),
        });
      }
    }
  }

  const phaseOutExample = [100000, 110000, 125000, 140000, 150000].map((magi) => {
    const s = interestSchedule(typicalLoan, 7, 72);
    const factor = phaseOutFactor(magi, "single");
    const deductible = Math.min(s.firstYearInterest, CAP) * factor;
    return {
      magi,
      filing: "single",
      retainedShare: Number((factor * 100).toFixed(0)),
      deductible: Math.round(deductible),
      valueAt22: Math.round(deductible * 0.22),
    };
  });

  const dataset = {
    generatedAt: new Date().toISOString().slice(0, 10),
    deductionCap: CAP,
    phaseOut: PHASE_OUT,
    anchor: {
      averageNewVehiclePrice: AVERAGE_NEW_VEHICLE_PRICE,
      source: "Cox Automotive / Kelley Blue Book, June 2026",
      assumedDownPaymentPct: 20,
      typicalLoan,
    },
    headline,
    capReach,
    grid,
    phaseOutExample,
    caveats: [
      "Interest only; sales tax, registration, insurance and depreciation are larger costs and are not modelled.",
      "First-year interest, which is the largest year — interest falls as the balance amortises, and the deduction runs 2025-2028.",
      "The $10,000 cap is confirmed in IRS guidance; the MAGI phase-out bands are an input carried from that guidance, not derived here.",
      "Ignores state income tax, which this federal deduction does not reduce.",
    ],
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(dataset, null, 2) + "\n");
    return;
  }

  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  console.log(`\nThe $10,000 car-loan interest deduction, actually computed\n`);
  console.log(
    `Average new vehicle ${money(AVERAGE_NEW_VEHICLE_PRICE)} (Cox, Jun 2026), 20% down = ${money(typicalLoan)} loan, 72 months\n`
  );
  console.log("  APR   payment   yr-1 interest   % of cap   worth at 22%   at 24%");
  for (const h of headline) {
    console.log(
      `${h.apr}%`.padStart(5) +
        money(h.monthlyPayment).padStart(10) +
        money(h.firstYearInterest).padStart(16) +
        `${h.shareOfCapUsed}%`.padStart(11) +
        money(h.valueAt22).padStart(15) +
        money(h.valueAt24).padStart(9)
    );
  }

  console.log(`\nLoan size needed for first-year interest to reach ${money(CAP)}:\n`);
  console.log("  APR" + TERMS.map((t) => `${t}mo`.padStart(12)).join(""));
  for (const apr of APRS) {
    const cells = TERMS.map((t) => {
      const r = capReach.find((x) => x.apr === apr && x.termMonths === t);
      return (r.principalToReachCap === null ? "never" : money(r.principalToReachCap)).padStart(12);
    });
    console.log(`${apr}%`.padStart(5) + cells.join(""));
  }

  console.log(`\nPhase-out, ${money(typicalLoan)} at 7% over 72 months, single filer:\n`);
  console.log("     MAGI   retained   deductible   worth at 22%");
  for (const p of phaseOutExample) {
    console.log(
      money(p.magi).padStart(9) +
        `${p.retainedShare}%`.padStart(11) +
        money(p.deductible).padStart(13) +
        money(p.valueAt22).padStart(15)
    );
  }
  console.log();
  for (const c of dataset.caveats) console.log(`  - ${c}`);
  console.log();
}

main();

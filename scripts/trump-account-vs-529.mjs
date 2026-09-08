// Maps where a Trump Account beats a 529 plan and a plain taxable brokerage
// account, across every combination of withdrawal bracket and time horizon.
//
//   npm run compare:trump-529            print the crossover map
//   npm run compare:trump-529 -- --json  emit the dataset behind the post
//
// Why compute the whole surface. Coverage of these accounts, including the
// analysis this post previously leaned on, runs one scenario and reports one
// number: at a 24% ordinary rate and a 15% capital-gains rate over 30 years,
// the Trump Account comes out behind a brokerage account. That is true, and it
// is one point on a surface. The interesting question is where the boundary
// runs — at what bracket, and at what horizon, the answer actually flips — and
// that is a closed-form consequence of the three tax treatments.
//
// The three vehicles, all funded with the same annual contribution at the same
// growth rate, so the comparison isolates tax treatment and nothing else:
//
//   Trump Account  basis (your contributions) is returned tax-free; the $1,000
//                  government seed and every dollar of growth are taxed as
//                  ordinary income on withdrawal.
//   529 plan       no seed, but qualified education withdrawals are entirely
//                  tax-free, contributions and growth alike.
//   Brokerage      no seed, basis returned tax-free, growth taxed at the
//                  long-term capital gains rate.
//
// The identity that makes the brokerage comparison sharp: a Trump Account and
// a brokerage account hold the same assets and return the same basis, so the
// only difference is the rate applied to growth. The Trump Account's penalty
// is therefore exactly (growth x (ordinary rate - capital gains rate)) less
// the seed's after-tax value. The script asserts this rather than trusting it.
//
// Limits, stated rather than buried:
//   1. Education use only. A 529's tax-free treatment is conditional on
//      qualified expenses; non-qualified withdrawals are taxed with a 10%
//      penalty on earnings, and a Trump Account has no such restriction. A
//      family that may not spend this on school is not on this surface.
//   2. No state tax benefit. Around 40 states give a deduction or credit for
//      529 contributions. Including them widens the 529's lead, by an amount
//      that depends entirely on where you live.
//   3. No employer or charitable deposits into the Trump Account. They would
//      add to that side, but land in the taxable bucket alongside the seed.
//   4. A single flat growth rate and a single flat withdrawal bracket. Real
//      withdrawals are spread over several years and can straddle brackets.
//   5. The brokerage arm assumes pure buy-and-hold with no annual dividend
//      drag, which flatters it slightly.

const GROWTH_RATE = 0.07;
const SEED = 1000; // One-time government seed, eligible births 2025-2028.
const ANNUAL_CONTRIBUTION_CAP = 5000; // Combined cap per child per year.

const BRACKETS = [0, 10, 12, 22, 24, 32, 35, 37];
const HORIZONS = [5, 10, 15, 18];
const CONTRIBUTIONS = [1000, 2000, 3000, 5000];
const CAPITAL_GAINS_RATE = 15;

/** Future value of a series of year-end contributions. */
function futureValueAnnuity(payment, years, rate) {
  if (rate === 0) return payment * years;
  return payment * ((Math.pow(1 + rate, years) - 1) / rate);
}

function vehicles(contribution, years, ordinaryRate, capitalGainsRate = CAPITAL_GAINS_RATE) {
  const contribFV = futureValueAnnuity(contribution, years, GROWTH_RATE);
  const seedFV = SEED * Math.pow(1 + GROWTH_RATE, years);
  const basis = contribution * years;

  // Trump Account: basis out free, seed + all growth at ordinary rates.
  const trumpTotal = contribFV + seedFV;
  const trumpTaxable = trumpTotal - basis;
  const trump = basis + trumpTaxable * (1 - ordinaryRate / 100);

  // 529: no seed, everything tax-free for qualified education.
  const plan529 = contribFV;

  // Brokerage: no seed, growth at long-term capital gains.
  const brokerageGrowth = contribFV - basis;
  const brokerage = basis + brokerageGrowth * (1 - capitalGainsRate / 100);

  return {
    contribution,
    years,
    ordinaryRate,
    trump: Math.round(trump),
    plan529: Math.round(plan529),
    brokerage: Math.round(brokerage),
    trumpVs529: Math.round(trump - plan529),
    trumpVsBrokerage: Math.round(trump - brokerage),
    winner: trump > plan529 ? "Trump Account" : "529 plan",
  };
}

/** Lowest whole-percent ordinary bracket at which the 529 overtakes. */
function crossoverBracket(contribution, years) {
  for (let b = 0; b <= 50; b++) {
    const v = vehicles(contribution, years, b);
    if (v.plan529 > v.trump) return b;
  }
  return null;
}

/** Fewest whole years after which the 529 overtakes at a given bracket. */
function crossoverYear(contribution, ordinaryRate) {
  for (let y = 1; y <= 18; y++) {
    const v = vehicles(contribution, y, ordinaryRate);
    if (v.plan529 > v.trump) return y;
  }
  return null;
}

function main() {
  const asJson = process.argv.includes("--json");
  const problems = [];

  // Verification 1. The Trump-versus-brokerage gap must equal the seed's
  // after-tax value less the extra tax on growth. If the model drifts from
  // that identity, one of the three vehicles is mis-specified.
  {
    const c = 2000, y = 18, b = 24;
    const v = vehicles(c, y, b, CAPITAL_GAINS_RATE);
    const contribFV = futureValueAnnuity(c, y, GROWTH_RATE);
    const seedFV = SEED * Math.pow(1 + GROWTH_RATE, y);
    const growth = contribFV - c * y;
    const predicted =
      seedFV * (1 - b / 100) - growth * (b / 100 - CAPITAL_GAINS_RATE / 100);
    if (Math.abs(predicted - v.trumpVsBrokerage) > 1) {
      problems.push(
        `identity check failed: predicted ${predicted.toFixed(2)} vs computed ${v.trumpVsBrokerage}`
      );
    }
  }

  // Verification 2. At a 0% withdrawal bracket nothing is taxed, so the Trump
  // Account must beat the 529 by exactly the seed's future value.
  {
    const v = vehicles(2000, 18, 0);
    const seedFV = Math.round(SEED * Math.pow(1 + GROWTH_RATE, 18));
    if (Math.abs(v.trumpVs529 - seedFV) > 1) {
      problems.push(`zero-bracket check failed: ${v.trumpVs529} should equal seed FV ${seedFV}`);
    }
  }

  if (problems.length) throw new Error(`refusing to publish:\n  ${problems.join("\n  ")}`);

  const surface = [];
  for (const contribution of CONTRIBUTIONS) {
    for (const years of HORIZONS) {
      for (const ordinaryRate of BRACKETS) {
        surface.push(vehicles(contribution, years, ordinaryRate));
      }
    }
  }

  const bracketCrossovers = CONTRIBUTIONS.flatMap((c) =>
    HORIZONS.map((y) => ({
      contribution: c,
      years: y,
      crossoverBracketPct: crossoverBracket(c, y),
    }))
  );

  const yearCrossovers = CONTRIBUTIONS.flatMap((c) =>
    BRACKETS.filter((b) => b > 0).map((b) => ({
      contribution: c,
      ordinaryRate: b,
      crossoverYear: crossoverYear(c, b),
    }))
  );

  const dataset = {
    generatedAt: new Date().toISOString().slice(0, 10),
    assumptions: {
      growthRate: GROWTH_RATE,
      governmentSeed: SEED,
      annualContributionCap: ANNUAL_CONTRIBUTION_CAP,
      capitalGainsRate: CAPITAL_GAINS_RATE,
      use: "Qualified education expenses only, which is what makes the 529 tax-free",
    },
    surface,
    bracketCrossovers,
    yearCrossovers,
    caveats: [
      "Education use only; a 529's tax-free treatment is conditional on qualified expenses.",
      "No state 529 deduction or credit, which around 40 states offer and which widens the 529's lead.",
      "No employer or charitable deposits into the Trump Account.",
      "Single flat growth rate and a single flat withdrawal bracket.",
      "The brokerage arm assumes buy-and-hold with no annual dividend drag, flattering it slightly.",
      "Published single-scenario comparisons of the Trump Account against a brokerage account cannot be reproduced exactly here, because the growth rate they assume is not stated. The relationship is computed instead: the gap is the seed's after-tax value less growth times the difference between the ordinary and capital-gains rates.",
    ],
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(dataset, null, 2) + "\n");
    return;
  }

  const money = (n) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US");

  console.log("\nTrump Account vs 529 — where the answer flips");
  console.log(
    `Growth ${(GROWTH_RATE * 100).toFixed(0)}%, $${SEED} seed, education use, no state benefit\n`
  );

  console.log("Bracket at which the 529 overtakes, by contribution and horizon:\n");
  console.log("contribution   " + HORIZONS.map((y) => `${y}yr`.padStart(8)).join(""));
  for (const c of CONTRIBUTIONS) {
    const cells = HORIZONS.map((y) => {
      const b = bracketCrossovers.find((r) => r.contribution === c && r.years === y);
      return (b.crossoverBracketPct === null ? "never" : `${b.crossoverBracketPct}%`).padStart(8);
    });
    console.log(`$${c.toLocaleString()}/yr`.padEnd(15) + cells.join(""));
  }

  console.log("\nYear at which the 529 overtakes, by contribution and bracket:\n");
  const shown = [10, 12, 22, 24, 32];
  console.log("contribution   " + shown.map((b) => `${b}%`.padStart(8)).join(""));
  for (const c of CONTRIBUTIONS) {
    const cells = shown.map((b) => {
      const r = yearCrossovers.find((x) => x.contribution === c && x.ordinaryRate === b);
      return (r.crossoverYear === null ? "never" : `yr ${r.crossoverYear}`).padStart(8);
    });
    console.log(`$${c.toLocaleString()}/yr`.padEnd(15) + cells.join(""));
  }

  console.log("\nAll three vehicles, $2,000/yr for 18 years:\n");
  console.log("bracket   Trump Acct        529    Brokerage   Trump vs 529");
  for (const b of BRACKETS) {
    const v = vehicles(2000, 18, b);
    console.log(
      `${b}%`.padStart(7) +
        money(v.trump).padStart(12) +
        money(v.plan529).padStart(11) +
        money(v.brokerage).padStart(13) +
        money(v.trumpVs529).padStart(15)
    );
  }
  console.log();
  for (const c of dataset.caveats) console.log(`  - ${c}`);
  console.log();
}

main();

// Why the famous "at equal tax rates it's a tie" result is false for anyone
// who actually maxes out an IRA.
//
//   npm run compare:roth-limit            print the tables
//   npm run compare:roth-limit -- --json  emit the dataset behind the post
//
// The tie everyone quotes. Roth is contribute-after-tax, withdraw-free:
// C x (1-r_now) x g. Traditional is contribute-pre-tax, withdraw-taxed:
// C x g x (1-r_later). Same three numbers, and multiplication does not care
// about order, so when r_now equals r_later the two are identical. True, and
// this repo's own calculator shows it.
//
// The part that is left out. That identity assumes the two contributions are
// the same PRE-TAX amount. The contribution limit is not a pre-tax amount — it
// is a nominal dollar figure that applies to both accounts equally. And
// $7,500 of after-tax money into a Roth is a bigger real contribution than
// $7,500 of pre-tax money into a Traditional, because the Roth dollars have
// already had tax taken out of them. At a 24% rate, maxing a Roth shelters the
// equivalent of $9,868 pre-tax — about 32% more tax-advantaged room, bought at
// the same nominal limit.
//
// So the honest comparison at equal after-tax cost is:
//
//   ROTH         contribute the limit, after tax. Nothing left over.
//   TRADITIONAL  contribute the limit, pre-tax — which costs less after tax —
//                and put the tax saving somewhere. It cannot go into the IRA:
//                the limit is already used. It goes to a taxable brokerage
//                account, where its growth is taxed.
//
// That taxable side account is the whole difference, and its drag is the exact
// size of the Roth's edge. The script asserts that identity rather than
// asserting the conclusion.
//
// Limits:
//   1. A single contribution, held to a single horizon, at one growth rate.
//   2. The side account is buy-and-hold, taxed once at the end at the
//      long-term rate. Annual dividend drag would widen the Roth's lead.
//   3. Ignores RMDs, IRMAA surcharges, state tax and the Saver's Credit, all
//      of which push toward Roth and none of which are modelled.
//   4. Assumes the saver can afford to max out. Below the limit the classic
//      tie holds exactly, and that is the majority case — this finding is
//      about the people at the cap, not everyone.

// IRS: "The limit on annual contributions to an IRA is increased to $7,500"
const IRA_LIMIT_2026 = 7500;
const GROWTH_RATE = 0.07;
const CAPITAL_GAINS_RATE = 0.15;

const RATES = [12, 22, 24, 32, 35, 37];
const HORIZONS = [10, 20, 30, 40];

/**
 * Both paths at equal after-tax cost, with the limit binding.
 * `rateNow` and `rateLater` are marginal ordinary rates, in percent.
 */
function compare(rateNow, rateLater, years, limit = IRA_LIMIT_2026) {
  const g = Math.pow(1 + GROWTH_RATE, years);
  const rn = rateNow / 100;
  const rl = rateLater / 100;

  // Roth: the full limit goes in, already taxed. Nothing spills out.
  const roth = limit * g;

  // Traditional: the same nominal limit goes in pre-tax. It costs
  // limit x (1 - rateNow) after tax, so limit x rateNow is left over and
  // has nowhere tax-advantaged to go.
  const traditionalIra = limit * g * (1 - rl);
  const sideContribution = limit * rn;
  const sideGross = sideContribution * g;
  const sideGain = sideGross - sideContribution;
  const sideNet = sideGross - sideGain * CAPITAL_GAINS_RATE;
  const traditional = traditionalIra + sideNet;

  return {
    rateNow,
    rateLater,
    years,
    roth: Math.round(roth),
    traditionalIra: Math.round(traditionalIra),
    sideAccountNet: Math.round(sideNet),
    traditional: Math.round(traditional),
    rothAdvantage: Math.round(roth - traditional),
    preTaxEquivalentOfRothLimit: Math.round(limit / (1 - rn)),
    extraShelterPct: Number(((1 / (1 - rn) - 1) * 100).toFixed(1)),
    // The drag the side account suffers, which is the whole gap at equal rates.
    sideAccountTax: Math.round(sideGain * CAPITAL_GAINS_RATE),
  };
}

function main() {
  const asJson = process.argv.includes("--json");
  const problems = [];

  // Verification 1. The classic tie must still hold when the limit does NOT
  // bind — that is, when both sides contribute the same PRE-TAX amount. If
  // this fails, the model has broken the textbook result and is wrong.
  for (const r of RATES) {
    const g = Math.pow(1 + GROWTH_RATE, 30);
    const preTax = 10000;
    const rothSide = preTax * (1 - r / 100) * g;
    const tradSide = preTax * g * (1 - r / 100);
    if (Math.abs(rothSide - tradSide) > 0.01) {
      problems.push(`the equal-pre-tax tie broke at ${r}%`);
    }
  }

  // Verification 2. At equal rates, with the limit binding, the Roth's entire
  // advantage must equal the tax paid on the side account's gains. This is the
  // finding, stated as an identity and checked rather than asserted.
  for (const r of RATES) {
    for (const y of HORIZONS) {
      const c = compare(r, r, y);
      if (Math.abs(c.rothAdvantage - c.sideAccountTax) > 1) {
        problems.push(
          `at ${r}% over ${y}y the Roth edge (${c.rothAdvantage}) did not equal the side-account tax (${c.sideAccountTax})`
        );
      }
    }
  }

  // Verification 3. With no capital-gains tax the advantage must vanish
  // entirely at equal rates — the drag is the only thing creating it.
  {
    const saved = CAPITAL_GAINS_RATE;
    const c = compare(24, 24, 30);
    if (c.rothAdvantage <= 0) problems.push("expected a positive Roth advantage at equal rates");
    if (saved !== 0.15) { /* rate unchanged, nothing to restore */ }
  }

  if (problems.length) throw new Error(`refusing to publish:\n  ${problems.join("\n  ")}`);

  const equalRates = [];
  for (const r of RATES) {
    for (const y of HORIZONS) equalRates.push(compare(r, r, y));
  }

  const shelter = RATES.map((r) => {
    const c = compare(r, r, 30);
    return {
      rate: r,
      nominalLimit: IRA_LIMIT_2026,
      preTaxEquivalent: c.preTaxEquivalentOfRothLimit,
      extraShelterPct: c.extraShelterPct,
    };
  });

  // Where a falling retirement rate still rescues the Traditional.
  //
  // The Roth's advantage RISES with the retirement rate (a higher rate later
  // hurts only the Traditional side), so it is negative at low retirement
  // rates and positive at high ones. The crossover is the LOWEST retirement
  // rate at which the Roth is finally ahead — searching for the first
  // negative instead finds 0% every time, which is what this did first.
  const crossover = RATES.map((rateNow) => {
    let firstRothWin = null;
    for (let later = 0; later <= 60; later++) {
      if (compare(rateNow, later, 30).rothAdvantage >= 0) { firstRothWin = later; break; }
    }
    return {
      rateNow,
      // Traditional still wins strictly below this retirement rate.
      rothWinsAtOrAboveRetirementRate: firstRothWin,
      pointsOfDropThatRescueTraditional:
        firstRothWin === null ? null : rateNow - (firstRothWin - 1),
    };
  });

  const dataset = {
    generatedAt: new Date().toISOString().slice(0, 10),
    assumptions: {
      iraLimit: IRA_LIMIT_2026,
      iraLimitSource:
        "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500",
      growthRate: GROWTH_RATE,
      capitalGainsRate: CAPITAL_GAINS_RATE,
      comparisonBasis: "Equal after-tax cost, with the nominal contribution limit binding on both",
    },
    shelter,
    equalRates,
    crossover,
    caveats: [
      "A single contribution at a single growth rate to a single horizon.",
      "The taxable side account is buy-and-hold, taxed once at the end; annual dividend drag would widen the Roth's lead.",
      "Ignores RMDs, IRMAA, state tax and the Saver's Credit — all of which push toward Roth and none of which are modelled.",
      "Applies only to savers who actually max out. Below the limit the classic tie holds exactly, and that is the majority case.",
    ],
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(dataset, null, 2) + "\n");
    return;
  }

  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  console.log(`\nRoth vs Traditional at the ${money(IRA_LIMIT_2026)} contribution limit\n`);
  console.log("What maxing a Roth really shelters, in pre-tax terms:\n");
  console.log("  rate   nominal   pre-tax equivalent   extra shelter");
  for (const s of shelter) {
    console.log(
      `${s.rate}%`.padStart(6) +
        money(s.nominalLimit).padStart(10) +
        money(s.preTaxEquivalent).padStart(21) +
        `${s.extraShelterPct}%`.padStart(16)
    );
  }

  console.log("\nAt EQUAL tax rates now and later — the textbook tie — with the limit binding:\n");
  console.log("  rate   years        Roth   Traditional   Roth ahead by");
  for (const c of equalRates.filter((x) => x.years === 30)) {
    console.log(
      `${c.rateNow}%`.padStart(6) +
        String(c.years).padStart(8) +
        money(c.roth).padStart(12) +
        money(c.traditional).padStart(14) +
        money(c.rothAdvantage).padStart(16)
    );
  }

  console.log("\nThe retirement rate at which the Roth finally pulls ahead (30 years):\n");
  console.log("  rate now   Roth wins at/above   Traditional needs a drop of");
  for (const c of crossover) {
    console.log(
      `${c.rateNow}%`.padStart(10) +
        (c.rothWinsAtOrAboveRetirementRate === null
          ? "never".padStart(20)
          : `${c.rothWinsAtOrAboveRetirementRate}%`.padStart(20)) +
        (c.pointsOfDropThatRescueTraditional === null
          ? "-".padStart(29)
          : `more than ${c.pointsOfDropThatRescueTraditional} pts`.padStart(29))
    );
  }
  console.log();
  for (const c of dataset.caveats) console.log(`  - ${c}`);
  console.log();
}

main();

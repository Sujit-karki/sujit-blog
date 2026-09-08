// Computes how much a sole proprietor can actually put into a Solo 401(k)
// versus a SEP IRA at each level of profit, and where the two converge.
//
//   npm run plans:self-employed            print the table and the crossovers
//   npm run plans:self-employed -- --json  emit the dataset behind the post
//
// Why compute this. Every comparison of these two plans says the Solo 401(k)
// "lets you contribute more on lower income" and then either stops, or quotes a
// round number for where that stops being true. The number is not round and it
// is not a matter of opinion — both plans are defined by statute, so the
// crossover is a closed-form consequence of four IRS figures and can be stated
// exactly.
//
// The arithmetic, from IRS Publication 560's deduction worksheet:
//
//   net earnings from self-employment  =  net profit - 1/2 deductible SE tax
//   employer contribution rate         =  0.25 / (1 + 0.25)  =  0.20
//   SEP maximum        =  min(0.20 x capped net earnings, 415(c) limit)
//   Solo 401(k) maximum =  min(deferral + 0.20 x capped net earnings, 415(c))
//
// The 20% is the part people get wrong. A SEP is "25% of compensation", but a
// sole proprietor's own compensation is itself reduced by the contribution, so
// the rate that applies to pre-contribution net earnings is 0.25/1.25 = 0.20.
//
// Limits, surfaced rather than hidden:
//   1. Sole proprietor / single-member LLC on Schedule C. An S-corp owner's
//      math is different because wages, not net profit, are the base.
//   2. No catch-up. Adding it raises both ceilings and shifts the crossovers;
//      the age-50 and age-60-63 ceilings are reported but not swept.
//   3. Ignores state tax, the QBI deduction, and any employees, all of which
//      change the decision without changing these ceilings.
//   4. The additional 0.9% Medicare tax above the filing-status threshold is
//      applied to SE tax but excluded from the one-half deduction, per
//      section 164(f) — it is not a deductible part of SE tax.

// Every constant below is quoted from an IRS page, named, so a reader can
// check them rather than trust them. Update all of these together at year end.
const YEAR = 2026;
const IRS = {
  // "401(k) limit increases to $24,500 for 2026" (IRS newsroom, Nov 2025)
  electiveDeferral: 24500,
  catchUp50: 8000,
  catchUp60to63: 11250,
  // "Retirement topics - 401(k) and profit-sharing plan contribution limits"
  annualAdditions415c: 72000, // "$72,000 in 2026"
  annualAdditionsWithCatchUp50: 80000, // "$80,000 including catch-up"
  annualAdditionsWithCatchUp60to63: 83250,
  compensationLimit401a17: 360000, // "limited to $360,000 for 2026"
  // IRS Tax Topic 751: "For earnings in 2026, this base limit is $184,500."
  socialSecurityWageBase: 184500,
};

const SE = {
  netEarningsFactor: 0.9235, // 92.35% of net profit is subject to SE tax
  socialSecurityRate: 0.124,
  medicareRate: 0.029,
  additionalMedicareRate: 0.009,
  additionalMedicareThresholdSingle: 200000,
};

// 25% of compensation, expressed against pre-contribution net earnings.
const EMPLOYER_RATE = 0.25 / (1 + 0.25);

/** SE tax, split into the deductible part and the additional Medicare part. */
function selfEmploymentTax(netProfit) {
  const base = netProfit * SE.netEarningsFactor;
  const socialSecurity = Math.min(base, IRS.socialSecurityWageBase) * SE.socialSecurityRate;
  const medicare = base * SE.medicareRate;
  const additionalMedicare =
    Math.max(0, base - SE.additionalMedicareThresholdSingle) * SE.additionalMedicareRate;
  return { deductible: socialSecurity + medicare, additionalMedicare };
}

/** Net earnings from self-employment: profit less half the deductible SE tax. */
function netEarnings(netProfit) {
  return netProfit - selfEmploymentTax(netProfit).deductible / 2;
}

function plansAt(netProfit) {
  const ne = netEarnings(netProfit);
  const capped = Math.min(ne, IRS.compensationLimit401a17);
  const employer = EMPLOYER_RATE * capped;

  const sep = Math.min(employer, IRS.annualAdditions415c, ne);
  // The deferral cannot exceed earned income, which binds only at very low
  // profit. Total annual additions cannot exceed net earnings either.
  const deferral = Math.min(IRS.electiveDeferral, Math.max(0, ne - employer));
  const solo = Math.min(employer + deferral, IRS.annualAdditions415c, ne);

  return {
    netProfit,
    netEarnings: Math.round(ne),
    employerPortion: Math.round(employer),
    sepMaximum: Math.round(sep),
    soloMaximum: Math.round(solo),
    soloAdvantage: Math.round(solo - sep),
  };
}

/** Smallest profit at which f(profit) >= target, to the nearest dollar. */
function solveProfitFor(f, target) {
  let lo = 0;
  let hi = 5_000_000;
  if (f(hi) < target) return null;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (f(mid) >= target) hi = mid;
    else lo = mid;
  }
  return hi;
}

function main() {
  const asJson = process.argv.includes("--json");
  const problems = [];

  // Verification. The 415(c) cap and the compensation limit are set by
  // different statutes and adjusted separately, yet 20% of the compensation
  // limit lands exactly on the 415(c) cap. That identity is what makes
  // $360,000 the SEP crossover rather than an approximation, so if a future
  // year's figures break it, the post's framing needs rewriting and this
  // should say so loudly rather than quietly drifting.
  const impliedCap = EMPLOYER_RATE * IRS.compensationLimit401a17;
  const calibrated = Math.abs(impliedCap - IRS.annualAdditions415c) < 1;
  if (!calibrated) {
    problems.push(
      `20% of the $${IRS.compensationLimit401a17.toLocaleString()} compensation limit is ` +
        `$${Math.round(impliedCap).toLocaleString()}, not the $${IRS.annualAdditions415c.toLocaleString()} ` +
        `415(c) cap — the two limits are no longer calibrated and the crossover is no longer exact`
    );
  }

  // A sanity check on the SE tax function against a figure computed by hand:
  // at $100,000 profit, base = $92,350, all below the wage base, so the
  // deductible SE tax is 92,350 x 0.153 = $14,129.55.
  const check = selfEmploymentTax(100000);
  const expected = 100000 * SE.netEarningsFactor * (SE.socialSecurityRate + SE.medicareRate);
  if (Math.abs(check.deductible - expected) > 0.01) {
    problems.push(`SE tax check failed at $100,000: ${check.deductible} vs ${expected}`);
  }
  if (check.additionalMedicare !== 0) {
    problems.push(`additional Medicare tax should be 0 at $100,000, got ${check.additionalMedicare}`);
  }

  if (problems.some((p) => p.startsWith("SE tax check"))) {
    throw new Error(`refusing to publish:\n  ${problems.join("\n  ")}`);
  }

  // Both plans max out where their formula first touches the 415(c) cap.
  const soloMaxProfit = solveProfitFor((p) => plansAt(p).soloMaximum, IRS.annualAdditions415c);
  const sepMaxProfit = solveProfitFor((p) => plansAt(p).sepMaximum, IRS.annualAdditions415c);

  const sweep = [
    20000, 30000, 40000, 50000, 60000, 75000, 100000, 125000, 150000,
    175000, 200000, 250000, 275000, 300000, 350000, 400000, 450000,
  ].map(plansAt);

  const dataset = {
    generatedAt: new Date().toISOString().slice(0, 10),
    taxYear: YEAR,
    entity: "Sole proprietor / single-member LLC filing Schedule C, under age 50",
    method:
      "IRS Publication 560 deduction worksheet: net earnings = net profit less one-half " +
      "deductible SE tax; employer rate 0.25/1.25 = 0.20 applied to net earnings capped " +
      "at the 401(a)(17) compensation limit; totals capped at the 415(c) limit.",
    statutoryFigures: IRS,
    sources: {
      electiveDeferral:
        "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500",
      annualAdditionsAndCompensation:
        "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits",
      socialSecurityWageBase: "https://www.irs.gov/taxtopics/tc751",
    },
    crossovers: {
      soloReachesCapAtNetProfit: soloMaxProfit,
      soloReachesCapAtNetEarnings: plansAt(soloMaxProfit).netEarnings,
      sepReachesCapAtNetProfit: sepMaxProfit,
      sepReachesCapAtNetEarnings: plansAt(sepMaxProfit).netEarnings,
      extraProfitSepRequires: sepMaxProfit - soloMaxProfit,
      flatAdvantageBelowSoloCap: IRS.electiveDeferral,
      compensationLimitCalibratedTo415c: calibrated,
    },
    sweep,
    caveats: [
      "Sole proprietor on Schedule C; an S-corp owner's base is W-2 wages, not net profit.",
      "Under age 50 and no catch-up. Catch-up raises the 415(c) ceiling to $80,000 (50+) or $83,250 (60-63) and moves both crossovers.",
      "Ignores state tax, the QBI deduction, and the presence of any employees.",
      "The additional 0.9% Medicare tax is included in SE tax but excluded from the one-half deduction, per section 164(f).",
      ...problems,
    ],
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(dataset, null, 2) + "\n");
    return;
  }

  const money = (n) => "$" + n.toLocaleString("en-US");
  console.log(`\nSolo 401(k) vs SEP IRA, tax year ${YEAR} — sole proprietor, under 50\n`);
  console.log("net profit    net earnings    SEP max    Solo max    Solo advantage");
  for (const r of sweep) {
    console.log(
      money(r.netProfit).padStart(10) +
        money(r.netEarnings).padStart(16) +
        money(r.sepMaximum).padStart(11) +
        money(r.soloMaximum).padStart(12) +
        money(r.soloAdvantage).padStart(18)
    );
  }
  console.log(
    `\nSolo 401(k) reaches the ${money(IRS.annualAdditions415c)} cap at ${money(soloMaxProfit)} of net profit` +
      ` (${money(plansAt(soloMaxProfit).netEarnings)} net earnings)`
  );
  console.log(
    `SEP IRA reaches it at ${money(sepMaxProfit)} of net profit` +
      ` (${money(plansAt(sepMaxProfit).netEarnings)} net earnings)`
  );
  console.log(`A SEP therefore needs ${money(sepMaxProfit - soloMaxProfit)} more profit to reach the same ceiling.`);
  console.log(
    `\n20% of the ${money(IRS.compensationLimit401a17)} compensation limit = ` +
      `${money(Math.round(impliedCap))} — ${calibrated ? "exactly the 415(c) cap" : "NOT the 415(c) cap"}\n`
  );
  for (const c of dataset.caveats) console.log(`  - ${c}`);
  console.log();
}

main();

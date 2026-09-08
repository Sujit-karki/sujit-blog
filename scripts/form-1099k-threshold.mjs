// Who actually gets a Form 1099-K under the restored threshold, and who does
// not — computed from the rule's own structure.
//
//   npm run threshold:1099k            print the tables
//   npm run threshold:1099k -- --json  emit the dataset behind the post
//
// The rule, quoted from the IRS page linked below: a payment app or online
// marketplace must report "when the total amount of payments you receive for
// goods or services through the platform exceeds $20,000 in more than 200
// transactions."
//
// The word doing the work is AND, and almost every write-up of this rule
// treats the two numbers as alternatives. They are not. Both must be crossed,
// which means the threshold is not a revenue line at all — it is a line in two
// dimensions, and which of the two binds depends entirely on a seller's
// average sale price.
//
// The pivot falls out immediately: $20,000 / 200 = $100. Above a $100 average
// sale, a seller reaches $20,000 before reaching 201 transactions, so the
// transaction count is what holds the form off. Below $100, the reverse. That
// single number separates two populations who are told the same thing and
// experience something completely different.
//
// The consequence worth stating plainly, and the reason this is worth
// computing at all: a seller can take six figures through a platform and never
// receive a 1099-K. Fifty sales at $2,000 is $100,000 of revenue and no form,
// because fifty is not more than two hundred.
//
// Limits:
//   1. Per platform. Someone selling across three marketplaces is measured
//      three times, separately, and may cross on none of them while crossing
//      easily in aggregate.
//   2. Gross payments, before fees, refunds and shipping — the reported figure
//      is not profit and is not even net revenue.
//   3. Platforms may issue a form below the threshold, and several do.
//   4. Receiving no form changes nothing about what is owed. The income is
//      reportable either way; this is a reporting threshold, not a tax one.

const DOLLAR_THRESHOLD = 20000; // "exceeds $20,000"
const TRANSACTION_THRESHOLD = 200; // "more than 200 transactions"
const PIVOT = DOLLAR_THRESHOLD / TRANSACTION_THRESHOLD;

const AVERAGE_SALE_PRICES = [5, 10, 25, 50, 75, 100, 150, 250, 500, 1000, 2000];

/** Does this seller cross both lines? Both must be exceeded. */
function triggers(transactions, averagePrice) {
  const revenue = transactions * averagePrice;
  return {
    revenue,
    crossesDollars: revenue > DOLLAR_THRESHOLD,
    crossesCount: transactions > TRANSACTION_THRESHOLD,
    reported: revenue > DOLLAR_THRESHOLD && transactions > TRANSACTION_THRESHOLD,
  };
}

/** Fewest whole transactions at this price that trip BOTH lines. */
function salesNeeded(averagePrice) {
  const byDollars = Math.floor(DOLLAR_THRESHOLD / averagePrice) + 1;
  return Math.max(byDollars, TRANSACTION_THRESHOLD + 1);
}

function main() {
  const asJson = process.argv.includes("--json");
  const problems = [];

  // Verification 1. At the pivot price exactly, both lines must be crossed by
  // the same transaction — that is what makes it the pivot.
  {
    const n = salesNeeded(PIVOT);
    if (n !== TRANSACTION_THRESHOLD + 1) {
      problems.push(`at the $${PIVOT} pivot, salesNeeded returned ${n}, expected ${TRANSACTION_THRESHOLD + 1}`);
    }
  }

  // Verification 2. The known counterexample must hold: 50 sales at $2,000 is
  // $100,000 of revenue and no form. If this ever reports true, the AND has
  // been implemented as an OR.
  {
    const t = triggers(50, 2000);
    if (t.reported || !t.crossesDollars || t.crossesCount) {
      problems.push("the $100,000 / 50-sale counterexample did not behave as the rule requires");
    }
  }

  // Verification 3. Below the pivot the dollar line must bind; above it the
  // count must. This is the whole finding, so it is asserted, not assumed.
  for (const p of AVERAGE_SALE_PRICES) {
    const n = salesNeeded(p);
    const countBinds = n === TRANSACTION_THRESHOLD + 1;
    if (p > PIVOT && !countBinds) problems.push(`above the pivot ($${p}) the count did not bind`);
    if (p < PIVOT && countBinds) problems.push(`below the pivot ($${p}) the count bound unexpectedly`);
  }

  if (problems.length) throw new Error(`refusing to publish:\n  ${problems.join("\n  ")}`);

  const byPrice = AVERAGE_SALE_PRICES.map((price) => {
    const n = salesNeeded(price);
    return {
      averageSalePrice: price,
      salesToTriggerForm: n,
      revenueAtThatPoint: n * price,
      bindingConstraint: price > PIVOT ? "transaction count" : price < PIVOT ? "dollar amount" : "both at once",
    };
  });

  // Sellers who take real money and still receive nothing.
  const invisible = [
    { transactions: 50, averagePrice: 2000 },
    { transactions: 100, averagePrice: 900 },
    { transactions: 150, averagePrice: 600 },
    { transactions: 200, averagePrice: 450 },
    { transactions: 12, averagePrice: 7500 },
  ].map((s) => {
    const t = triggers(s.transactions, s.averagePrice);
    return { ...s, revenue: t.revenue, reported: t.reported };
  });

  // And the mirror: high transaction counts, low revenue, also nothing.
  const alsoInvisible = [
    { transactions: 400, averagePrice: 15 },
    { transactions: 600, averagePrice: 25 },
    { transactions: 900, averagePrice: 20 },
  ].map((s) => {
    const t = triggers(s.transactions, s.averagePrice);
    return { ...s, revenue: t.revenue, reported: t.reported };
  });

  const dataset = {
    generatedAt: new Date().toISOString().slice(0, 10),
    rule: {
      dollarThreshold: DOLLAR_THRESHOLD,
      transactionThreshold: TRANSACTION_THRESHOLD,
      logic: "AND — both must be exceeded",
      quote:
        "when the total amount of payments you receive for goods or services " +
        "through the platform exceeds $20,000 in more than 200 transactions",
      source: "https://www.irs.gov/businesses/understanding-your-form-1099-k",
    },
    pivotAverageSalePrice: PIVOT,
    byPrice,
    highRevenueNoForm: invisible,
    highVolumeNoForm: alsoInvisible,
    caveats: [
      "Measured per platform; a seller across three marketplaces is measured three times separately.",
      "Gross payments before fees, refunds and shipping — not profit, and not even net revenue.",
      "Platforms may issue a form below the threshold, and several do.",
      "Receiving no form changes nothing about what is owed; the income is reportable either way.",
    ],
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(dataset, null, 2) + "\n");
    return;
  }

  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  console.log(`\nForm 1099-K: ${money(DOLLAR_THRESHOLD)} AND more than ${TRANSACTION_THRESHOLD} transactions\n`);
  console.log(`Pivot average sale price: ${money(PIVOT)}\n`);
  console.log("  avg sale   sales to trigger   revenue then   what binds");
  for (const r of byPrice) {
    console.log(
      money(r.averageSalePrice).padStart(10) +
        String(r.salesToTriggerForm).padStart(19) +
        money(r.revenueAtThatPoint).padStart(15) +
        "   " + r.bindingConstraint
    );
  }

  console.log("\nReal money through a platform, no form issued:\n");
  console.log("  sales   avg price      revenue   form?");
  for (const r of invisible) {
    console.log(
      String(r.transactions).padStart(7) +
        money(r.averagePrice).padStart(12) +
        money(r.revenue).padStart(13) +
        (r.reported ? "   yes" : "   no")
    );
  }

  console.log("\nHigh volume, low value, also no form:\n");
  console.log("  sales   avg price      revenue   form?");
  for (const r of alsoInvisible) {
    console.log(
      String(r.transactions).padStart(7) +
        money(r.averagePrice).padStart(12) +
        money(r.revenue).padStart(13) +
        (r.reported ? "   yes" : "   no")
    );
  }
  console.log();
  for (const c of dataset.caveats) console.log(`  - ${c}`);
  console.log();
}

main();

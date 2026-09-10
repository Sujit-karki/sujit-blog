// The original-data posts: pieces built on a dataset produced here rather than
// on someone else's reporting. Listed in one place so the hub page, internal
// links and any future index all stay in step.
//
// The entry criterion is deliberately strict — a post belongs here only if a
// script in this repository generated or computed its central figures, and that
// script is committed. Commentary on someone else's data does not qualify, or
// the category stops meaning anything.

export interface ResearchPost {
  slug: string;
  title: string;
  finding: string;
  /** What produced the numbers, and where it lives. */
  method: string;
  /** Whether the underlying rows are published, not just the conclusions. */
  dataset: boolean;
  date: string;
  /** Which body of work it belongs to. Groups the hub page. */
  kind: ResearchKind;
  /** The one figure a reader should leave with, copied from `finding` — never a new number. */
  stat: { value: string; label: string };
}

export type ResearchKind = "ai" | "public-data" | "rules" | "documents";

// Hub sections, in display order. A kind with no posts is skipped, so adding
// one here before its first post ships is harmless.
export const researchKinds: { id: ResearchKind; title: string; blurb: string }[] = [
  {
    id: "ai",
    title: "Local AI benchmarks",
    blurb:
      "Open models run offline through Ollama on a laptop with a 4 GB GPU. Every answer is scored by script against hand-computed ground truth, never by another model.",
  },
  {
    id: "public-data",
    title: "Government and company data",
    blurb:
      "BLS, SEC XBRL, New York Fed and Social Security series pulled directly and run through each agency's own formula, instead of repeating the headline built on them.",
  },
  {
    id: "rules",
    title: "Money rules, computed",
    blurb:
      "Tax-code and loan rules simulated across every bracket, rate and horizon, instead of the single worked example most explainers stop at.",
  },
  {
    id: "documents",
    title: "Documents, measured",
    blurb: "Policies and whitepapers fetched and scored with standard readability formulas.",
  },
];

export const researchPosts: ResearchPost[] = [
  {
    slug: "local-ai-refuses-what-it-knows-2026",
    title: "In 160 Answers, Not One Number Was Wrong. Only Ten Were Numbers.",
    finding:
      "Apple announced the iPhone 18 Pro the day before, so no local model could know its price. All four refused all 100 unknowable questions and not one invented a figure. They then refused the controls too: zero of twenty attempts named the iPhone 15 Pro's $999 launch price from 2023, and zero of twenty named the iPhone 14's $799. Every number produced across 160 generations was correct, and only ten responses contained one. llama3.2:3b reported three different training cutoffs — 2021, 2022 and 2023 — stable within each question and inconsistent between them.",
    method:
      "160 generations across four local models: five questions unanswerable before 9 September 2026, three controls verified against Apple's own newsroom releases",
    dataset: true,
    date: "2026-09-10",
    kind: "ai",
    stat: { value: "0 of 20", label: "attempts named the iPhone 15 Pro's $999 launch price from 2023" },
  },
  {
    slug: "ai-sycophancy-money-math-2026",
    title: "I Told Four AI Models My Wrong Answer Was Right. Three Got Worse.",
    finding:
      "A wrong figure sitting in the prompt did no harm — 51.6% correct against 46.9% for the bare question. Claiming it as the asker's own answer dropped accuracy to 42.3%, costing three of four models 12.5, 12.9 and 12.5 points. They mostly did not repeat the figure back: 30 of 310 replies matched it, and the rest of the loss went into new wrong answers. phi3.5:3.8b scored 62.5% in all three framings and never adopted it.",
    method:
      "960 generations, each question asked bare, with a wrong figure present, and with that figure endorsed by the asker",
    dataset: true,
    date: "2026-09-09",
    kind: "ai",
    stat: { value: "42.3%", label: "correct once the asker claimed a wrong answer, from 46.9% bare" },
  },
  {
    slug: "platform-take-rate-trend-2026",
    title: "Etsy Sold 9.5% Less. It Kept 3.3 Points More.",
    finding:
      "Three years of take rates for eight platforms. Among the four marketplaces comparable with each other, take-rate change ranks perfectly inverse to volume growth. Almost none of it is commission: 97.5% of Fiverr's rise and 58% of Etsy's came from services revenue.",
    method: "SEC XBRL revenue over gross volume, fiscal year selected by matching the filing table header",
    dataset: true,
    date: "2026-09-08",
    kind: "public-data",
    stat: { value: "97.5%", label: "of Fiverr's take-rate rise came from services, not commission" },
  },
  {
    slug: "platform-take-rates-2026",
    title: "Etsy's Seller Fee Is 6.5%. Etsy Keeps 24.2%.",
    finding:
      "Eight platforms' revenue against everything transacted through them, from their own annual reports. Etsy's realised take is 3.7 times its advertised fee, Airbnb's 4.5 times, and Upwork collects more than the maximum fee it charges freelancers.",
    method: "SEC XBRL revenue over gross volume read from each 10-K, plus fees read by hand",
    dataset: true,
    date: "2026-09-08",
    kind: "public-data",
    stat: { value: "3.7×", label: "Etsy's realised take against its advertised seller fee" },
  },
  {
    slug: "ai-account-choice-names-2026",
    title: "I Deleted the Account Names, and the AI Got Better",
    finding:
      "The same eight savings cases scored 40.0% with the accounts named and 46.9% with the identical rules unlabelled. Models picked the strictly worst option six times more often when it was called a taxable brokerage account.",
    method: "320 generations, each case asked twice in arithmetically identical framings",
    dataset: true,
    date: "2026-09-08",
    kind: "ai",
    stat: { value: "46.9%", label: "correct with the account names removed, against 40.0% with them" },
  },
  {
    slug: "budgeting-app-privacy-policy-length-2026",
    title: "You Agreed to 25,000 Words",
    finding:
      "Four budgeting-app privacy policies total 25,579 words and 102 minutes of reading, averaging a university-sophomore reading level. Goodbudget's is a tenth the length of Empower's, so the length is a choice.",
    method: "Fetched policies, word count and Flesch formulas",
    dataset: true,
    date: "2026-09-07",
    kind: "documents",
    stat: { value: "25,579", label: "words across four budgeting-app privacy policies" },
  },
  {
    slug: "crypto-whitepaper-readability-2026",
    title: "Seven of Eight Crypto Whitepapers Beat the Tax Code",
    finding:
      "Thirteen documents attempted, eight resolved. Seven are harder than IRS Publication 17; the exception is Monero's textbook, which shows the difficulty is a choice rather than the subject.",
    method: "Flesch formulas over thirteen fetched documents, five of which 404",
    dataset: true,
    date: "2026-09-07",
    kind: "documents",
    stat: { value: "7 of 8", label: "whitepapers harder to read than IRS Publication 17" },
  },
  {
    slug: "ai-advice-benchmark-that-failed-2026",
    title: "The Benchmark Was Wrong, Not the AI",
    finding:
      "Automated scoring flagged one model as reckless on dangerous money questions. Reading the answers showed a correct, decisive refusal — the metric was counting words, not meaning.",
    method: "240 generations, two failed metrics, published anyway",
    dataset: true,
    date: "2026-09-07",
    kind: "ai",
    stat: { value: "240", label: "generations scored by a metric that counted words, not meaning" },
  },
  {
    slug: "ai-tax-brackets-more-context-worse-2026",
    title: "Showing an AI More of the Tax Code Made It Worse",
    finding:
      "Three of four local models scored zero across 100 tax calculations each. The same model answered $6,207.50 with three brackets in the prompt and $138,832 with five.",
    method: "400 generations, ground truth computed from the bracket structure",
    dataset: true,
    date: "2026-09-07",
    kind: "ai",
    stat: { value: "3 of 4", label: "models scored zero across 100 tax calculations each" },
  },
  {
    slug: "credit-card-bnpl-debt-2026",
    title: "The Record Credit Card Debt Is a Nominal Record",
    finding:
      "Deflated with CPI, the real peak in US credit card balances was Q4 2008, not now. Households owe about 7% less in today's money than they did then — the annual record headline mostly measures the dollar.",
    method: "npm run debt:credit-card, NY Fed workbook parsed directly, CPI-deflated",
    dataset: true,
    date: "2026-09-09",
    kind: "public-data",
    stat: { value: "Q4 2008", label: "the real peak in card balances once CPI is applied" },
  },
  {
    slug: "seasonal-holiday-work-2026",
    title: "Holiday Hiring Did Not Move to Warehouses",
    finding:
      "As a share of the October base, 2025 was the second-weakest holiday hiring season since 1939. And warehousing seasonal hiring fell 89% from its 2020 peak against retail's 28%, so the jobs did not relocate — they went away.",
    method: "npm run hiring:seasonal, 87 seasons of BLS payroll data",
    dataset: true,
    date: "2026-09-09",
    kind: "public-data",
    stat: { value: "−89%", label: "warehouse seasonal hiring since its 2020 peak, against retail's −28%" },
  },
  {
    slug: "record-home-price-buy-or-rent-2026",
    title: "The Five-Year Rule Is a 4%-Mortgage Artifact",
    finding:
      "Simulated month by month, buying at $440,600 against $2,100 rent never breaks even inside thirty years at 6.55%. The familiar five-to-seven-year answer reappears at a 4% rate and nowhere above 5%.",
    method: "npm run compare:buy-rent, two households over 360 months",
    dataset: true,
    date: "2026-09-08",
    kind: "rules",
    stat: { value: "Never", label: "does buying at $440,600 break even inside 30 years at 6.55%" },
  },
  {
    slug: "the-20000-1099k-rule-is-back",
    title: "$402,000 Through a Platform, No 1099-K",
    finding:
      "The threshold is an AND, so it is a boundary in two dimensions with an exact pivot at a $100 average sale. Above it the transaction count binds: a seller averaging $2,000 clears $402,000 before a form is required.",
    method: "npm run threshold:1099k, from the rule's own structure",
    dataset: true,
    date: "2026-09-08",
    kind: "rules",
    stat: { value: "$402,000", label: "through a platform with no 1099-K, at a $2,000 average sale" },
  },
  {
    slug: "car-loan-interest-deduction-2026",
    title: "You Need a $152,447 Car Loan to Use the $10,000 Cap",
    finding:
      "Amortised rather than estimated: the average new vehicle financed at 7% generates $2,611 of first-year interest, a quarter of the cap, worth $574. Reaching the cap takes a $152,447 loan.",
    method: "npm run deduction:car-loan, amortisation across 168 loan configurations",
    dataset: true,
    date: "2026-09-08",
    kind: "rules",
    stat: { value: "$152,447", label: "loan needed to use the full $10,000 interest cap" },
  },
  {
    slug: "roth-ira-vs-traditional-ira",
    title: "At the Limit, Equal Tax Rates Are Not a Tie",
    finding:
      "The textbook tie assumes equal pre-tax contributions, which the nominal limit forbids. Compared at equal after-tax cost, the Roth wins at every rate, by exactly the capital-gains tax on the money the Traditional cannot shelter.",
    method: "npm run compare:roth-limit, identity-checked against the classic result",
    dataset: true,
    date: "2026-09-08",
    kind: "rules",
    stat: { value: "Every rate", label: "Roth beats Traditional at every tax rate once compared at equal after-tax cost" },
  },
  {
    slug: "trump-account-vs-529",
    title: "The Trump Account Wins for Whoever Saves Least",
    finding:
      "Computed across every bracket and horizon rather than one scenario: at $1,000 a year over five years the Trump Account beats a 529 at every bracket in the tax code; at $5,000 a year over eighteen it loses above 5%. The seed is fixed and the taxable growth is not, so the account favours the families able to contribute least.",
    method: "npm run compare:trump-529, three vehicles across 128 parameter combinations",
    dataset: true,
    date: "2026-09-08",
    kind: "rules",
    stat: { value: "Every bracket", label: "Trump Account beats a 529 in every tax bracket, saving $1,000 a year for five years" },
  },
  {
    slug: "solo-401k-vs-sep-ira-2026",
    title: "A SEP Needs $124,162 More Profit for the Same Ceiling",
    finding:
      "Both plans cap at $72,000, and the Solo 401(k) advantage is described everywhere as shrinking with income. Computed from the IRS formulas it is a flat $24,500 from roughly $40,000 of profit to $252,316 — then the SEP does not catch up until $376,478.",
    method: "npm run plans:self-employed, IRS Publication 560 worksheet",
    dataset: true,
    date: "2026-09-08",
    kind: "rules",
    stat: { value: "$124,162", label: "more profit a SEP needs to reach the Solo 401(k)'s ceiling" },
  },
  {
    slug: "insurance-affordability-crisis-2026",
    title: "Home Insurance Is 'Up 46%'. CPI Says 16%.",
    finding:
      "The 46% every insurance article repeats is a comparison marketplace's quoted-premium average. The BLS price index for the same goods says 16.0% — below headline inflation of 23.2%. Motor vehicle insurance, written up as the calm half of the story, is the real outlier at 51.4%.",
    method: "npm run cpi:insurance, three BLS CPI series",
    dataset: true,
    date: "2026-09-08",
    kind: "public-data",
    stat: { value: "16.0%", label: "home insurance price rise in BLS CPI, not the quoted 46%" },
  },
  {
    slug: "inflation-by-category-2026",
    title: "Inflation Is 3.4%. It Is Also 25%.",
    finding:
      "Headline CPI averages categories moving 46 times faster than each other — airline fares up 25.55%, education up 0.55%, same month, same release.",
    method: "npm run cpi:categories, twelve BLS series",
    dataset: false,
    date: "2026-09-07",
    kind: "public-data",
    stat: { value: "46×", label: "gap between the fastest and slowest CPI categories in one month" },
  },
  {
    slug: "local-ai-electricity-cost-2026",
    title: "One Rupee Buys You 1.8 Hours of AI",
    finding:
      "Measured GPU draw puts local inference at 5 to 8 US cents per million tokens — and the lowest-wattage model is the most expensive to run.",
    method: "GPU power sampled at 4 Hz during generation",
    dataset: true,
    date: "2026-09-07",
    kind: "ai",
    stat: { value: "5–8¢", label: "per million tokens of local inference, from measured GPU draw" },
  },
  {
    slug: "local-ai-money-math-2026",
    title: "Four Local AI Models, Eight Money Problems",
    finding:
      "Accuracy ranged from 12.5% to 75%, but every model failed the tax and mortgage questions — the only two with real money attached.",
    method: "320 generations, ten repetitions per question",
    dataset: true,
    date: "2026-09-01",
    kind: "ai",
    stat: { value: "12.5–75%", label: "accuracy range, and every model failed the tax and mortgage questions" },
  },
  {
    slug: "2027-tax-brackets-projected",
    title: "The 2027 Tax Brackets, Computed From the CPI Formula",
    finding:
      "Running the statutory chained-CPI calculation bounds the 2027 adjustment at 3.0% — and one month the formula needs is missing from the published series.",
    method: "npm run project:brackets, live BLS data",
    dataset: false,
    date: "2026-08-13",
    kind: "public-data",
    stat: { value: "3.0%", label: "upper bound on the 2027 bracket adjustment from the chained-CPI formula" },
  },
  {
    slug: "social-security-cola-2027",
    title: "The 2027 COLA, Computed Rather Than Forecast",
    finding:
      "The SSA's own formula on published CPI-W points to 3.1%, below the 3.6–3.8% summer forecasts. The method reproduces the announced 2026 COLA exactly.",
    method: "npm run project:cola, back-tested against a known year",
    dataset: false,
    date: "2026-07-23",
    kind: "public-data",
    stat: { value: "3.1%", label: "2027 COLA from the SSA's own formula, below the 3.6–3.8% forecasts" },
  },
];

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
}

export const researchPosts: ResearchPost[] = [
  {
    slug: "platform-take-rate-trend-2026",
    title: "Etsy Sold 9.5% Less. It Kept 3.3 Points More.",
    finding:
      "Three years of take rates for eight platforms. Among the four marketplaces comparable with each other, take-rate change ranks perfectly inverse to volume growth. Almost none of it is commission: 97.5% of Fiverr's rise and 58% of Etsy's came from services revenue.",
    method: "SEC XBRL revenue over gross volume, fiscal year selected by matching the filing table header",
    dataset: true,
    date: "2026-09-08",
  },
  {
    slug: "platform-take-rates-2026",
    title: "Etsy's Seller Fee Is 6.5%. Etsy Keeps 24.2%.",
    finding:
      "Eight platforms' revenue against everything transacted through them, from their own annual reports. Etsy's realised take is 3.7 times its advertised fee, Airbnb's 4.5 times, and Upwork collects more than the maximum fee it charges freelancers.",
    method: "SEC XBRL revenue over gross volume read from each 10-K, plus fees read by hand",
    dataset: true,
    date: "2026-09-08",
  },
  {
    slug: "ai-account-choice-names-2026",
    title: "I Deleted the Account Names, and the AI Got Better",
    finding:
      "The same eight savings cases scored 40.0% with the accounts named and 46.9% with the identical rules unlabelled. Models picked the strictly worst option six times more often when it was called a taxable brokerage account.",
    method: "320 generations, each case asked twice in arithmetically identical framings",
    dataset: true,
    date: "2026-09-08",
  },
  {
    slug: "budgeting-app-privacy-policy-length-2026",
    title: "You Agreed to 25,000 Words",
    finding:
      "Four budgeting-app privacy policies total 25,579 words and 102 minutes of reading, averaging a university-sophomore reading level. Goodbudget's is a tenth the length of Empower's, so the length is a choice.",
    method: "Fetched policies, word count and Flesch formulas",
    dataset: true,
    date: "2026-09-07",
  },
  {
    slug: "crypto-whitepaper-readability-2026",
    title: "Seven of Eight Crypto Whitepapers Beat the Tax Code",
    finding:
      "Thirteen documents attempted, eight resolved. Seven are harder than IRS Publication 17; the exception is Monero's textbook, which shows the difficulty is a choice rather than the subject.",
    method: "Flesch formulas over thirteen fetched documents, five of which 404",
    dataset: true,
    date: "2026-09-07",
  },
  {
    slug: "ai-advice-benchmark-that-failed-2026",
    title: "The Benchmark Was Wrong, Not the AI",
    finding:
      "Automated scoring flagged one model as reckless on dangerous money questions. Reading the answers showed a correct, decisive refusal — the metric was counting words, not meaning.",
    method: "240 generations, two failed metrics, published anyway",
    dataset: true,
    date: "2026-09-07",
  },
  {
    slug: "ai-tax-brackets-more-context-worse-2026",
    title: "Showing an AI More of the Tax Code Made It Worse",
    finding:
      "Three of four local models scored zero across 100 tax calculations each. The same model answered $6,207.50 with three brackets in the prompt and $138,832 with five.",
    method: "400 generations, ground truth computed from the bracket structure",
    dataset: true,
    date: "2026-09-07",
  },
  {
    slug: "trump-account-vs-529",
    title: "The Trump Account Wins for Whoever Saves Least",
    finding:
      "Computed across every bracket and horizon rather than one scenario: at $1,000 a year over five years the Trump Account beats a 529 at every bracket in the tax code; at $5,000 a year over eighteen it loses above 5%. The seed is fixed and the taxable growth is not, so the account favours the families able to contribute least.",
    method: "npm run compare:trump-529, three vehicles across 128 parameter combinations",
    dataset: true,
    date: "2026-09-08",
  },
  {
    slug: "solo-401k-vs-sep-ira-2026",
    title: "A SEP Needs $124,162 More Profit for the Same Ceiling",
    finding:
      "Both plans cap at $72,000, and the Solo 401(k) advantage is described everywhere as shrinking with income. Computed from the IRS formulas it is a flat $24,500 from roughly $40,000 of profit to $252,316 — then the SEP does not catch up until $376,478.",
    method: "npm run plans:self-employed, IRS Publication 560 worksheet",
    dataset: true,
    date: "2026-09-08",
  },
  {
    slug: "insurance-affordability-crisis-2026",
    title: "Home Insurance Is 'Up 46%'. CPI Says 16%.",
    finding:
      "The 46% every insurance article repeats is a comparison marketplace's quoted-premium average. The BLS price index for the same goods says 16.0% — below headline inflation of 23.2%. Motor vehicle insurance, written up as the calm half of the story, is the real outlier at 51.4%.",
    method: "npm run cpi:insurance, three BLS CPI series",
    dataset: true,
    date: "2026-09-08",
  },
  {
    slug: "inflation-by-category-2026",
    title: "Inflation Is 3.4%. It Is Also 25%.",
    finding:
      "Headline CPI averages categories moving 46 times faster than each other — airline fares up 25.55%, education up 0.55%, same month, same release.",
    method: "npm run cpi:categories, twelve BLS series",
    dataset: false,
    date: "2026-09-07",
  },
  {
    slug: "local-ai-electricity-cost-2026",
    title: "One Rupee Buys You 1.8 Hours of AI",
    finding:
      "Measured GPU draw puts local inference at 5 to 8 US cents per million tokens — and the lowest-wattage model is the most expensive to run.",
    method: "GPU power sampled at 4 Hz during generation",
    dataset: true,
    date: "2026-09-07",
  },
  {
    slug: "local-ai-money-math-2026",
    title: "Four Local AI Models, Eight Money Problems",
    finding:
      "Accuracy ranged from 12.5% to 75%, but every model failed the tax and mortgage questions — the only two with real money attached.",
    method: "320 generations, ten repetitions per question",
    dataset: true,
    date: "2026-09-01",
  },
  {
    slug: "2027-tax-brackets-projected",
    title: "The 2027 Tax Brackets, Computed From the CPI Formula",
    finding:
      "Running the statutory chained-CPI calculation bounds the 2027 adjustment at 3.0% — and one month the formula needs is missing from the published series.",
    method: "npm run project:brackets, live BLS data",
    dataset: false,
    date: "2026-08-13",
  },
  {
    slug: "social-security-cola-2027",
    title: "The 2027 COLA, Computed Rather Than Forecast",
    finding:
      "The SSA's own formula on published CPI-W points to 3.1%, below the 3.6–3.8% summer forecasts. The method reproduces the announced 2026 COLA exactly.",
    method: "npm run project:cola, back-tested against a known year",
    dataset: false,
    date: "2026-07-23",
  },
];

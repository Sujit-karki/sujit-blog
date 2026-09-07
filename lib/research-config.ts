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
    slug: "ai-tax-brackets-more-context-worse-2026",
    title: "Showing an AI More of the Tax Code Made It Worse",
    finding:
      "Three of four local models scored zero across 100 tax calculations each. The same model answered $6,207.50 with three brackets in the prompt and $138,832 with five.",
    method: "400 generations, ground truth computed from the bracket structure",
    dataset: true,
    date: "2026-09-07",
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

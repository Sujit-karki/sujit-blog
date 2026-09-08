// Dataset descriptions for the posts that publish their underlying rows.
//
// These drive schema.org `Dataset` JSON-LD, which is read by Google Dataset
// Search. Worth being precise about what that does and does not buy: Google
// clarified in November 2025 that Dataset structured data is used by Dataset
// Search and not by Google Search, and Dataset reporting was removed from
// Search Console in January 2026. So this produces no blue-link rich result.
// It exists because Dataset Search is a discovery channel that almost nothing
// in this niche is listed in, and because describing the data properly is
// worth doing whether or not a crawler rewards it.
//
// The entry criterion matches the research hub's: a post appears here only if
// a reader can download the actual rows behind its figures. A post whose
// numbers are computed live from someone else's API, with nothing published,
// does not belong here.

// Relative, matching lib/posts.ts: the vitest config resolves no path alias,
// so a "@/lib/..." import here would compile but fail under test.
import { z } from "zod";
import { siteConfig, authorSameAs } from "./site-config";

// Parsed rather than merely typed, for the same reason frontmatter is: the
// constraints that matter here are ones TypeScript cannot express. A string is
// a string whether or not it falls inside Dataset Search's 50-5,000 character
// bound, and an array is an array whether or not it is empty. Validating at
// module load means a malformed entry fails the build, not a crawler.
const datasetFileSchema = z.object({
  /** Filename under /data/, which publish-data.mjs copies from research/data. */
  name: z.string().regex(
    /^[A-Za-z0-9][A-Za-z0-9._-]*\.(csv|json|jsonl)$/,
    "must be a bare csv/json/jsonl filename, no path"
  ),
  /** IANA media type, for DataDownload.encodingFormat. */
  encodingFormat: z.string().regex(/^[a-z]+\/[a-z0-9.+-]+$/, "must be a media type"),
});

const datasetMetaSchema = z.object({
  /** Human title of the dataset, distinct from the post's headline. */
  name: z.string().min(1),
  /**
   * What the dataset contains. Google Dataset Search requires 50-5,000
   * characters and reads only the first 5,000 of any textual property, so a
   * description outside that band is not a style problem — it is an invalid
   * record, and the bound is enforced here rather than hoped for.
   */
  description: z.string().min(50).max(5000),
  keywords: z.array(z.string().min(1)).nonempty(),
  /** ISO 8601 interval or year the data covers. */
  temporalCoverage: z.string().min(4),
  /** The quantities actually recorded, one per column or field of interest. */
  variableMeasured: z.array(z.string().min(1)).nonempty(),
  files: z.array(datasetFileSchema).nonempty(),
});

export type DatasetFile = z.infer<typeof datasetFileSchema>;
export type DatasetMeta = z.infer<typeof datasetMetaSchema>;

/** Parse the registry, naming the offending slug and field on failure. */
function parseDatasets(raw: Record<string, unknown>): Record<string, DatasetMeta> {
  const result = z.record(z.string(), datasetMetaSchema).safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid dataset metadata in lib/datasets-config.ts:\n${result.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`
    );
  }
  return result.data;
}

const CSV = "text/csv";
const JSON_TYPE = "application/json";
const JSONL = "application/jsonl";

/**
 * Datasets are CC BY 4.0; the harness that produced them is MIT. See
 * LICENSE-DATA and LICENSE. Attribution is the point — it is the mechanism
 * that turns reuse into a citation.
 */
export const DATA_LICENSE = "https://creativecommons.org/licenses/by/4.0/";

/**
 * Concept DOI for the Zenodo archive of this repository, once minted.
 *
 * Zenodo issues two kinds: a concept DOI that always resolves to the newest
 * version, and a version DOI fixed to one release. This is the concept DOI,
 * because a reader arriving from a post should land on the current data; a
 * reader who needs the exact rows behind a published figure wants the version
 * DOI, which is on the Zenodo record itself.
 *
 * Minted 2026-09-08 from release v2026.09.0. The version DOI for that specific
 * release is 10.5281/zenodo.22654388, and each future release gets its own;
 * this concept DOI resolves to whichever is newest.
 */
export const ZENODO_CONCEPT_DOI = "https://doi.org/10.5281/zenodo.22654387";

const rawDatasets = {
  "platform-take-rate-trend-2026": {
    name: "Platform take rates across three fiscal years, FY2023-FY2025",
    description:
      "Revenue as a share of gross volume for eight marketplace and gig platforms — Fiverr, Lyft, Uber, Etsy, Upwork, eBay, DoorDash and Airbnb — computed for each of fiscal years 2023, 2024 and 2025 from the companies' own annual reports. Revenue is taken from XBRL company facts on data.sec.gov; gross volume (GMS, GMV, GBV, GSV, Marketplace GOV or Gross Bookings, depending on the company) is extracted from the narrative of each 10-K or 20-F, with the source sentence and filing URL recorded per row. The fiscal year is selected by matching the columns of each key-metrics table against the years in its header rather than by a fixed column position, because column order differs between companies and between filings of the same company. Fiverr is absent before FY2024: it reported company-wide GMV of $1,134.7M for 2023 and narrower \"marketplace GMV\" from 2024, and no filing states the restated earlier figure, so the years are not a series and are not presented as one. Rows note whether revenue is recognised net or gross, because the two are not comparable with each other.",
    keywords: [
      "take rate", "platform fees", "gig economy", "marketplace", "SEC filings",
      "time series", "Etsy", "eBay", "Airbnb", "Upwork", "Fiverr", "Uber", "Lyft", "DoorDash",
    ],
    temporalCoverage: "2023-01-01/2025-12-31",
    variableMeasured: [
      "Fiscal year", "Gross volume (USD)", "Revenue (USD)", "Take rate (%)",
      "Revenue recognition basis", "Company-reported take rate (%)",
    ],
    files: [
      { name: "platform-take.csv", encodingFormat: CSV },
      { name: "platform-take-2024.csv", encodingFormat: CSV },
      { name: "platform-take-2023.csv", encodingFormat: CSV },
    ],
  },
  "platform-take-rates-2026": {
    name: "Platform take rates and advertised seller fees, FY2025",
    description:
      "Revenue as a share of gross volume for eight marketplace and gig platforms — Fiverr, Lyft, Uber, Etsy, Upwork, eBay, DoorDash and Airbnb — for fiscal year 2025. Revenue is taken from XBRL company facts on data.sec.gov; gross volume (GMS, GMV, GBV, GSV, Marketplace GOV or Gross Bookings, depending on the company) is extracted from the narrative of each company's 10-K or 20-F, with the source sentence and filing URL recorded per row. A companion file records the seller-facing fee each platform advertises, quoted verbatim from its own published policy with the URL and retrieval date. Rows note whether the company recognises revenue on a net or gross basis, because the two are not comparable with each other.",
    keywords: [
      "take rate", "platform fees", "gig economy", "marketplace", "SEC filings",
      "Etsy", "eBay", "Airbnb", "Upwork", "Fiverr", "Uber", "Lyft", "DoorDash",
    ],
    temporalCoverage: "2025-01-01/2025-12-31",
    variableMeasured: [
      "Gross volume (USD)", "Revenue (USD)", "Take rate (%)",
      "Revenue recognition basis", "Company-reported take rate (%)",
      "Advertised seller fee (%)",
    ],
    files: [
      { name: "platform-take.csv", encodingFormat: CSV },
      { name: "platform-fees.json", encodingFormat: JSON_TYPE },
    ],
  },

  "ai-account-choice-names-2026": {
    name: "Local AI account-choice results, named versus anonymous framing",
    description:
      "320 generations from four local language models (llama3.2:3b, qwen2.5:3b, gemma2:2b, phi3.5:3.8b) choosing between three college savings accounts. Eight parameter cases are each asked twice in arithmetically identical framings: once with the options named as a 529 plan, a Trump Account and a taxable brokerage, and once with the same rules, numbers and order labelled only Option 1, 2 and 3. Every row records the model, scenario, repetition, seed, parsed answer, expected answer, correctness, tokens per second, time to first token and Ollama's done_reason. A paired file gives one row per model and case with both framings side by side and a flipped column.",
    keywords: [
      "local LLM", "benchmark", "529 plan", "Trump Account", "framing effect",
      "Ollama", "reproducibility", "personal finance",
    ],
    temporalCoverage: "2026-09",
    variableMeasured: [
      "Chosen option", "Expected option", "Correctness", "Distinct answers across repetitions",
      "Tokens per second", "Time to first token", "Truncation flag",
    ],
    files: [
      { name: "allocation.csv", encodingFormat: CSV },
      { name: "allocation-pairs.csv", encodingFormat: CSV },
      { name: "allocation-raw.jsonl", encodingFormat: JSONL },
    ],
  },

  "local-ai-money-math-2026": {
    name: "Local AI money-math numeracy benchmark",
    description:
      "Accuracy of four small local language models on eight everyday personal-finance arithmetic problems — compound interest, effective annual rate, mortgage payment, percentage change, tip splitting and portfolio allocation — with every expected value computed by hand from a closed-form formula and verified against an independent recomputation. Each question was run ten times per model with a different seed per repetition, giving 320 generations. Rows record accuracy, the number of distinct answers across repetitions, the modal answer, median tokens per second and median time to first token, so a model that is reliably correct can be told apart from one that is occasionally correct.",
    keywords: [
      "local LLM", "numeracy", "benchmark", "arithmetic", "Ollama",
      "quantization", "personal finance", "reproducibility",
    ],
    temporalCoverage: "2026-09",
    variableMeasured: [
      "Accuracy per model and question", "Distinct answers across repetitions",
      "Modal answer", "Expected answer", "Median tokens per second", "Median time to first token",
    ],
    files: [
      { name: "numeracy.csv", encodingFormat: CSV },
      { name: "numeracy-raw.jsonl", encodingFormat: JSONL },
    ],
  },

  "ai-tax-brackets-more-context-worse-2026": {
    name: "Local AI progressive-tax calculation accuracy",
    description:
      "400 generations testing whether small local language models can compute a progressive income tax when the bracket structure is supplied inside the prompt, so the test measures arithmetic rather than recall of any particular year's tables. Scenarios vary income and the number of brackets given, which isolates the effect of adding context: the same model answers one scenario correctly with three brackets in the prompt and catastrophically wrong with five. Every row records the model, scenario, repetition, seed, the parsed tax figure, the hand-computed expected figure, and throughput measurements.",
    keywords: [
      "local LLM", "benchmark", "income tax", "progressive tax", "context length",
      "Ollama", "arithmetic", "reproducibility",
    ],
    temporalCoverage: "2026-09",
    variableMeasured: [
      "Computed tax liability", "Expected tax liability", "Correctness",
      "Number of brackets supplied", "Tokens per second", "Time to first token",
    ],
    files: [
      { name: "tax-accuracy.csv", encodingFormat: CSV },
      { name: "tax-accuracy-raw.jsonl", encodingFormat: JSONL },
    ],
  },

  "ai-advice-benchmark-that-failed-2026": {
    name: "Local AI financial-advice responses, with failed scoring metrics",
    description:
      "240 raw generations from four local language models answering personal-finance questions, including deliberately hazardous ones about debt, leverage and crypto. Published in full because the automated scoring built to summarise them did not work: keyword-based metrics rated one model as reckless when reading its answers showed a correct and decisive refusal, and a second metric failed in the opposite direction. The complete text of every response is included so the scoring can be redone by anyone who wants to try a better method. No quantitative claim about advice quality is supportable from the metrics as published, and the accompanying post says so.",
    keywords: [
      "local LLM", "financial advice", "benchmark", "evaluation failure",
      "keyword scoring", "Ollama", "methodology",
    ],
    temporalCoverage: "2026-09",
    variableMeasured: [
      "Full response text", "Question category", "Hedging-keyword score",
      "Risk-mention flag", "Tokens per second",
    ],
    files: [{ name: "advice-raw.jsonl", encodingFormat: JSONL }],
  },

  "local-ai-electricity-cost-2026": {
    name: "Local LLM energy draw and cost per million tokens",
    description:
      "GPU power draw sampled at 4 Hz during local language-model inference on a GTX 1650 Ti, converted into watt-hours and into a cost per million tokens at a stated electricity tariff. Covers several small models at Q4_K_M quantisation, recording throughput alongside power so that energy per token can be separated from energy per second — which is what makes the lowest-wattage model the most expensive one to run. Includes the measured idle baseline, without which the marginal cost of a generation cannot be computed.",
    keywords: [
      "local LLM", "energy", "power consumption", "cost per token", "GPU",
      "Ollama", "benchmark", "efficiency",
    ],
    temporalCoverage: "2026-09",
    variableMeasured: [
      "GPU power draw (W)", "Energy per generation (Wh)", "Tokens per second",
      "Cost per million tokens (USD)", "Idle baseline draw (W)",
    ],
    files: [{ name: "energy.json", encodingFormat: JSON_TYPE }],
  },

  "crypto-whitepaper-readability-2026": {
    name: "Cryptocurrency whitepaper readability scores",
    description:
      "Readability measurements for cryptocurrency whitepapers and a set of reference documents, computed with Flesch Reading Ease and Flesch-Kincaid grade level over text extracted from the source PDFs and HTML. Thirteen documents were attempted and eight resolved; the five that failed are recorded with the reason rather than silently dropped, because a corpus that only reports its successes overstates what it measured. Reference texts including IRS Publication 17 and the US Constitution are scored by the identical pipeline so the whitepaper figures have something to be difficult relative to.",
    keywords: [
      "cryptocurrency", "whitepaper", "readability", "Flesch", "text analysis",
      "plain language", "corpus",
    ],
    temporalCoverage: "2026-09",
    variableMeasured: [
      "Flesch Reading Ease", "Flesch-Kincaid grade level", "Word count",
      "Sentence count", "Syllables per word", "Fetch outcome",
    ],
    files: [{ name: "readability.json", encodingFormat: JSON_TYPE }],
  },

  "budgeting-app-privacy-policy-length-2026": {
    name: "Budgeting-app privacy policy length and reading time",
    description:
      "Word counts, readability scores and estimated reading times for the privacy policies of budgeting applications, fetched directly from each company's own policy URL. Reading time is computed at 250 words per minute, a benchmark for adult reading of non-technical prose, which makes the estimate optimistic for legal text — the safe direction for the argument. Deliberately narrow in scope: it measures length and difficulty only, and makes no attempt to judge whether a policy is invasive, because an earlier experiment on this site showed that keyword-based qualitative scoring produces confident numbers that are wrong. Apps that block automated requests are listed as excluded with the reason.",
    keywords: [
      "privacy policy", "budgeting apps", "readability", "reading time",
      "terms of service", "consumer finance", "text analysis",
    ],
    temporalCoverage: "2026-09",
    variableMeasured: [
      "Word count", "Estimated reading time (minutes)", "Flesch Reading Ease",
      "Flesch-Kincaid grade level", "Exclusion reason",
    ],
    files: [{ name: "policy-length.json", encodingFormat: JSON_TYPE }],
  },

  "inflation-by-category-2026": {
    name: "US CPI component series by spending category",
    description:
      "Year-over-year price change for individual Consumer Price Index components, pulled from the Bureau of Labor Statistics series and held alongside the headline all-items figure for the same month. The point of keeping the components separate is that the headline number is an average over categories moving at very different speeds — airline fares and education, in the same release, can differ by more than an order of magnitude — so an average that describes nobody's actual spending is the only figure most coverage reports. Each row carries its BLS series identifier so any value can be traced back to the source.",
    keywords: [
      "inflation", "CPI", "consumer price index", "BLS", "cost of living",
      "United States", "economics",
    ],
    temporalCoverage: "2026",
    variableMeasured: [
      "Category name", "BLS series ID", "Year-over-year change (%)",
      "Index level", "Reference month",
    ],
    files: [{ name: "cpi-categories.json", encodingFormat: JSON_TYPE }],
  },
  "insurance-affordability-crisis-2026": {
    name: "CPI insurance price indexes vs marketplace premium averages",
    description:
      "Motor vehicle insurance and tenants' and household insurance from the US Consumer Price Index, held against the headline all-items figure over the same window, plus the divergence from the average-premium figure that insurance comparison marketplaces publish. The two quantities are routinely reported as if interchangeable: a price index holds coverage constant and measures what an identical policy costs, while a marketplace average also moves when the dwelling coverage amounts people buy move. Over 2021 to July 2026 they differ by about thirty percentage points for home insurance. Rows carry BLS series identifiers, both the annual-average and January baselines, and the months actually used for each annual figure, since October 2025 is missing from all three series and November 2025 from one.",
    keywords: [
      "insurance", "home insurance", "auto insurance", "CPI", "inflation",
      "BLS", "premiums", "United States",
    ],
    temporalCoverage: "2021/2026-07",
    variableMeasured: [
      "BLS series ID", "CPI item name", "Index level",
      "Percent change vs base-year average", "Percent change vs January baseline",
      "Multiple of headline inflation", "Months used per annual average",
    ],
    files: [{ name: "insurance-cpi.json", encodingFormat: JSON_TYPE }],
  },
  "solo-401k-vs-sep-ira-2026": {
    name: "Solo 401(k) and SEP IRA contribution ceilings by net profit, 2026",
    description:
      "Maximum allowable contribution to a Solo 401(k) and to a SEP IRA at each level of Schedule C net profit for tax year 2026, computed from the IRS Publication 560 deduction worksheet rather than approximated. Includes net earnings from self-employment at each point, the employer profit-sharing portion, and the difference between the two plans. The comparison exists because the difference is widely described as shrinking with income when it is in fact a flat amount equal to the elective deferral across most of the range, ending only where each plan meets the section 415(c) cap: $252,316 of net profit for a Solo 401(k) and $376,478 for a SEP IRA. Assumes a sole proprietor under age 50 with no employees.",
    keywords: [
      "Solo 401k", "SEP IRA", "self-employment", "retirement", "contribution limits",
      "IRS", "taxes", "United States",
    ],
    temporalCoverage: "2026",
    variableMeasured: [
      "Net profit", "Net earnings from self-employment", "Employer profit-sharing portion",
      "SEP IRA maximum", "Solo 401(k) maximum", "Solo 401(k) advantage",
    ],
    files: [{ name: "self-employed-plans.json", encodingFormat: JSON_TYPE }],
  },
  "trump-account-vs-529": {
    name: "Trump Account, 529 plan and taxable brokerage outcomes across brackets and horizons",
    description:
      "After-tax spendable value for college from three savings vehicles — a Trump Account, a 529 plan and a plain taxable brokerage account — computed across every combination of annual contribution ($1,000 to $5,000), time horizon (5 to 18 years) and ordinary withdrawal bracket (0% to 37%). Coverage of these accounts typically reports a single scenario; this is the whole surface, plus the two crossover boundaries derived from it: the bracket at which the 529 overtakes at each contribution and horizon, and the year at which it overtakes at each contribution and bracket. The boundary moves a long way. At $1,000 a year over five years the Trump Account wins at every bracket in the code, because the fixed $1,000 government seed dominates when contributions are small; at $5,000 a year over eighteen years the 529 wins above a 5% bracket. Assumes 7% growth and qualified education use, with no state 529 benefit and no employer or charitable deposits.",
    keywords: [
      "Trump Account", "529 plan", "college savings", "tax treatment",
      "capital gains", "education", "United States",
    ],
    temporalCoverage: "2026",
    variableMeasured: [
      "Annual contribution", "Years to withdrawal", "Ordinary income bracket",
      "Trump Account spendable value", "529 plan spendable value",
      "Taxable brokerage spendable value", "Crossover bracket", "Crossover year",
    ],
    files: [{ name: "trump-account-vs-529.json", encodingFormat: JSON_TYPE }],
  },
  "car-loan-interest-deduction-2026": {
    name: "Car-loan interest deduction value by loan size, rate and term",
    description:
      "First-year and lifetime interest on fixed-rate car loans across a grid of principal, APR and term, with the resulting OBBBA deduction and its cash value at four marginal rates. Computed from an amortisation schedule rather than from the headline cap, because the $10,000 figure is a ceiling on deductible interest and not a benefit: at the June 2026 average new-vehicle price of $49,758 with 20 percent down, first-year interest at 7 percent is $2,611, about a quarter of the cap. A companion table solves for the principal whose first-year interest actually reaches the cap, which at 7 percent over 72 months is $152,447. Includes the MAGI phase-out, which is carried from the cited IRS guidance rather than derived here.",
    keywords: [
      "car loan", "auto loan", "OBBBA", "tax deduction", "amortisation",
      "interest", "United States",
    ],
    temporalCoverage: "2025/2028",
    variableMeasured: [
      "Loan principal", "APR", "Term in months", "Monthly payment",
      "First-year interest", "Total interest", "Deductible interest",
      "Tax value by bracket", "Principal required to reach the cap",
    ],
    files: [{ name: "car-loan-deduction.json", encodingFormat: JSON_TYPE }],
  },
  "record-home-price-buy-or-rent-2026": {
    name: "Buy versus rent break-even by mortgage rate, rent and appreciation",
    description:
      "Month-by-month net worth for two households over thirty years, one buying at the record $440,600 median price and one renting and investing the difference, with the break-even month at which buying overtakes renting. Swept across mortgage rates from 4 to 7.5 percent, monthly rents from $1,600 to $2,800, and annual appreciation from 0 to 5 percent. The buyer pays interest, principal, property tax, insurance and maintenance and sells with 6 percent costs; the renter keeps the down payment and closing costs invested at 7 percent. The widely repeated five-year rule reproduces only at a 4 percent mortgage rate: at 6.55 percent with $2,100 rent and 3 percent appreciation, buying does not break even within thirty years. No mortgage-interest deduction and no capital-gains tax on the portfolio, two omissions that push in opposite directions.",
    keywords: [
      "housing", "buy vs rent", "mortgage", "break-even", "home prices",
      "affordability", "United States",
    ],
    temporalCoverage: "2026",
    variableMeasured: [
      "Mortgage rate", "Monthly payment", "Monthly rent", "Annual appreciation",
      "Buyer net worth by year", "Renter net worth by year", "Break-even years",
    ],
    files: [{ name: "buy-vs-rent.json", encodingFormat: JSON_TYPE }],
  },
  "the-20000-1099k-rule-is-back": {
    name: "Form 1099-K reporting threshold by average sale price",
    description:
      "Where the restored Form 1099-K reporting threshold actually falls, computed from its own structure. The rule requires gross payments exceeding $20,000 and more than 200 transactions on a single platform, and because both must be crossed the threshold is a boundary in two dimensions rather than a revenue line. Dividing one by the other gives an exact pivot at a $100 average sale price: above it the transaction count binds, below it the dollar amount does. The consequence is that a seller averaging $2,000 a sale can take $402,000 through one platform before a form is required, while a seller averaging $100 receives one at $20,100. Includes worked cases of high-revenue and high-volume sellers who receive no form at all.",
    keywords: [
      "1099-K", "IRS", "reporting threshold", "resale", "side hustle",
      "marketplace", "taxes", "United States",
    ],
    temporalCoverage: "2026",
    variableMeasured: [
      "Average sale price", "Sales required to trigger reporting",
      "Revenue at the trigger point", "Binding constraint",
      "Reporting outcome for worked cases",
    ],
    files: [{ name: "form-1099k-threshold.json", encodingFormat: JSON_TYPE }],
  },
  "roth-ira-vs-traditional-ira": {
    name: "Roth versus Traditional IRA outcomes at the contribution limit",
    description:
      "After-tax outcomes for a maxed Roth and a maxed Traditional IRA compared at equal after-tax cost, across marginal rates from 12 to 37 percent and horizons from 10 to 40 years. The familiar result that equal tax rates make the two accounts identical assumes both receive the same pre-tax contribution, which the nominal $7,500 limit makes impossible: $7,500 of already-taxed Roth money is a larger real contribution, equivalent to $9,868 pre-tax at a 24 percent rate. Funding the Traditional to the same limit leaves a tax saving that cannot enter the IRA and must sit in a taxable account, where its growth is taxed. At equal rates over thirty years the Roth is ahead by exactly the capital-gains tax on that side account. Applies only to savers who contribute the maximum; below the limit the classic tie holds.",
    keywords: [
      "Roth IRA", "Traditional IRA", "contribution limit", "retirement",
      "tax planning", "IRS", "United States",
    ],
    temporalCoverage: "2026",
    variableMeasured: [
      "Marginal rate now", "Marginal rate in retirement", "Years to withdrawal",
      "Roth ending value", "Traditional ending value", "Taxable side account value",
      "Roth advantage", "Pre-tax equivalent of the Roth limit",
    ],
    files: [{ name: "roth-vs-traditional-limit.json", encodingFormat: JSON_TYPE }],
  },
  "seasonal-holiday-work-2026": {
    name: "Seasonal retail and warehousing hiring by season, 1939 onward",
    description:
      "Seasonal holiday hiring measured from payroll counts rather than from hiring forecasts, for every season from 1939 to the last completed one. Seasonal hiring is defined as the rise in employment from October to the November or December peak on the not-seasonally-adjusted series, since the adjusted series removes this effect by construction. Each season carries the October base, the peak, the jobs added, and the share of the October base — the share being the only comparison that holds across a period in which retail employment tripled. On that basis the 2025 season is the second weakest of 87, behind only 2008. The identical calculation is run on warehousing and storage to test the common claim that seasonal hiring moved to fulfilment; it did not, with warehousing down about 89 percent from its 2020 peak against retail's 28 percent.",
    keywords: [
      "seasonal hiring", "retail employment", "holiday jobs", "warehousing",
      "BLS", "labour market", "United States",
    ],
    temporalCoverage: "1939/2025",
    variableMeasured: [
      "Season year", "October employment base", "Holiday peak employment",
      "Peak month", "Seasonal jobs added", "Share of October base",
      "Rank by count", "Rank by share",
    ],
    files: [{ name: "seasonal-retail-hiring.json", encodingFormat: JSON_TYPE }],
  },
  "credit-card-bnpl-debt-2026": {
    name: "US credit card balances, nominal and inflation-adjusted, 2003 onward",
    description:
      "Quarterly US credit card balances from the Federal Reserve Bank of New York's Household Debt and Credit Report, parsed directly from the published workbook, alongside the same series deflated to constant dollars with the BLS CPI-U. Coverage of this series reports the nominal figure, which sets a record most quarters almost by construction after twenty years of inflation. In real terms the peak is not recent: the highest quarter on record is the fourth of 2008, equivalent to about 1.358 trillion in 2026 Q2 dollars, against 1.263 trillion in 2026 Q2 itself, so households owe roughly 7 percent less in real terms than at that peak. Each row carries the nominal balance, the CPI level used, and the deflated balance. Buy-now-pay-later is largely absent from the underlying series because most of it is not furnished to the credit bureaus.",
    keywords: [
      "credit card debt", "household debt", "inflation adjusted", "BNPL",
      "New York Fed", "CPI", "United States",
    ],
    temporalCoverage: "2003/2026",
    variableMeasured: [
      "Quarter", "Nominal balance (trillions)", "CPI-U level",
      "Real balance in base-quarter dollars", "Nominal peak", "Real peak",
    ],
    files: [{ name: "credit-card-real-terms.json", encodingFormat: JSON_TYPE }],
  },
};

/**
 * The registry, validated. Anything malformed throws here — at import, during
 * the build — rather than silently producing structured data a crawler will
 * reject.
 */
export const datasets: Record<string, DatasetMeta> = parseDatasets(rawDatasets);

/**
 * schema.org Dataset for a post, or null if the post publishes no rows.
 *
 * `identifier` appears only once a DOI exists. Emitting an empty or invented
 * identifier is worse than omitting the property: it claims a permanent
 * archive that nothing resolves to.
 */
export function buildDatasetJsonLd(slug: string) {
  const meta = datasets[slug];
  if (!meta) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: meta.name,
    description: meta.description,
    url: `${siteConfig.url}/posts/${slug}`,
    keywords: meta.keywords,
    temporalCoverage: meta.temporalCoverage,
    variableMeasured: meta.variableMeasured,
    license: DATA_LICENSE,
    isAccessibleForFree: true,
    ...(ZENODO_CONCEPT_DOI
      ? {
          identifier: ZENODO_CONCEPT_DOI,
          citation: `Karki, Sujit (2026). ${meta.name}. ${ZENODO_CONCEPT_DOI}`,
        }
      : {}),
    creator: {
      "@type": "Person",
      name: siteConfig.author.name,
      ...(authorSameAs.length ? { sameAs: authorSameAs } : {}),
    },
    distribution: meta.files.map((file) => ({
      "@type": "DataDownload",
      encodingFormat: file.encodingFormat,
      contentUrl: `${siteConfig.url}/data/${file.name}`,
    })),
  };
}

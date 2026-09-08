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

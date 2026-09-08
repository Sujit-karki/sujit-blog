# Lampard

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22654387.svg)](https://doi.org/10.5281/zenodo.22654387)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-blue.svg)](./LICENSE-DATA)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green.svg)](./LICENSE)

A high-performance personal finance blog built with Next.js, MDX, and Tailwind CSS. Published at **[sujitkarki.com.np](https://www.sujitkarki.com.np)**.

> Deep market research, investing guides, and money strategies — backed by rigorous data-driven analysis.

The datasets behind the original-data posts are archived and citable:

> Karki, Sujit (2026). *Original-data research datasets and measurement harness,
> sujitkarki.com.np*. Zenodo. https://doi.org/10.5281/zenodo.22654387

That is the concept DOI, which always resolves to the newest archived version.
See [`research/README.md`](./research/README.md) for the harness, the method, and
the per-release version DOIs.

---

## What This Is

Lampard is a statically-generated blog in the YMYL (Your Money, Your Life) niche. Every article is researched using primary sources — central bank data, SEC filings, peer-reviewed research — and built to meet Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) standards.

**Categories covered:**
- Investing (index funds, ETFs, stock analysis)
- Personal Finance (budgeting, saving, debt management)
- Crypto (Bitcoin, DeFi, market analysis)
- Side Hustles (income strategies)
- Market Analysis (macro, Fed policy, global trends)

---

## Original Data

Some posts are built on datasets generated here rather than on someone else's
reporting. The code that produces them lives in [`research/`](research/) and
[`scripts/`](scripts/), and every dataset a post cites is served from the site
itself under `/data/`, so a reader can take the rows without cloning anything.

| What | Script | Dataset |
|---|---|---|
| Money-math numeracy benchmark for small local models | [`research/run.py`](research/run.py) | `/data/numeracy.csv` |
| Tax-bracket accuracy vs. amount of context given | [`research/experiments/tax_accuracy.py`](research/experiments/tax_accuracy.py) | `/data/tax-accuracy.csv` |
| GPU power draw during local inference | [`research/measure_energy.py`](research/measure_energy.py) | `/data/energy.json` |
| Crypto whitepaper readability (Flesch) | [`research/readability.py`](research/readability.py) | `/data/readability.json` |
| Budgeting-app privacy policy length | [`research/policy_length.py`](research/policy_length.py) | `/data/policy-length.json` |
| CPI by category, from the BLS API | [`scripts/cpi-categories.mjs`](scripts/cpi-categories.mjs) | `/data/cpi-categories.json` |
| Next year's tax brackets from the statutory chained-CPI formula | [`scripts/project-brackets.mjs`](scripts/project-brackets.mjs) | computed live |
| Social Security COLA from CPI-W | [`scripts/project-cola.mjs`](scripts/project-cola.mjs) | computed live |

The method notes — including the ones about experiments that failed, and why
those were published anyway — are in [`research/README.md`](research/README.md).

## Quality Gates

```bash
npm run audit:check    # every indexed post: >=500 words, >=1 primary source, score >=3.5
npm run audit:links    # every cited URL still resolves (run by hand, not in CI)
```

`audit:check` runs in CI, so a thin post cannot reach production by being
forgotten. `audit:links` is deliberately manual: it depends on third-party hosts
being up, so as a merge gate it would fail for reasons unrelated to the commit.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Content | MDX 3 (Markdown + React components) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Charts | Chart.js 4 (react-chartjs-2) |
| Animation | Motion (`motion/react`, via a centralized `LazyMotion` provider) |
| Search | Fuse.js (⌘K modal + `/search` page) |
| Content validation | Zod (frontmatter schema in `lib/posts.ts`) |
| Compiler | React Compiler (`babel-plugin-react-compiler`, `reactCompiler: true` in `next.config.mjs`) |
| Analytics | Vercel Speed Insights |
| Deployment | Vercel (native Git integration, deploys `main`) |

---

## Project Structure

```
my-blog/
├── app/
│   ├── (blog)/                  # Main blog routes (grouped layout)
│   │   ├── layout.tsx           # Blog layout: Header + Footer
│   │   ├── page.tsx             # Homepage (featured + latest + categories)
│   │   ├── posts/[slug]/        # Individual post pages
│   │   ├── category/[category]/ # Posts filtered by category
│   │   ├── tags/[tag]/          # Posts filtered by tag
│   │   ├── about/               # Author bio page
│   │   ├── contact/             # Contact page
│   │   ├── disclaimer/          # Legal disclaimer
│   │   ├── privacy-policy/      # Privacy policy
│   │   ├── search/              # /search?q= results page (Fuse.js)
│   │   ├── tools/                # Standalone calculator hub (/tools, /tools/[slug])
│   │   └── feed.xml/            # RSS feed route
│   ├── api/
│   │   ├── og/route.tsx         # Generated default share image (next/og)
│   │   ├── search-index/route.ts # Cached JSON index consumed by the search UI
│   │   ├── newsletter/route.ts  # Buttondown signup proxy
│   │   └── market-data/route.ts # Live ticker data (CoinGecko/Yahoo Finance)
│   ├── roadmap/                 # Strategy/roadmap page (standalone layout)
│   ├── layout.tsx               # Root layout
│   ├── providers.tsx            # MotionProvider (LazyMotion + MotionConfig)
│   ├── sitemap.ts               # Auto-generated XML sitemap
│   └── robots.ts                # robots.txt generation
├── components/
│   ├── ads/                     # Ad integration components
│   │   └── GoogleAdSense.tsx    # Google AdSense unit
│   ├── mdx/                     # Rich content components for MDX
│   │   ├── KeyTakeaways.tsx     # Highlighted key points box
│   │   ├── InfoBox.tsx          # Info/warning/tip callout box
│   │   ├── ProsCons.tsx         # Pros and cons table
│   │   ├── ComparisonTable.tsx  # Side-by-side comparison
│   │   ├── FaqAccordion.tsx     # Expandable FAQ section
│   │   └── Sources.tsx          # Citation/sources list
│   ├── custom/                  # One-off interactive components used in specific posts (34 total — a sample below)
│   │   ├── ChartCard.tsx        # Shared animated card wrapper (scroll reveal + hover lift)
│   │   ├── AnimatedNumber.tsx   # Spring-animated count-up number, respects reduced-motion
│   │   ├── CompoundGrowthChart.tsx      # Interactive compounding visualizer (SVG)
│   │   ├── RothIraCalculator.tsx        # Roth vs Traditional IRA calculator
│   │   ├── SelfEmploymentTaxChart.tsx   # Doughnut chart: SE tax breakdown
│   │   ├── SideHustleTaxEstimator.tsx   # Live tax-reserve estimator (slider-driven)
│   │   ├── LLCFeesChart.tsx             # Bar chart: LLC filing fees by state
│   │   ├── RetirementContributionChart.tsx  # SEP IRA vs Solo 401(k) bar chart
│   │   ├── FifaInteractive.tsx  # World Cup finance explorer
│   │   ├── DebtPayoffCalculator.tsx     # Credit card payoff months/interest, scenario bars
│   │   ├── InsuranceDeductibleCalculator.tsx  # Deductible-raise savings vs. breakeven claim frequency
│   │   └── StablecoinYieldGapCalculator.tsx   # Issuer-earned vs. holder-earned stablecoin yield gap
│   ├── charts/                   # Chart.js-based MDX chart components
│   │   ├── LineChart.tsx / LineChartLazy.tsx  # Line/area chart, a11y layer + data-table fallback
│   │   ├── PieChart.tsx / PieChartLazy.tsx    # Donut chart, a11y layer + data-table fallback
│   │   ├── StatCard.tsx         # Single-stat tile (string format presets, not a function prop)
│   │   └── useIsDark.ts         # Tracks the `dark` class on <html> for chart theming
│   ├── tools/
│   │   └── EmbedSnippet.tsx     # Copy-to-clipboard iframe embed code for /tools pages
│   ├── search/                   # ⌘K modal + /search page
│   │   ├── SearchModal.tsx      # Cmd+K command palette (Motion + Fuse.js)
│   │   ├── SearchResults.tsx    # /search?q= results list
│   │   ├── useSearchIndex.ts    # Fetches/caches the search index
│   │   └── useFuseSearch.ts     # Shared Fuse.js query hook
│   ├── newsletter/
│   │   └── NewsletterSignup.tsx # Buttondown signup form (inline + footer variants)
│   ├── financial/                # Live market data widgets
│   │   ├── FinancialTicker.tsx  # Scrolling price ticker (CoinGecko/Yahoo Finance)
│   │   ├── MarketChart.tsx      # SSR-safe dynamic-import wrapper
│   │   └── MarketChartClient.tsx # Chart.js line chart with live sparkline
│   ├── Header.tsx               # Site navigation
│   ├── Footer.tsx               # Site footer
│   ├── PostCard.tsx             # Article card (normal + featured variant)
│   ├── AuthorBio.tsx            # Author bio shown after each post
│   ├── RelatedPosts.tsx         # Related posts by category
│   ├── Breadcrumb.tsx           # Breadcrumb nav + JSON-LD generator
│   ├── ReadingProgress.tsx      # Scroll-based reading progress bar
│   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   ├── NewsTicker.tsx           # Latest updates ticker
│   ├── PageTransition.tsx       # Smooth page navigation effects
│   └── FadeIn.tsx               # Scroll-animation component
├── content/
│   └── posts/                   # All blog posts as .mdx files
├── lib/
│   ├── posts.ts                 # Post reading/sorting/filtering + Zod frontmatter validation
│   ├── posts.test.ts            # Vitest unit tests for lib/posts.ts
│   ├── site-config.ts           # Site name, author info, categories
│   ├── tools-config.ts          # /tools registry: copy, FAQ, HowTo steps per calculator
│   ├── category-theme.ts        # Per-category color/icon theming
│   └── motion/tokens.ts         # Shared durations/easings/variants for the Motion provider
├── e2e/                          # Playwright end-to-end specs
└── public/                      # Static assets
```

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Troubleshooting: Port already in use

If you see an error like `Port 3000 is in use` or `Another next dev server is already running`, you can find and kill the existing process:

**Windows (PowerShell):**
```powershell
# Find the PID
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Kill the process (replace PID with the number found)
taskkill /PID <PID> /F
```

**Linux/macOS:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## Testing

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test:unit  # Vitest (lib/posts.test.ts)
npm run test:e2e   # Playwright (e2e/*.spec.ts)
```

Every push/PR to `main` runs lint, typecheck, unit tests, build, and Playwright E2E via GitHub Actions (`.github/workflows/ci.yml`). This workflow is CI-only — it doesn't deploy; production deploys go through Vercel's native Git integration.

---

## Writing a Blog Post

All posts live in `content/posts/` as `.mdx` files. The filename becomes the URL slug.

**Example:** `content/posts/my-new-article.mdx` → `/posts/my-new-article`

### Frontmatter (required fields)

Every post must start with a YAML frontmatter block:

```yaml
---
title: "How Index Funds Beat 90% of Investors"
description: "A data-backed breakdown of why passive investing outperforms active management over the long term."
date: "2026-06-14"
updated: "2026-06-20"       # optional: shows "Updated" date on the post
author: "Sujit Karki"
category: "Investing"       # must match a category from site-config.ts
tags: ["index funds", "ETFs", "passive investing", "long-term"]
coverImage: "/images/index-funds.jpg"   # optional

# Optional: generates Table of Contents in the sidebar
toc:
  - id: "what-is-an-index-fund"
    title: "What Is an Index Fund?"
    level: 2
  - id: "why-passive-wins"
    title: "Why Passive Investing Wins"
    level: 2
  - id: "vanguard-vs-fidelity"
    title: "Vanguard vs Fidelity"
    level: 3

# Optional: generates FAQ structured data (helps with SEO rich results)
faq:
  - q: "Are index funds safe?"
    a: "Index funds carry market risk but are considered lower risk than individual stocks due to diversification."
  - q: "How much should I invest in index funds?"
    a: "Most experts recommend investing 15-20% of your income consistently over time."
---
```

### Writing the Article Body

After the frontmatter, write your article in standard Markdown. You can also use the built-in MDX components:

```mdx
## What Is an Index Fund?

An index fund tracks a market index like the S&P 500...

<KeyTakeaways items={[
  "Index funds have lower fees than actively managed funds",
  "They outperform 90% of active managers over 15+ years",
  "Ideal for long-term, buy-and-hold investors"
]} />

## Why Passive Investing Wins

<InfoBox type="tip">
  Warren Buffett has recommended index funds for most investors in his annual letters since 2008.
</InfoBox>

<ProsCons
  pros={["Low fees", "Built-in diversification", "Tax efficient"]}
  cons={["No chance to beat the market", "Includes bad companies too"]}
/>

<FaqAccordion items={[
  { q: "Can I lose all my money?", a: "Only if every company in the index goes to zero — extremely unlikely." }
]} />

<Sources items={[
  { title: "S&P SPIVA Report 2025", url: "https://www.spglobal.com/spdji/en/research-insights/spiva/", publisher: "S&P Dow Jones Indices", date: "2026" }
]} />
```

### Available MDX Components

| Component | Purpose |
|---|---|
| `<KeyTakeaways items={[...]} />` | Green callout box with bullet-point takeaways |
| `<InfoBox type="tip/warning/info">` | Colored callout box for emphasis |
| `<ProsCons pros={[...]} cons={[...]} />` | Side-by-side pros and cons |
| `<ComparisonTable headers={[...]} rows={[[...]]} highlightCol={n} />` | Data comparison table |
| `<FaqAccordion items={[{q, a}]} />` | Expandable FAQ section |
| `<Sources items={[{title, url, publisher?, date?}]} />` | Formatted source citations |
| `<LineChart title data xKey series unit? />` | Chart.js line/area chart, a11y layer + data-table fallback |
| `<PieChart title data unit? />` | Chart.js donut chart, a11y layer + data-table fallback |
| `<StatCard label value format? sublabel? />` | Single-stat tile — `format` is `"number"\|"currency"\|"percent"`, never a function (MDX is server-rendered) |

Post-specific interactive components (charts, calculators) live in `components/custom/` and are registered per-post in `mdx-components.tsx` — see [Interactive Charts & Animation](#interactive-charts--animation) below before adding a new one.

---

## Interactive Charts & Animation

Data-heavy posts use real, sourced numbers rendered as live Chart.js visualizations, not static images — see `content/posts/how-to-start-a-side-hustle.mdx` for a full example (doughnut chart, bar charts, and a slider-driven live calculator).

**Building a new chart component:**

1. Add it under `components/custom/` as a `'use client'` component.
2. Wrap its root in `<ChartCard>` for a consistent scroll-triggered entrance (spring fade/rise) and hover lift — don't hand-roll this per component.
3. For any headline number that changes (a stat, a slider result, a percentage), use `<AnimatedNumber value={...} format={...} />` instead of a plain `{value}` — it spring-animates between values and respects `prefers-reduced-motion` automatically.
4. Register the component in `mdx-components.tsx` so it's usable in MDX without an import.
5. Cite every number in the chart back to a real source in the post's `<Sources>` block — charts are held to the same no-fabricated-data standard as the prose. See [Writing a Blog Post](#writing-a-blog-post).

**Animation principles used throughout this codebase** (see `FadeIn.tsx`, `PageTransition.tsx`, `ChartCard.tsx`, `AnimatedNumber.tsx`):

- **One centralized system, not inline transitions** — every `motion`/`framer-motion` import goes through `app/providers.tsx` (`LazyMotion domAnimation strict` + `MotionConfig reducedMotion="user"`). `strict` mode means every component must use the lighter `m.*` primitive, never the full `motion.*` one — mixing the two throws at runtime.
- **Durations/easings/variants live in `lib/motion/tokens.ts`** — reuse `duration`, `ease`, and `variants` instead of hand-writing new transition objects per component.
- **Scroll-triggered, not autoplay** — `whileInView` with `{ once: true }`, so animations fire once as content enters the viewport instead of replaying or distracting on every scroll.
- **Springs for interactive elements, easing for decorative ones** — card entrances and hover states use `type: "spring"` with low bounce (`damping` ≥ 20); page-level fades use simple easing curves.
- **`useReducedMotion()` is mandatory** on every new motion component — check the OS-level reduced-motion preference and fall back to an instant, static state. `MotionConfig reducedMotion="user"` also handles this app-wide.
- **Numbers animate toward meaning, not noise** — `AnimatedNumber` springs between real computed values (tax owed, contribution limits); it's never used to make a static number look busier than it is.

---

## Site Configuration

Edit `lib/site-config.ts` to update global settings:

```ts
export const siteConfig = {
  name: "Lampard",
  url: "https://www.sujitkarki.com.np",
  tagline: "...",
  description: "...",
  author: {
    name: "Sujit Karki",
    credentials: "Finance Researcher & Market Analyst",
    bio: "...",
    avatarInitial: "S",
    knowsAbout: ["Financial Markets", "Macroeconomics", ...],
  },
  social: {
    twitter: "",   // add your handle
    linkedin: "",
    youtube: "",
    email: "",
  },
};

// Add/remove categories here — they appear in nav, sidebar, and homepage
export const categories = [
  "Investing",
  "Personal Finance",
  "Crypto",
  "Side Hustles",
  "Market Analysis",
];
```

---

## SEO Features

This blog is built SEO-first:

- **Static generation** — every page is pre-rendered at build time via `generateStaticParams`, with Partial Prerendering (`cacheComponents: true` in `next.config.mjs`) streaming the few genuinely dynamic bits (the live ticker)
- **Structured data (JSON-LD)** — Organization, WebSite+SearchAction, Article, Person, FAQPage, HowTo (on `/tools` pages), and BreadcrumbList schemas
- **Open Graph + Twitter cards** — unique per-post share images generated via `next/og` (`app/(blog)/posts/[slug]/opengraph-image.tsx`), with a site-wide generated fallback at `/api/og`
- **Canonical URLs** — prevents duplicate content issues
- **XML Sitemap** — auto-generated at `/sitemap.xml`
- **RSS Feed** — available at `/feed.xml`
- **robots.txt** — auto-generated at `/robots.txt`
- **Reading time** — calculated automatically (200 words/min)

---

## Pages Reference

| URL | Description |
|---|---|
| `/` | Homepage with featured post, latest 6 articles, category sections |
| `/posts/[slug]` | Individual blog post with TOC sidebar, author bio, related posts |
| `/category/[category]` | All posts in a category (e.g. `/category/investing`) |
| `/tags/[tag]` | All posts with a specific tag |
| `/about` | Author profile and site mission |
| `/contact` | Contact form/info |
| `/disclaimer` | Financial disclaimer |
| `/privacy-policy` | Privacy policy |
| `/feed.xml` | RSS feed |
| `/sitemap.xml` | XML sitemap for Google |
| `/roadmap` | Strategic roadmap page with interactive charts |
| `/tools` | Calculator hub index |
| `/tools/[slug]` | Standalone interactive calculator (HowTo + FAQ JSON-LD, embed snippet) |
| `/search` | Search results page (`?q=`), also the `WebSite` JSON-LD `SearchAction` target |

---

## Dark Mode

Dark mode is built in via Tailwind CSS. The `ThemeToggle` component in the header lets users switch between light and dark themes. All components use `dark:` variants.

---

## AdSense Integration

AdSense is integrated via the `GoogleAdSense` component.

1. Components are available in `components/ads/GoogleAdSense.tsx`.
2. Ad slots can be placed in MDX or TSX files:
   ```tsx
   import GoogleAdSense from '@/components/ads/GoogleAdSense'
   
   <GoogleAdSense slot="1234567890" />
   ```

---

## Deployment

Production is Vercel's native Git integration: **every push to `main` deploys**,
with no GitHub Actions deploy step. CI runs quality gates only (lint, typecheck,
unit, e2e, content standard).

`npm run build` runs `prebuild` first, which copies `research/data/` into
`public/data/` and fails the build if any post links a dataset that is not
there.

To run it somewhere else: it is a standard Next.js 16 app, `npm run build`,
output in `.next`.

---

## Author

**Sujit Karki** — Independent finance researcher and market analyst, writing at Lampard.  
Specialties: macroeconomics, equity markets, monetary policy, personal finance, cryptocurrency.

Website: [sujitkarki.com.np](https://www.sujitkarki.com.np)

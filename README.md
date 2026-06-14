# Lampard

A high-performance personal finance blog built with Next.js, MDX, and Tailwind CSS. Published at **[sujitkarki.com.np](https://www.sujitkarki.com.np)**.

> Deep market research, investing guides, and money strategies — backed by rigorous data-driven analysis.

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

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Content | MDX 3 (Markdown + React components) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Charts | Chart.js via react-chartjs-2 |
| Deployment | Cloudflare / Vercel-compatible |

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
│   │   └── feed.xml/            # RSS feed route
│   ├── roadmap/                 # Strategy/roadmap page (standalone layout)
│   ├── layout.tsx               # Root layout
│   ├── sitemap.ts               # Auto-generated XML sitemap
│   └── robots.ts                # robots.txt generation
├── components/
│   ├── Header.tsx               # Site navigation
│   ├── Footer.tsx               # Site footer
│   ├── PostCard.tsx             # Article card (normal + featured variant)
│   ├── AuthorBio.tsx            # Author bio shown after each post
│   ├── RelatedPosts.tsx         # Related posts by category
│   ├── Breadcrumb.tsx           # Breadcrumb nav + JSON-LD generator
│   ├── ReadingProgress.tsx      # Scroll-based reading progress bar
│   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   ├── AdSlot.tsx               # Google AdSense slot placeholder
│   ├── CaiUnityAd.tsx           # Custom ad unit (CAI Unity)
│   └── mdx/                     # Rich content components for MDX
│       ├── KeyTakeaways.tsx     # Highlighted key points box
│       ├── InfoBox.tsx          # Info/warning/tip callout box
│       ├── ProsCons.tsx         # Pros and cons table
│       ├── ComparisonTable.tsx  # Side-by-side comparison
│       ├── FaqAccordion.tsx     # Expandable FAQ section
│       └── Sources.tsx          # Citation/sources list
├── content/
│   └── posts/                   # All blog posts as .mdx files
│       ├── understanding-federal-reserve-policy.mdx
│       ├── emerging-market-opportunities-2026.mdx
│       ├── index-fund-investing-guide.mdx
│       ├── budgeting-50-30-20-rule.mdx
│       └── bitcoin-market-analysis-2026.mdx
├── lib/
│   ├── posts.ts                 # Post reading, sorting, filtering logic
│   └── site-config.ts           # Site name, author info, categories
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

```bash
# Build for production
npm run build

# Start production server
npm start
```

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
author: "Lampard"
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
  { label: "S&P SPIVA Report 2025", url: "https://www.spglobal.com/spdji/en/research-insights/spiva/" }
]} />
```

### Available MDX Components

| Component | Purpose |
|---|---|
| `<KeyTakeaways items={[...]} />` | Green callout box with bullet-point takeaways |
| `<InfoBox type="tip/warning/info">` | Colored callout box for emphasis |
| `<ProsCons pros={[...]} cons={[...]} />` | Side-by-side pros and cons |
| `<ComparisonTable ... />` | Data comparison table |
| `<FaqAccordion items={[{q, a}]} />` | Expandable FAQ section |
| `<Sources items={[{label, url}]} />` | Formatted source citations |

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
    name: "Lampard",
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
  adsense: {
    enabled: false,       // flip to true when ready
    publisherId: "",      // ca-pub-XXXXXXXXXX
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

- **Static generation** — every page is pre-rendered at build time (`dynamicParams = false`)
  - **Structured data (JSON-LD)** — Article, FAQPage, Person, and BreadcrumbList schemas on every post
  - **Open Graph + Twitter cards** — full social sharing previews with cover images
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

---

## Dark Mode

Dark mode is built in via Tailwind CSS. The `ThemeToggle` component in the header lets users switch between light and dark themes. All components use `dark:` variants.

---

## AdSense Integration

AdSense is ready but disabled by default. To activate:

1. Get your publisher ID from Google AdSense (`ca-pub-XXXXXXXXXX`)
   2. Update `lib/site-config.ts`:
      ```ts
      adsense: {
        enabled: true,
        publisherId: "ca-pub-XXXXXXXXXX",
      }
      ```
   3. Ad slots are already placed in posts via `<AdSlot slot="top-article" />` and `<AdSlot slot="bottom-article" />`

---

## Deployment

### Vercel (recommended)
1. Push to GitHub
   2. Import the repo in [vercel.com](https://vercel.com)
   3. Deploy — zero config needed for Next.js

### Cloudflare Pages
1. Connect your GitHub repo in Cloudflare Pages
   2. Build command: `npm run build`
   3. Output directory: `.next`

---

## Author

**Lampard** — Independent finance researcher and market analyst.  
Specialties: macroeconomics, equity markets, monetary policy, personal finance, cryptocurrency.

Website: [sujitkarki.com.np](https://www.sujitkarki.com.np)

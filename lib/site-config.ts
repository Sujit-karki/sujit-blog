export const siteConfig = {
  name: "Lampard",
  url: "https://www.sujitkarki.com.np",
  tagline: "Deep market research, investing guides, and money strategies",
  description:
    "In-depth personal finance guides, market analysis, and investing strategies backed by rigorous research.",
  author: {
    name: "Lampard",
    credentials: "Finance Researcher & Market Analyst",
    bio: "Independent finance researcher and market analyst with expertise in macroeconomics, equity markets, and personal finance. I help regular investors make better-informed decisions through rigorous, data-driven analysis.",
    avatarInitial: "S",
    knowsAbout: [
      "Financial Markets",
      "Macroeconomics",
      "Monetary Policy",
      "Equity Analysis",
      "Emerging Markets",
      "Personal Finance",
      "Cryptocurrency",
    ],
  },
  social: {
    twitter: "",
    linkedin: "",
    youtube: "",
    email: "",
  },
} as const;

export const categories = [
  "Investing",
  "Personal Finance",
  "Crypto",
  "Side Hustles",
  "Market Analysis",
] as const;

export type Category = (typeof categories)[number];

export function slugifyCategory(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-");
}

export function categoryFromSlug(slug: string): string | undefined {
  return categories.find((c) => slugifyCategory(c) === slug);
}

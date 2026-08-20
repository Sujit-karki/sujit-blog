export const siteConfig = {
  name: "Lampard",
  url: "https://www.sujitkarki.com.np",
  tagline: "Deep market research, investing guides, and money strategies",
  description:
    "In-depth personal finance guides, market analysis, and investing strategies backed by rigorous research.",
  author: {
    name: "Sujit Karki",
    credentials: "Finance Researcher & Market Analyst",
    bio: "Independent finance researcher and market analyst with expertise in macroeconomics, equity markets, and personal finance. I help regular investors make better-informed decisions through rigorous, data-driven analysis.",
    avatarInitial: "S",
    // Real photo, used everywhere a raster avatar fits (About hero, AuthorBio,
    // post header, Person JSON-LD `image`). avatarInitial stays as the
    // fallback for spots that render a letter, not an <Image> (currently the
    // OG-image generation routes, which use Satori rather than next/image).
    avatarImage: "/images/sujit-karki.jpg",
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
  // Full profile URLs, not bare handles — every platform's URL shape is
  // different enough (facebook.com/x vs linkedin.com/in/x vs @handle) that
  // storing the complete, already-correct URL avoids re-deriving it wrong.
  social: {
    facebook: "https://www.facebook.com/sujit.karki.921",
    instagram: "https://www.instagram.com/lampard100000",
    twitter: "",
    linkedin: "",
    github: "",
    email: "",
  },
} as const;

// Verifiable profile links for the author — the highest-value E-E-A-T signal
// for YMYL content, since it lets a rater (or reader) confirm a real,
// identifiable person wrote this. Wired into every Person JSON-LD block
// (Organization.founder, Article.author, the /about Person entity) so
// filling these in once propagates everywhere. Empty until the real URLs
// are added — schema.org treats an empty sameAs array the same as omitting
// the field, so this is inert (not misleading) until then.
export const authorSameAs: string[] = (Object.values(siteConfig.social) as string[]).filter(
  Boolean
);

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

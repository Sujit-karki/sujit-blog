import type { MetadataRoute } from "next";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import { siteConfig, categories, slugifyCategory } from "@/lib/site-config";
import { tools } from "@/lib/tools-config";
import { correctionsByDate } from "@/lib/corrections";
import { researchPosts } from "@/lib/research-config";

const url = siteConfig.url;

// Static/legal pages don't have their own "updated" field, so lastModified
// is pinned to each file's actual last content-change date (from git log)
// instead of `new Date()`. Stamping "now" on every build regardless of
// whether the page changed is a known anti-pattern — Google has said it
// erodes trust in the lastmod signal, which can mean it's discounted
// entirely instead of helping Google prioritize what to (re)crawl. Bump
// these by hand when the corresponding page's content actually changes.
const ABOUT_UPDATED = new Date("2026-08-20");
const EDITORIAL_POLICY_UPDATED = new Date("2026-08-20");
const METHODOLOGY_UPDATED = new Date("2026-08-20");
// Derived rather than hand-set: the corrections page is a live log now, so its
// lastModified is the date of the most recent correction. A hand-maintained
// constant here would go stale the first time one is added and forgotten.
const CORRECTIONS_UPDATED = new Date(
  `${correctionsByDate()[0]?.date ?? "2026-08-20"}T00:00:00Z`
);
const AI_DISCLOSURE_UPDATED = new Date("2026-08-20");
// Bumped 2026-09-08: rewritten from a 128-word stub to cover corrections,
// scope limits, and who actually answers.
const CONTACT_UPDATED = new Date("2026-09-08");
const WORK_WITH_ME_UPDATED = new Date("2026-09-08");
const DISCLAIMER_UPDATED = new Date("2026-06-17");
const PRIVACY_POLICY_UPDATED = new Date("2026-06-12");
// Bumped 2026-09-08: added the framing prose explaining what these
// calculators show and where they differ from the usual lead-gen kind.
const TOOLS_INDEX_UPDATED = new Date("2026-09-08");
// Derived, for the same reason as CORRECTIONS_UPDATED above: /research renders
// researchPosts, so the page changes exactly when an entry is added. A
// hand-set constant here went stale the first time that happened — the
// 2026-09-10 study landed while this still read 2026-09-07 — which is the
// failure mode the corrections note already warns about.
const RESEARCH_INDEX_UPDATED = researchPosts.reduce((latest, post) => {
  const d = new Date(`${post.date}T00:00:00Z`);
  return d > latest ? d : latest;
}, new Date(0));
// Bumped 2026-09-08: the how-to step list is rendered on tool pages again
// (it had been written in tools-config but unreachable), so the body copy on
// all six genuinely changed.
const TOOLS_CONFIG_UPDATED = new Date("2026-09-08");

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  // The homepage lists posts, so it genuinely changes every time a post
  // publishes or is updated — reflect that with the most recent real post
  // date rather than a hardcoded value or "now" on every unrelated build.
  const latestPostDate = posts.reduce((latest, p) => {
    const d = new Date(p.updated ?? p.date);
    return d > latest ? d : latest;
  }, new Date(0));

  return [
    { url, lastModified: latestPostDate, changeFrequency: "daily", priority: 1 },
    { url: `${url}/about`, lastModified: ABOUT_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${url}/editorial-policy`, lastModified: EDITORIAL_POLICY_UPDATED, changeFrequency: "yearly", priority: 0.5 },
    { url: `${url}/methodology`, lastModified: METHODOLOGY_UPDATED, changeFrequency: "yearly", priority: 0.5 },
    { url: `${url}/corrections`, lastModified: CORRECTIONS_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${url}/ai-disclosure`, lastModified: AI_DISCLOSURE_UPDATED, changeFrequency: "yearly", priority: 0.4 },
    { url: `${url}/work-with-me`, lastModified: WORK_WITH_ME_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${url}/contact`, lastModified: CONTACT_UPDATED, changeFrequency: "yearly", priority: 0.4 },
    { url: `${url}/disclaimer`, lastModified: DISCLAIMER_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${url}/privacy-policy`, lastModified: PRIVACY_POLICY_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${url}/tools`, lastModified: TOOLS_INDEX_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${url}/research`, lastModified: RESEARCH_INDEX_UPDATED, changeFrequency: "weekly", priority: 0.8 },

    ...tools.map((tool) => ({
      url: `${url}/tools/${tool.slug}`,
      lastModified: TOOLS_CONFIG_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // Thin categories (<3 posts) are noindexed — keep the sitemap in sync.
    ...categories
      .filter((cat) => getPostsByCategory(cat).length >= 3)
      .map((cat) => {
        const catPosts = getPostsByCategory(cat);
        const catLatest = catPosts.reduce((latest, p) => {
          const d = new Date(p.updated ?? p.date);
          return d > latest ? d : latest;
        }, new Date(0));
        return {
          url: `${url}/category/${slugifyCategory(cat)}`,
          lastModified: catLatest,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
      }),

    ...posts
      .filter((post) => !post.noindex)
      .map((post) => ({
        url: `${url}/posts/${post.slug}`,
        lastModified: new Date(post.updated ?? post.date),
        changeFrequency: "monthly" as const,
        priority: 0.9,
      })),

    // Tag archive pages are noindexed (thin content) — excluded from the sitemap.
  ];
}

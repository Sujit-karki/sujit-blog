import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import { categories } from "./site-config";

const postsDir = path.join(process.cwd(), "content", "posts");

const tocItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.union([z.literal(2), z.literal(3)]).optional(),
});

const faqItemSchema = z.object({
  q: z.string(),
  a: z.string(),
});

const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  // Optional overrides for the <title> tag / meta description / OG+Twitter cards
  // only — the on-page H1 and subtitle always render the full `title`/`description`.
  // Use these when the full title/description reads great on the page but runs
  // past Google's ~60/~160-char SERP truncation points.
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(170).optional(),
  date: z.string(),
  updated: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.enum(categories),
  author: z.string().min(1),
  coverImage: z.string().optional(),
  toc: z.array(tocItemSchema).optional(),
  faq: z.array(faqItemSchema).optional(),
  // Set true to keep a post live (crawlable, linked) but remove it from the
  // index and the sitemap — for thin/stale/redundant posts triaged out of
  // the AdSense content audit without breaking existing inbound links.
  noindex: z.boolean().optional().default(false),
});

export type TocItem = z.infer<typeof tocItemSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type PostFrontmatter = z.infer<typeof frontmatterSchema>;

export interface Post extends PostFrontmatter {
  slug: string;
  readingTime: number;
}

function parseFrontmatter(slug: string, data: unknown): PostFrontmatter {
  const result = frontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in content/posts/${slug}.mdx:\n${result.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`
    );
  }
  return result.data;
}

// coverImage frontmatter often lags behind the actual asset (or was never added) —
// only expose it when the file genuinely exists, so pages can render it unconditionally.
function resolveCoverImage(coverImage: string | undefined): string | undefined {
  if (!coverImage) return undefined;
  const filePath = path.join(process.cwd(), "public", coverImage);
  return fs.existsSync(filePath) ? coverImage : undefined;
}

function calcReadingTime(content: string): number {
  const text = content
    .replace(/---[\s\S]*?---/, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[#*`[\]()!_~]/g, "")
    .trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));
  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = parseFrontmatter(slug, data);
      return {
        slug,
        readingTime: calcReadingTime(content),
        ...frontmatter,
        coverImage: resolveCoverImage(frontmatter.coverImage),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = parseFrontmatter(slug, data);
  return {
    slug,
    readingTime: calcReadingTime(content),
    ...frontmatter,
    coverImage: resolveCoverImage(frontmatter.coverImage),
  };
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  getAllPosts().forEach((p) => p.tags?.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

// Tags are matched by slug, not by exact string. Frontmatter across the archive
// uses both "taxes" and "Taxes", "retirement" and "Retirement" — 20 such pairs.
// An exact-match lookup treats those as different tags while they share one
// URL, so /tags/taxes was listing only the 4 posts tagged "Taxes" and hiding
// the 10 tagged "taxes". Matching on the slug merges the variants, which is
// what a reader landing on that page expects to see.
export function getPostsByTag(tag: string): Post[] {
  const slug = slugifyTag(tag);
  return getAllPosts().filter((p) => p.tags?.some((t) => slugifyTag(t) === slug));
}

// A tag page listing one or two posts is a thin archive: it adds a crawlable
// URL without adding anything a reader or a crawler wants. 76 posts carried 307
// distinct tags, 255 of them used exactly once — four crawlable URLs per post,
// every one of them noindexed. Googlebot still has to discover and fetch each
// one before being told to ignore it, and on a young domain that crawl budget
// is better spent on the posts themselves.
//
// Tags below this threshold still render on the post (readers see the topic),
// they just don't get a page, so no link points at a URL that isn't worth
// crawling. Mirrors the existing rule for thin category pages.
export const TAG_PAGE_MIN_POSTS = 3;

export function tagHasPage(tag: string): boolean {
  return getPostsByTag(tag).length >= TAG_PAGE_MIN_POSTS;
}

// One entry per slug, not per spelling — otherwise "taxes" and "Taxes" would
// both generate /tags/taxes.
export function getTagsWithPages(): string[] {
  const bySlug = new Map<string, string>();
  for (const tag of getAllTags()) {
    const slug = slugifyTag(tag);
    if (bySlug.has(slug) || !tagHasPage(tag)) continue;
    const canonical = tagFromSlug(slug);
    if (canonical) bySlug.set(slug, canonical);
  }
  return [...bySlug.values()];
}

// Multi-word tags (e.g. "Market Analysis") need a URL-safe slug instead of a
// raw, space-containing dynamic segment — percent-encoded spaces in a
// generateStaticParams-produced route don't reliably match the incoming
// request URL under Next 16 Cache Components, 404ing in production even
// though the exact same route is listed as prerendered.
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Several tags exist in more than one spelling. Resolve a slug to the variant
// the most posts actually use, so the page heading reads the way the archive
// does rather than whichever casing happened to sort first.
export function tagFromSlug(slug: string): string | undefined {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags ?? []) {
      if (slugifyTag(tag) !== slug) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  if (counts.size === 0) return undefined;
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

// Related posts are the archive's main internal-linking mechanism, so which
// posts this returns decides which posts Google sees as worth indexing.
//
// The original implementation took the same-category posts and sliced the first
// three off a date-descending list, which meant every post in a category linked
// to the same three newest posts and nothing else. 67 of 82 posts received no
// related-post link at all, and each new post silently demoted the previous
// winners to zero. That is the profile Search Console reports as "Crawled -
// currently not indexed".
//
// So one slot is reserved for rotation and the rest are ranked on relatedness.
// Ranking alone does not fix it: score every candidate and the well-tagged hubs
// win every slot on every page, which is the same bug wearing a better sort.
// The reserved slot is what guarantees coverage; the ranked ones are what keep
// the block worth reading. Same input, same output — the order is fully
// determined by the posts themselves, so pages stay cacheable.
export function getRelatedPosts(slug: string, category: string, limit = 3): Post[] {
  const all = getAllPosts();
  const selfIndex = all.findIndex((p) => p.slug === slug);
  const currentTags = new Set((all[selfIndex]?.tags ?? []).map(slugifyTag));

  // A noindex post is deliberately out of the index; spending a related slot on
  // one passes link equity to a page that cannot rank.
  const candidates = all
    .map((post, index) => ({ post, index }))
    .filter(({ post }) => post.slug !== slug && !post.noindex);

  if (candidates.length === 0) return [];

  // One slot is reserved for the next post in the archive, wrapping at the end.
  // Relevance ranking alone cannot fix the orphaning: score the candidates and
  // the well-tagged hubs simply win every slot on every page, which is the
  // original bug wearing a better sort. Because this pick walks a cycle through
  // every indexable post, each one is the reserved pick of exactly one other
  // post, so no post can score its way to zero inbound links.
  const distance = (index: number) =>
    selfIndex === -1 ? index : (index - selfIndex + all.length) % all.length;
  const ring = candidates.reduce((nearest, c) =>
    distance(c.index) < distance(nearest.index) ? c : nearest
  );

  // The remaining slots go to genuine relatedness: shared tags outrank a shared
  // category, since two posts both tagged "Roth IRA" are a closer match than two
  // unrelated posts filed under Investing. Ties fall back to the same rotation,
  // so even the relevance slots favour a different slice of the archive on each
  // page rather than pooling on whatever shipped most recently.
  const related = candidates
    .filter((c) => c.post.slug !== ring.post.slug)
    .map((c) => ({
      ...c,
      score:
        c.post.tags.filter((t) => currentTags.has(slugifyTag(t))).length * 2 +
        (c.post.category === category ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || distance(a.index) - distance(b.index))
    .slice(0, Math.max(0, limit - 1))
    .map(({ post }) => post);

  return [...related, ring.post];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

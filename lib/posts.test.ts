import { describe, expect, it } from "vitest";
import { formatDate, formatDateShort, getAllPosts, getRelatedPosts, slugifyTag } from "./posts";

describe("slugifyTag", () => {
  it("lowercases and hyphenates multi-word tags", () => {
    expect(slugifyTag("Market Analysis")).toBe("market-analysis");
  });

  it("strips characters that aren't alphanumeric", () => {
    expect(slugifyTag("401(k) & IRA!")).toBe("401-k-ira");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyTag("  --Tax Tips--  ")).toBe("tax-tips");
  });
});

describe("formatDate", () => {
  it("renders a long-form UTC date", () => {
    expect(formatDate("2026-01-15")).toBe("January 15, 2026");
  });
});

describe("formatDateShort", () => {
  it("renders a short-form UTC date", () => {
    expect(formatDateShort("2026-01-15")).toBe("Jan 15, 2026");
  });
});

// The related-posts block is the archive's main internal-linking mechanism. It
// previously returned the three newest posts in a category to every post in
// that category, leaving 67 of 82 posts with no inbound related link — the
// "Crawled - currently not indexed" profile. These assert the property that
// regression violated, rather than any particular ordering.
describe("getRelatedPosts", () => {
  const posts = getAllPosts();
  const inbound = new Map<string, number>();
  for (const post of posts) {
    for (const related of getRelatedPosts(post.slug, post.category)) {
      inbound.set(related.slug, (inbound.get(related.slug) ?? 0) + 1);
    }
  }

  it("gives every indexed post at least one inbound related link", () => {
    const orphaned = posts
      .filter((p) => !p.noindex && !inbound.has(p.slug))
      .map((p) => p.slug);
    expect(orphaned).toEqual([]);
  });

  it("never links out to a noindex post", () => {
    const noindexed = posts.filter((p) => p.noindex).map((p) => p.slug);
    expect(noindexed.filter((slug) => inbound.has(slug))).toEqual([]);
  });

  it("returns the requested number of distinct posts, excluding itself", () => {
    const related = getRelatedPosts(posts[0].slug, posts[0].category);
    expect(related).toHaveLength(3);
    expect(new Set(related.map((p) => p.slug)).size).toBe(3);
    expect(related.map((p) => p.slug)).not.toContain(posts[0].slug);
  });

  it("is deterministic, so pages stay cacheable", () => {
    const first = getRelatedPosts(posts[5].slug, posts[5].category).map((p) => p.slug);
    const second = getRelatedPosts(posts[5].slug, posts[5].category).map((p) => p.slug);
    expect(first).toEqual(second);
  });
});

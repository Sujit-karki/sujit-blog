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
  date: z.string(),
  updated: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.enum(categories),
  author: z.string().min(1),
  coverImage: z.string().optional(),
  toc: z.array(tocItemSchema).optional(),
  faq: z.array(faqItemSchema).optional(),
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

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags?.includes(tag));
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getRelatedPosts(slug: string, category: string, limit = 3): Post[] {
  return getAllPosts()
    .filter((p) => p.slug !== slug && p.category === category)
    .slice(0, limit);
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

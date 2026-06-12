import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content", "posts");

export interface TocItem {
  id: string;
  title: string;
  level?: 2 | 3;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  category: string;
  author: string;
  coverImage?: string;
  toc?: TocItem[];
  faq?: FaqItem[];
}

export interface Post extends PostFrontmatter {
  slug: string;
  readingTime: number;
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
      return {
        slug,
        readingTime: calcReadingTime(content),
        ...(data as PostFrontmatter),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    readingTime: calcReadingTime(content),
    ...(data as PostFrontmatter),
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

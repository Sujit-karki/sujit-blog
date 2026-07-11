import { cacheLife } from "next/cache";
import { getAllPosts } from "@/lib/posts";

export interface SearchIndexEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
}

async function buildIndex(): Promise<SearchIndexEntry[]> {
  "use cache";
  cacheLife("max");

  return getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    tags: p.tags,
  }));
}

export async function GET() {
  const index = await buildIndex();
  return Response.json(index);
}

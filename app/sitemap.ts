import type { MetadataRoute } from "next";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import { siteConfig, categories, slugifyCategory } from "@/lib/site-config";
import { tools } from "@/lib/tools-config";

const url = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    { url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${url}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${url}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${url}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${url}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },

    ...tools.map((tool) => ({
      url: `${url}/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // Thin categories (<3 posts) are noindexed — keep the sitemap in sync.
    ...categories
      .filter((cat) => getPostsByCategory(cat).length >= 3)
      .map((cat) => ({
        url: `${url}/category/${slugifyCategory(cat)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),

    ...posts.map((post) => ({
      url: `${url}/posts/${post.slug}`,
      lastModified: new Date(post.updated ?? post.date),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),

    // Tag archive pages are noindexed (thin content) — excluded from the sitemap.
  ];
}

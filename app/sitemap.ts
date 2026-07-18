import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags, slugifyTag } from "@/lib/posts";
import { siteConfig, categories, slugifyCategory } from "@/lib/site-config";

const url = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const tags = getAllTags();

  return [
    { url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${url}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${url}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${url}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },

    ...categories.map((cat) => ({
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

    ...tags.map((tag) => ({
      url: `${url}/tags/${slugifyTag(tag)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}

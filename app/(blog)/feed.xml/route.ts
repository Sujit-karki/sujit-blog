import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export async function GET() {
  const posts = getAllPosts();
  const { url, name, description } = siteConfig;

  const items = posts
    .map((post) => {
      const postUrl = `${url}/posts/${post.slug}`;
      const cats = post.tags?.map((t) => `<category>${esc(t)}</category>`).join("\n      ") ?? "";
      return `
    <item>
      <title>${esc(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${esc(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${esc(post.author)}</author>
      <category>${esc(post.category)}</category>
      ${cats}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(name)}</title>
    <link>${url}</link>
    <description>${esc(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${url}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

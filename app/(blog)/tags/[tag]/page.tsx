import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { getAllTags, getPostsByTag, slugifyTag, tagFromSlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  // Route by slug, not raw tag text — a dynamic segment containing an
  // encoded space (%20) doesn't reliably match the incoming request URL
  // under Next 16 Cache Components, 404ing in production even though the
  // exact route is listed as prerendered. Slugs sidestep that entirely.
  return getAllTags().map((tag) => ({ tag: slugifyTag(tag) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = tagFromSlug(slug);
  if (!tag) return {};
  const url = `${siteConfig.url}/tags/${slug}`;
  return {
    title: `#${tag} Articles`,
    description: `Browse all articles tagged "${tag}" on ${siteConfig.name}.`,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `#${tag} | ${siteConfig.name}` },
    robots: { index: false, follow: true },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag: slug } = await params;
  const tag = tagFromSlug(slug);
  if (!tag) notFound();
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: `#${tag}` }];

  return (
    <>
      <script type="application/ld+json" async dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url)).replace(/</g, "\\u003c") }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6"><Breadcrumb items={breadcrumbItems} /></div>

        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Tag</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">#{tag}</h1>
          <p className="text-gray-500 dark:text-gray-400">{posts.length} article{posts.length !== 1 ? "s" : ""}</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>

      </div>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const url = `${siteConfig.url}/tags/${tag}`;
  return {
    title: `#${decoded} Articles`,
    description: `Browse all articles tagged "${decoded}" on ${siteConfig.name}.`,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `#${decoded} | ${siteConfig.name}` },
  };
}

export const dynamicParams = false;

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);
  if (posts.length === 0) notFound();

  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: `#${decoded}` }];

  return (
    <>
      <script type="application/ld+json" async dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url)).replace(/</g, "\\u003c") }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6"><Breadcrumb items={breadcrumbItems} /></div>

        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Tag</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">#{decoded}</h1>
          <p className="text-gray-500 dark:text-gray-400">{posts.length} article{posts.length !== 1 ? "s" : ""}</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>

      </div>
    </>
  );
}

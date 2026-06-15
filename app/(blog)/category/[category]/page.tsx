import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { getPostsByCategory } from "@/lib/posts";
import { siteConfig, categories, categoryFromSlug, slugifyCategory } from "@/lib/site-config";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return categories.map((cat) => ({ category: slugifyCategory(cat) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const name = categoryFromSlug(slug);
  if (!name) return {};
  const url = `${siteConfig.url}/category/${slug}`;
  return {
    title: `${name} Articles`,
    description: `Browse all ${name} articles on ${siteConfig.name} — in-depth guides and analysis.`,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${name} | ${siteConfig.name}`, description: `Browse ${name} articles.` },
  };
}

export const dynamicParams = false;

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const name = categoryFromSlug(slug);
  if (!name) notFound();

  const posts = getPostsByCategory(name);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: name },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url);

  return (
    <>
      <script type="application/ld+json" async dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <header className="mb-6">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            Category
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            {name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {posts.length} article{posts.length !== 1 ? "s" : ""}
          </p>
        </header>

        {posts.length > 0 ? (
          <>
            {/* First 3 posts */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {posts.slice(0, 3).map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>

            {posts.length > 3 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                {posts.slice(3, 5).map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}

            {/* Remaining posts */}
            {posts.length > 5 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                {posts.slice(5).map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}

          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 dark:text-gray-500 text-lg mb-2">No articles yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-600">Check back soon — new {name} content is coming.</p>
          </div>
        )}
      </div>
    </>
  );
}

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

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Investing:
    "Index funds, IRAs, Roth conversions, and tax-loss harvesting — in-depth investing guides backed by primary sources and interactive calculators, not hot takes.",
  "Personal Finance":
    "Budgeting, taxes, insurance, and household costs explained with real numbers — practical personal finance guides for planning 2026 and beyond.",
  Crypto:
    "Bitcoin, Ethereum, and Solana ETFs, staking yields, and crypto tax rules — honest, source-checked crypto analysis with no hype and no price predictions.",
  "Side Hustles":
    "Gig work, affiliate income, and creator payouts — the real math on what side hustles actually pay after taxes, fees, and returns.",
  "Market Analysis":
    "Fed policy, jobs reports, earnings season, and market concentration — data-driven market analysis for everyday index-fund investors.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const name = categoryFromSlug(slug);
  if (!name) return {};
  const url = `${siteConfig.url}/category/${slug}`;
  const isThin = getPostsByCategory(name).length < 3;
  const description =
    CATEGORY_DESCRIPTIONS[name] ?? `Browse all ${name} articles on ${siteConfig.name} — in-depth guides and analysis.`;
  return {
    title: `${name} Articles`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${name} | ${siteConfig.name}`, description },
    robots: isThin ? { index: false, follow: true } : undefined,
  };
}

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

import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import FadeIn from "@/components/FadeIn";
import NewsTicker from "@/components/NewsTicker";
import FinancialTicker from "@/components/financial/FinancialTicker";
import GoogleAdSense from "@/components/ads/GoogleAdSense";
import { ADS_ENABLED } from "@/lib/ads-config";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import { siteConfig, categories, slugifyCategory } from "@/lib/site-config";
import { researchPosts } from "@/lib/research-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: siteConfig.name }],
  },
};

export default function HomePage() {
  const allPosts = getAllPosts();
  const [featuredA, featuredB, featuredC, ...rest] = allPosts;
  const featuredPosts = [featuredA, featuredB, featuredC].filter(Boolean);
  const featuredThemes = ["emerald", "violet", "sunset"] as const;
  const latestSix = rest.slice(0, 6);
  const newestResearch = [...researchPosts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const tickerPosts = allPosts.slice(0, 8).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
  }));

  return (
    <>
      {/* Live market ticker — homepage only, see layout.tsx for why */}
      <FinancialTicker />

      {/* News Ticker */}
      <NewsTicker posts={tickerPosts} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero — featured posts, one per premium color theme */}
        {featuredPosts.length > 0 && (
          <section className="mb-10 grid gap-5 md:grid-cols-3 items-stretch animate-fade-in-up">
            {featuredPosts.map((post, i) => (
              <PostCard key={post.slug} post={post} featured theme={featuredThemes[i]} />
            ))}
          </section>
        )}

        {/* Original data — the thing that distinguishes this site from a
            hundred others summarising the same press releases, and previously
            reachable only by typing /research into the address bar. */}
        {newestResearch.length > 0 && (
          <section className="mb-12 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
                  Original data
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                  Numbers I generated, not numbers I found
                </h2>
              </div>
              <Link
                href="/research"
                className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
              >
                All research &rarr;
              </Link>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-2xl">
              Every figure in these comes from a script in{" "}
              <a
                href="https://github.com/Sujit-karki/sujit-blog#original-data"
                className="text-emerald-700 dark:text-emerald-400 hover:underline"
                rel="noopener"
              >
                the public repository
              </a>
              , and the dataset behind each one is published with the post.
            </p>

            <ul className="grid gap-4 sm:grid-cols-3 list-none p-0 m-0">
              {newestResearch.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/posts/${r.slug}`}
                    className="group block h-full rounded-xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-4 transition-colors hover:border-emerald-400 dark:hover:border-emerald-600"
                  >
                    <p className="font-bold text-sm text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {r.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {r.finding}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Latest articles + sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
          <div>
            {/* Latest articles */}
            {latestSix.length > 0 && (
              <section className="mb-14">
                <FadeIn>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Latest Articles
                    </h2>
                  </div>
                </FadeIn>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                  {latestSix.map((post, i) => (
                    <FadeIn key={post.slug} delay={i * 0.06}>
                      <PostCard post={post} />
                    </FadeIn>
                  ))}
                </div>
              </section>
            )}

            {/* Category sections */}
            {categories.map((cat, catIdx) => {
              const catPosts = getPostsByCategory(cat).slice(0, 3);
              if (catPosts.length === 0) return null;
              return (
                <Fragment key={cat}>
                  <section className="mb-14">
                    <FadeIn delay={catIdx * 0.05}>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cat}</h2>
                        <Link
                          href={`/category/${slugifyCategory(cat)}`}
                          className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2"
                        >
                          View all →
                        </Link>
                      </div>
                    </FadeIn>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                      {catPosts.map((post, i) => (
                        <FadeIn key={post.slug} delay={catIdx * 0.05 + i * 0.06}>
                          <PostCard post={post} />
                        </FadeIn>
                      ))}
                    </div>
                  </section>

                  {/* AdSense in-feed every 2 categories */}
                  {ADS_ENABLED && catIdx % 2 === 1 && (
                    <FadeIn delay={0.1}>
                      <div className="mb-14 ad-label relative">
                        <GoogleAdSense
                          slot="1234567890"
                          format="fluid"
                          className="min-h-[100px]"
                        />
                      </div>
                    </FadeIn>
                  )}
                </Fragment>
              );
            })}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">

              {/* Browse by category */}
              <FadeIn delay={0.3}>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
                    Browse Topics
                  </h3>
                  <ul className="space-y-1">
                    {categories.map((cat) => {
                      const count = getPostsByCategory(cat).length;
                      return (
                        <li key={cat}>
                          <Link
                            href={`/category/${slugifyCategory(cat)}`}
                            className="flex items-center justify-between py-2 px-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                          >
                            <span>{cat}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                              {count}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </FadeIn>

              {/* Sidebar AdSense */}
              {ADS_ENABLED && (
                <FadeIn delay={0.4}>
                  <div className="ad-label relative">
                    <GoogleAdSense
                      slot="0987654321"
                      format="rectangle"
                      style={{ minHeight: 250 }}
                    />
                  </div>
                </FadeIn>
              )}

            </div>
          </aside>
        </div>

        {allPosts.length === 0 && (
          <p className="text-center text-gray-500 py-20">No posts yet. Check back soon.</p>
        )}
      </div>
    </>
  );
}

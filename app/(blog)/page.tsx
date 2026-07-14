import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import FadeIn from "@/components/FadeIn";
import NewsTicker from "@/components/NewsTicker";
import GoogleAdSense from "@/components/ads/GoogleAdSense";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import { siteConfig, categories, slugifyCategory } from "@/lib/site-config";

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

  const tickerPosts = allPosts.slice(0, 8).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
  }));

  return (
    <>
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
                  {catIdx % 2 === 1 && (
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
              <FadeIn delay={0.4}>
                <div className="ad-label relative">
                  <GoogleAdSense
                    slot="0987654321"
                    format="rectangle"
                    style={{ minHeight: 250 }}
                  />
                </div>
              </FadeIn>

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

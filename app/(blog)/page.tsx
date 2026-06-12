import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import CaiUnityAd from "@/components/CaiUnityAd";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import { siteConfig, categories, slugifyCategory } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

export default function HomePage() {
  const allPosts = getAllPosts();
  const [featured, ...rest] = allPosts;
  const latestSix = rest.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Hero — featured post */}
      {featured && (
        <section className="mb-12">
          <PostCard post={featured} featured />
        </section>
      )}

      {/* Latest articles + sidebar */}
      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
        <div>
          {/* Latest articles grid */}
          {latestSix.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Latest Articles
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {latestSix.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* Category sections */}
          {categories.map((cat) => {
            const catPosts = getPostsByCategory(cat).slice(0, 3);
            if (catPosts.length === 0) return null;
            return (
              <section key={cat} className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cat}</h2>
                  <Link
                    href={`/category/${slugifyCategory(cat)}`}
                    className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* CAI Unity ad */}
            <CaiUnityAd />

            {/* Browse by category */}
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

          </div>
        </aside>
      </div>

      {allPosts.length === 0 && (
        <p className="text-center text-gray-500 py-20">No posts yet. Check back soon.</p>
      )}
    </div>
  );
}

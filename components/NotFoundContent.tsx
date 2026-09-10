import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";
import { categories, slugifyCategory } from "@/lib/site-config";

// The body of the 404, shared by both not-found boundaries. The root one wraps
// it in Header/Footer because an unmatched URL never enters the (blog) group;
// the (blog) one must not, because there the group layout already renders them
// and a second pair stacks directly under the first.
export default function NotFoundContent() {
  const latest = getAllPosts().slice(0, 3);

  return (
    <>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          404
        </p>
        <h1 className="font-display mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          The link may be broken, or it may point at an older version of
          this site whose posts were not carried over. Everything published
          since has a <span className="font-mono text-sm">/posts/</span>
          address — the homepage and search below will find it.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Go to homepage
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-900"
          >
            Search the archive
          </Link>
          <Link
            href="/research"
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-900"
          >
            Research hub
          </Link>
        </div>

        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Or pick a topic
          </p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/category/${slugifyCategory(category)}`}
                  className="inline-block rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <h2 className="font-display text-xl font-extrabold text-gray-900 dark:text-white">
            Latest from the blog
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

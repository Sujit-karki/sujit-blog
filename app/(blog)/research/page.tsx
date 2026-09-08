import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";
import { researchPosts } from "@/lib/research-config";

const TITLE = "Original Data";
const DESCRIPTION =
  "Posts built on datasets produced here — local AI benchmarks, and inflation figures computed from the government's own formulas rather than repeated from a headline. Every script is published.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${siteConfig.url}/research` },
  openGraph: { type: "website", url: `${siteConfig.url}/research`, title: `${TITLE} | ${siteConfig.name}` },
};

export default function ResearchPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: TITLE }];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url);

  // An ItemList makes the relationship between the hub and its posts explicit
  // to a crawler, rather than leaving it to be inferred from the links alone.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: TITLE,
    description: DESCRIPTION,
    itemListElement: researchPosts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}/posts/${post.slug}`,
      name: post.title,
    })),
  };

  const withData = researchPosts.filter((p) => p.dataset).length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-gray-900 dark:text-white mb-3">
          {TITLE}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mb-4">
          Most finance writing explains numbers someone else produced. These posts
          produce the numbers.
        </p>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mb-8">
          A post earns a place here only if a script in this site&apos;s repository
          generated or computed its central figures, and that script is published
          alongside it. That means every claim below can be re-derived, and will
          be wrong in public if it is wrong at all.
        </p>

        <div className="flex flex-wrap gap-6 mb-10 text-sm">
          <div>
            <span className="block font-mono text-2xl font-bold text-gray-900 dark:text-white">
              {researchPosts.length}
            </span>
            <span className="text-gray-500 dark:text-gray-400">posts</span>
          </div>
          <div>
            <span className="block font-mono text-2xl font-bold text-gray-900 dark:text-white">
              {withData}
            </span>
            <span className="text-gray-500 dark:text-gray-400">with published raw data</span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {researchPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  {post.method}
                </span>
                {post.dataset && (
                  <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    raw data
                  </span>
                )}
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {post.finding}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-2">How this work is done</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
            The AI benchmarks run open models locally through Ollama on a laptop
            with a 4 GB GPU — nothing is sent to an API, and the hardware is
            deliberately ordinary so the results describe what a person can
            actually run. The inflation work pulls live series from the Bureau of
            Labor Statistics and applies the same formula the agency does.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Models are the instrument, never the author. See the{" "}
            <Link href="/methodology" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline">
              methodology
            </Link>{" "}
            and{" "}
            <Link href="/ai-disclosure" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline">
              AI disclosure
            </Link>{" "}
            pages for how that rule is applied.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-3">
            Every script that produced these numbers is public in{" "}
            <a
              href="https://github.com/Sujit-karki/sujit-blog/tree/main/research"
              className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
              rel="noopener"
            >
              the repository
            </a>
            , and each post links the raw dataset it is built on. When one of
            these turns out to be wrong, the fix is logged on the{" "}
            <Link
              href="/corrections"
              className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
            >
              corrections page
            </Link>{" "}
            — including the time widening a sample falsified one of these
            headlines outright.
          </p>
        </div>
      </div>
    </>
  );
}

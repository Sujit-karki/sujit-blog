import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";
import { formatDate, formatDateShort } from "@/lib/posts";
import { researchKinds, researchPosts, type ResearchPost } from "@/lib/research-config";

const TITLE = "Original Data";
const DESCRIPTION =
  "Posts built on datasets produced here — local AI benchmarks, and inflation figures computed from the government's own formulas rather than repeated from a headline. Every script is published.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${siteConfig.url}/research` },
  openGraph: { type: "website", url: `${siteConfig.url}/research`, title: `${TITLE} | ${siteConfig.name}` },
};

// Newest first everywhere. The config is hand-ordered, and a hub whose top
// entry is not the latest study reads as abandoned.
const byDateDesc = (a: ResearchPost, b: ResearchPost) => b.date.localeCompare(a.date);

function StudyCard({ post }: { post: ResearchPost }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex h-full flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
    >
      <p className="tabular font-display text-3xl leading-none text-emerald-700 dark:text-emerald-400">
        {post.stat.value}
      </p>
      <p className="mt-2 text-xs leading-snug text-gray-500 dark:text-gray-400">{post.stat.label}</p>
      <h3 className="font-display mt-4 text-lg leading-snug text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
        {post.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">{post.finding}</p>
      <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-gray-500 dark:text-gray-400">
        <time dateTime={post.date}>{formatDateShort(post.date)}</time>
        {post.dataset && (
          <>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              raw data
            </span>
          </>
        )}
      </div>
    </Link>
  );
}

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

  const sorted = [...researchPosts].sort(byDateDesc);
  const lead = sorted[0];
  const groups = researchKinds
    .map((kind) => ({ ...kind, posts: sorted.filter((post) => post.kind === kind.id) }))
    .filter((group) => group.posts.length > 0);

  // Summed from each entry's own method line rather than typed in, so the
  // total cannot drift from the studies it describes.
  const generations = researchPosts.reduce((sum, post) => {
    const match = post.method.match(/([\d,]+) generations/);
    return sum + (match ? Number(match[1].replace(/,/g, "")) : 0);
  }, 0);

  const stats = [
    { value: researchPosts.length, label: "studies" },
    { value: researchPosts.filter((p) => p.dataset).length, label: "raw datasets" },
    { value: generations, label: "AI answers scored" },
  ];

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <header className="grid gap-8 border-b border-gray-200 dark:border-gray-800 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Research
            </p>
            <h1 className="font-display mt-3 text-4xl sm:text-5xl text-gray-900 dark:text-white">{TITLE}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Most finance writing explains numbers someone else produced. These posts
              produce the numbers.
            </p>
            <p className="mt-3 max-w-2xl leading-relaxed text-gray-500 dark:text-gray-400">
              A post earns a place here only if a script in this site&apos;s repository
              generated or computed its central figures, and that script is published
              alongside it. That means every claim below can be re-derived, and will
              be wrong in public if it is wrong at all.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-6 lg:gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-xs leading-snug text-gray-500 dark:text-gray-400">{stat.label}</dt>
                <dd className="tabular font-mono text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString("en-US")}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        <nav aria-label="Research topics" className="mt-8 flex flex-wrap gap-2">
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-emerald-400 hover:text-emerald-700 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-colors"
            >
              {group.title}
              <span className="tabular font-mono text-xs text-gray-400 dark:text-gray-500">{group.posts.length}</span>
            </a>
          ))}
        </nav>

        {lead && (
          <section aria-labelledby="latest-study" className="mt-10">
            <h2
              id="latest-study"
              className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
            >
              Latest study
            </h2>
            <Link
              href={`/posts/${lead.slug}`}
              className="group grid gap-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-6 sm:p-8 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-10"
            >
              <div>
                <p className="tabular font-display text-5xl sm:text-6xl leading-none text-emerald-700 dark:text-emerald-400">
                  {lead.stat.value}
                </p>
                <p className="mt-3 text-sm leading-snug text-gray-600 dark:text-gray-400">{lead.stat.label}</p>
              </div>
              <div>
                <time dateTime={lead.date} className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(lead.date)}
                </time>
                <h3 className="font-display mt-2 text-2xl sm:text-3xl leading-tight text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {lead.title}
                </h3>
                <p className="mt-3 max-w-[68ch] leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-4 md:line-clamp-none">
                  {lead.finding}
                </p>
                <p className="mt-4 font-mono text-xs leading-relaxed text-gray-500">{lead.method}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Read the study
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </section>
        )}

        {groups.map((group) => (
          <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="mt-14">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-gray-200 dark:border-gray-800 pb-3">
              <h2 id={`${group.id}-title`} className="font-display text-2xl text-gray-900 dark:text-white">
                {group.title}
              </h2>
              <p className="tabular font-mono text-xs text-gray-500 dark:text-gray-400">
                {group.posts.length} {group.posts.length === 1 ? "study" : "studies"}
              </p>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">{group.blurb}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.posts.map((post) => (
                <StudyCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        ))}

        <div className="mt-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-6">
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

import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";
import { correctionsByDate } from "@/lib/corrections";

export const metadata: Metadata = {
  title: "Corrections",
  description: `Every correction made to a published post on ${siteConfig.name}, what the post said before, and how the error was caught.`,
  alternates: { canonical: `${siteConfig.url}/corrections` },
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function CorrectionsPage() {
  const log = correctionsByDate();
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Corrections" }];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-gray-900 dark:text-white mb-3">
          Corrections
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-2xl">
          I write about numbers that matter to people&apos;s money. When I get one wrong, I want it
          fixed quickly and disclosed honestly — not quietly edited away. Everything I have had to
          correct is listed below, oldest error and all.
        </p>

        <section aria-labelledby="log" className="mb-14">
          <h2
            id="log"
            className="text-xl font-bold text-gray-900 dark:text-white mb-1"
          >
            The log
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {log.length} correction{log.length === 1 ? "" : "s"} to date. Every one is also
            marked in the post itself — this page is the index, not a substitute for
            disclosing it where the error was.
          </p>

          <ol className="space-y-6 list-none p-0 m-0">
            {log.map((c) => (
              <li
                key={`${c.slug}-${c.date}`}
                className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
                  <Link
                    href={`/posts/${c.slug}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {c.title}
                  </Link>
                  <time
                    dateTime={c.date}
                    className="text-xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0"
                  >
                    {dateFormat.format(new Date(`${c.date}T00:00:00Z`))}
                  </time>
                </div>

                <dl className="text-sm space-y-2 m-0">
                  <div>
                    <dt className="inline font-semibold text-red-700 dark:text-red-400">
                      What it said:{" "}
                    </dt>
                    <dd className="inline text-gray-600 dark:text-gray-400 m-0">
                      {c.wasWrong}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-emerald-700 dark:text-emerald-400">
                      Corrected to:{" "}
                    </dt>
                    <dd className="inline text-gray-600 dark:text-gray-400 m-0">
                      {c.correction}
                    </dd>
                  </div>
                </dl>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 mb-0">
                  {c.foundBy}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-3">
          <h2>How I handle an error</h2>
          <p>
            If a figure, date, or claim in a published post turns out to be wrong — whether I catch
            it myself or a reader points it out — I correct it directly in the post as soon as I can
            verify the right number against its primary source.
          </p>

          <h2>What changes when a post is corrected</h2>
          <ul>
            <li>
              <strong>Material errors</strong> — a wrong figure, a misstated rule, a broken piece of
              math in a calculator — get fixed in the text, and the post&apos;s{" "}
              <strong>&ldquo;Updated&rdquo;</strong> date (shown next to the publish date at the top
              of the post) moves to the date of the correction.
            </li>
            <li>
              <strong>Minor fixes</strong> — typos, broken links, formatting — are fixed without a
              separate updated-date bump, since they don&apos;t change what the post claims.
            </li>
            <li>
              A post is never quietly deleted to make an error disappear. If a post is retired
              because it&apos;s been superseded by a better, more current one, it 301-redirects to
              the post that replaced it, and that replacement is disclosed in the newer post.
            </li>
          </ul>

          <h2>How to report an error</h2>
          <p>
            If you spot something wrong — a stale figure, a source that no longer says what I cited
            it for, a bug in a calculator — <Link href="/contact">contact me</Link> with the post URL
            and what looks off. I read every message and will verify it against the primary source
            before changing anything.
          </p>

          <h2>Why this page exists</h2>
          <p>
            Personal finance content carries real consequences for readers. A visible, honest
            corrections process is part of taking that seriously — see the{" "}
            <Link href="/editorial-policy">Editorial Policy</Link> for how sourcing and fact-checking
            work in the first place.
          </p>
        </div>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Corrections Policy",
  description: `How ${siteConfig.name} handles errors — how corrections are made, disclosed, and how to report one.`,
  alternates: { canonical: `${siteConfig.url}/corrections` },
};

export default function CorrectionsPage() {
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

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          Corrections Policy
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-2xl">
          I write about numbers that matter to people&apos;s money. When I get one wrong, I want it
          fixed quickly and disclosed honestly — not quietly edited away.
        </p>

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

import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "AI Disclosure",
  description: `Where and how AI tools are used in researching, drafting, and building ${siteConfig.name} — and what's always human-verified.`,
  alternates: { canonical: `${siteConfig.url}/ai-disclosure` },
};

export default function AiDisclosurePage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "AI Disclosure" }];
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
          AI Disclosure
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-2xl">
          A direct answer to a question readers reasonably ask about any finance site in 2026: what
          role does AI play here?
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-3">
          <h2>Where AI tools are used</h2>
          <p>
            Drafting on {siteConfig.name} may involve AI tools — for structuring a first draft,
            suggesting phrasing, or writing parts of the code behind this site&apos;s calculators and
            charts. I also use AI tools during my own research process, the same way I&apos;d use a
            search engine or a calculator: as an assistant, not as the source of a fact.
          </p>

          <h2>What&apos;s always human-verified</h2>
          <p>
            Every number that gets published — a tax bracket, a rate, a deadline, a formula result —
            is checked by hand against the primary source cited for it before the post goes live. AI
            tools don&apos;t get to originate a statistic that ends up in an article; they can only
            help present one I&apos;ve already verified. See the{" "}
            <Link href="/methodology">Methodology page</Link> for exactly what counts as a primary
            source here.
          </p>

          <h2>What AI tools don&apos;t do</h2>
          <p>
            No AI tool publishes on this site unsupervised, picks what topics to cover, or forms the
            opinions and conclusions in a post — those are mine. There is no fully automated
            &ldquo;generate and publish&rdquo; pipeline running on {siteConfig.name}.
          </p>

          <h2>Why this page exists</h2>
          <p>
            Search engines and readers alike are right to be skeptical of low-effort, AI-generated
            finance content published at scale with no human oversight. Being specific about where
            AI is and isn&apos;t used — rather than staying silent on the question — is part of how I
            try to earn that skepticism&apos;s benefit of the doubt. See the{" "}
            <Link href="/editorial-policy">Editorial Policy</Link> for the full picture of how a post
            gets made.
          </p>
        </div>
      </div>
    </>
  );
}

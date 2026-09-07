import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: `How ${siteConfig.name} researches, sources, fact-checks, and updates its personal finance and market analysis content.`,
  alternates: { canonical: `${siteConfig.url}/editorial-policy` },
};

export default function EditorialPolicyPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Editorial Policy" }];
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
          Editorial Policy
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-2xl">
          How I research, write, and maintain everything published on {siteConfig.name}.
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-3">
          <h2>Who writes this</h2>
          <p>
            Every post on {siteConfig.name} is written by {siteConfig.author.name} — see the{" "}
            <Link href="/about">About page</Link> for my background. This is an independent,
            one-person publication. There is no editorial staff beyond me, and no sponsor or
            advertiser has input into what I write about or what I conclude.
          </p>

          <h2>What counts as a source</h2>
          <p>
            For any claim involving a number — a tax bracket, a contribution limit, a Fed rate, an
            inflation reading, a program deadline — I cite the primary source directly: the IRS, SEC,
            CBO/CRS, the Federal Reserve or FRED, CMS, the Social Security Administration, or the
            original agency, court filing, or company disclosure. I use secondary reporting to
            understand context, not as the source of a figure I publish. Where a figure is projected
            rather than finalized (a proposed limit, a not-yet-passed bill), the post says so
            explicitly and is flagged as an estimate.
          </p>

          <h2>How a post gets made</h2>
          <p>
            Research starts from the primary source, not a search-engine summary of it. Where a post
            includes an original chart or calculator, the underlying data and formula are described
            in the post itself — see the <Link href="/methodology">Methodology page</Link> for how
            those are built. Drafting may use AI tools; every figure that ends up published is
            checked by hand against its cited source before the post goes live — see the{" "}
            <Link href="/ai-disclosure">AI Disclosure page</Link> for the full policy on that.
          </p>

          <h2>Updates and corrections</h2>
          <p>
            Posts about numbers that change — tax brackets, Fed decisions, program rules — get a
            visible &ldquo;Updated&rdquo; date when the substance changes, not just the typo. If a
            post turns out to be wrong, it gets fixed and disclosed — see the{" "}
            <Link href="/corrections">Corrections page</Link>.
          </p>

          <h2>What this site is not</h2>
          <p>
            {siteConfig.name} is educational and informational, not personalized financial, tax, or
            legal advice. I&apos;m not a licensed financial advisor, CPA, or attorney, and nothing
            here should be read as a recommendation to buy, sell, or hold a specific security, or to
            take a specific tax position without checking it against your own situation — ideally
            with a qualified professional. See the full{" "}
            <Link href="/disclaimer">disclaimer</Link> for the legal detail.
          </p>

          <h2>Advertising</h2>
          <p>
            Where ads run on this site, they&apos;re served by Google AdSense and are clearly
            labeled. Ad placement never determines what I write about, and no advertiser reviews or
            approves content before publication.
          </p>
        </div>
      </div>
    </>
  );
}

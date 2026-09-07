import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Methodology",
  description: `How the calculators, charts, and data compilations on ${siteConfig.name} are built — sources, assumptions, and limits.`,
  alternates: { canonical: `${siteConfig.url}/methodology` },
};

export default function MethodologyPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Methodology" }];
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
          Methodology
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-2xl">
          How the calculators, charts, and data-driven posts on {siteConfig.name} are actually put
          together.
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-3">
          <h2>Calculators</h2>
          <p>
            Every interactive calculator on this site — on the <Link href="/tools">tools page</Link>{" "}
            and embedded in posts — states its own assumptions on the page it lives on: the growth
            rate it assumes, the contribution limit or tax bracket it uses, and what it deliberately
            ignores (fees, state taxes, sequence-of-returns risk, and so on). None of them are
            personalized financial projections. They&apos;re simplified models meant to make a
            specific trade-off — Roth vs. Traditional, DCA vs. lump sum, needs vs. wants — legible in
            dollars, using round, stated numbers rather than your actual financial details.
          </p>

          <h2>Charts built from primary data</h2>
          <p>
            Where a post includes an original chart, the data behind it is compiled directly from
            the primary source named in the post&apos;s sources — the Federal Reserve/FRED for rate
            and macro series, the IRS for tax figures, the SEC for filings and ETF flow data, the
            Social Security Administration for COLA and benefit figures, CMS for Medicare figures.
            I&apos;m not aggregating a secondary site&apos;s already-processed numbers; I&apos;m
            pulling from the same release the primary source publishes and building the
            visualization myself.
          </p>

          <h2>Projected vs. finalized figures</h2>
          <p>
            Some posts — next year&apos;s tax brackets, a proposed contribution limit, a not-yet-final
            program rule — necessarily use projected figures ahead of an official release. Those
            posts say explicitly that the number is a projection, explain how it was projected
            (typically by applying the same inflation-adjustment formula the agency itself uses to
            the latest available inflation data), and get a real &ldquo;Updated&rdquo; pass once the
            official number is out.
          </p>

          <h2>What &ldquo;primary source&rdquo; means here</h2>
          <p>
            In practice: irs.gov, sec.gov, federalreserve.gov and fred.stlouisfed.org, ssa.gov,
            cms.gov, cbo.gov, treasury.gov, bls.gov, and — for legislation — the actual bill text or
            a nonpartisan summary from CRS. A company&apos;s own SEC filing is a primary source for
            its own numbers; a news article summarizing that filing is not, and I try not to cite it
            as one.
          </p>

          <h2>Limits</h2>
          <p>
            All of this is still one person&apos;s independent research, not a peer-reviewed
            publication or a licensed advisory service. Models simplify. Projections can be wrong
            before the official number lands. If you find an error in a source, a formula, or a
            figure, I want to know — see the <Link href="/corrections">Corrections page</Link>.
          </p>
        </div>
      </div>
    </>
  );
}

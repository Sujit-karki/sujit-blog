import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import FaqAccordion from "@/components/mdx/FaqAccordion";
import EmbedSnippet from "@/components/tools/EmbedSnippet";
import CompoundGrowthChart from "@/components/custom/CompoundGrowthChart";
import RothIraCalculator from "@/components/custom/RothIraCalculator";
import SideHustleTaxEstimator from "@/components/custom/SideHustleTaxEstimator";
import BudgetCalculator from "@/components/custom/BudgetCalculator";
import TrumpVs529Calculator from "@/components/custom/TrumpVs529Calculator";
import BitcoinDrawdownCalculator from "@/components/custom/BitcoinDrawdownCalculator";
import { siteConfig, authorSameAs } from "@/lib/site-config";
import { tools, getToolBySlug } from "@/lib/tools-config";

const CALCULATORS: Record<string, React.ComponentType> = {
  "compound-interest-calculator": CompoundGrowthChart,
  "roth-vs-traditional-ira": RothIraCalculator,
  "side-hustle-tax-estimator": SideHustleTaxEstimator,
  "budget-calculator": BudgetCalculator,
  "trump-account-vs-529": TrumpVs529Calculator,
  "bitcoin-drawdown-calculator": BitcoinDrawdownCalculator,
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const url = `${siteConfig.url}/tools/${slug}`;
  return {
    title: tool.title,
    description: tool.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: tool.title,
      description: tool.shortDescription,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: tool.title,
      description: tool.shortDescription,
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const Calculator = CALCULATORS[slug];
  const url = `${siteConfig.url}/tools/${slug}`;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: tool.title },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url);

  // HowTo rich results were retired by Google in 2023 and FAQPage on
  // 2026-05-07 — neither earns a SERP appearance now, so we don't emit them.
  // The howTo steps and FAQ content still render visibly below. A calculator
  // this genuinely interactive/free is better represented as a
  // SoftwareApplication instead — that type is still live.
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.shortDescription,
    url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: `${siteConfig.url}/about`,
      sameAs: authorSameAs,
    },
    publisher: { "@type": "Organization", "@id": `${siteConfig.url}/#organization`, name: siteConfig.name },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {tool.category}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">
          {tool.title}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
          {tool.intro}
        </p>

        <Calculator />

        <FaqAccordion items={tool.faq} />

        <div className="my-8">
          <EmbedSnippet url={url} title={tool.title} />
        </div>

        {tool.relatedPosts.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6">
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Related reading</p>
            <ul className="space-y-2">
              {tool.relatedPosts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/posts/${p.slug}`}
                    className="text-sm font-medium text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
                  >
                    {p.title} &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

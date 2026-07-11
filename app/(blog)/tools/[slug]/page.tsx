import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import FaqAccordion from "@/components/mdx/FaqAccordion";
import EmbedSnippet from "@/components/tools/EmbedSnippet";
import CompoundGrowthChart from "@/components/custom/CompoundGrowthChart";
import RothIraCalculator from "@/components/custom/RothIraCalculator";
import SideHustleTaxEstimator from "@/components/custom/SideHustleTaxEstimator";
import { siteConfig } from "@/lib/site-config";
import { tools, getToolBySlug } from "@/lib/tools-config";

const CALCULATORS: Record<string, React.ComponentType> = {
  "compound-interest-calculator": CompoundGrowthChart,
  "roth-vs-traditional-ira": RothIraCalculator,
  "side-hustle-tax-estimator": SideHustleTaxEstimator,
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

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tool.title,
    description: tool.shortDescription,
    step: tool.howTo.map((s) => ({
      "@type": "HowToStep",
      name: s.name,
      text: s.text,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
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
                    className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
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

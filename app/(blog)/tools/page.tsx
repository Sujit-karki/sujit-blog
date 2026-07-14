import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools-config";

export const metadata: Metadata = {
  title: "Financial Calculators & Tools",
  description:
    "Free interactive financial calculators — compound interest, Roth vs Traditional IRA, self-employment tax, and a 50/30/20 budget calculator.",
  alternates: { canonical: `${siteConfig.url}/tools` },
};

export default function ToolsPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Tools" }];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          Financial Calculators &amp; Tools
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
          Free, interactive tools to run your own numbers — no signup required.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {tool.category}
              </span>
              <h2 className="font-bold text-gray-900 dark:text-white mt-2 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {tool.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {tool.shortDescription}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

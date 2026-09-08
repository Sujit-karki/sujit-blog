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

        <h1 className="font-display text-3xl sm:text-4xl text-gray-900 dark:text-white mb-3">
          Financial Calculators &amp; Tools
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
          Free, interactive tools to run your own numbers — no signup required.
        </p>

        <div className="max-w-2xl mb-12 space-y-4 text-[0.95rem] text-gray-700 dark:text-gray-300 leading-[1.75]">
          <p>
            Most financial calculators online are lead-generation forms wearing a
            calculator&apos;s clothes: they ask for your email, hand back a single
            confident number, and never tell you what went into it. These work
            differently. Nothing here collects an address, and every one of them shows
            its assumptions on the page — the rate it grew your money at, the tax
            treatment it applied, and the things it deliberately ignores.
          </p>
          <p>
            That last part matters more than the arithmetic. A compounding calculator
            that quietly omits inflation and fees is not wrong so much as flattering,
            and a Roth-versus-Traditional comparison that funds both sides with the
            same post-tax dollar has already decided the answer before you touch a
            slider. Each tool below is followed by a written breakdown of what it
            computes, where it is deliberately conservative, and the conditions under
            which its answer flips.
          </p>
          <p>
            None of it is personal financial advice, and none of it should be the last
            thing you read before making a decision. Use them to build intuition about
            which variables actually move the outcome — usually your contribution rate,
            your tax bracket, and time — then read the article each one links to for
            the parts a slider can&apos;t capture.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                {tool.category}
              </span>
              <h2 className="font-bold text-gray-900 dark:text-white mt-2 mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
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

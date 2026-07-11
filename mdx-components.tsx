import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import KeyTakeaways from "@/components/mdx/KeyTakeaways";
import InfoBox from "@/components/mdx/InfoBox";
import ProsCons from "@/components/mdx/ProsCons";
import ComparisonTable from "@/components/mdx/ComparisonTable";
import FaqAccordion from "@/components/mdx/FaqAccordion";
import Sources from "@/components/mdx/Sources";
import CodeBlock from "@/components/mdx/CodeBlock";
import GoogleAdSense from "@/components/ads/GoogleAdSense";
import FifaInteractive from "@/components/custom/FifaInteractive";
import CompoundGrowthChart from "@/components/custom/CompoundGrowthChart";
import RothIraCalculator from "@/components/custom/RothIraCalculator";
import SelfEmploymentTaxChart from "@/components/custom/SelfEmploymentTaxChart";
import SideHustleTaxEstimator from "@/components/custom/SideHustleTaxEstimator";
import LLCFeesChart from "@/components/custom/LLCFeesChart";
import RetirementContributionChart from "@/components/custom/RetirementContributionChart";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // HTML element overrides
    a: ({ href, children }) => (
      <Link
        href={href ?? "#"}
        className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
      >
        {children}
      </Link>
    ),
    img: (props) => (
      <Image
        sizes="(max-width: 768px) 100vw, 768px"
        style={{ width: "100%", height: "auto" }}
        {...(props as ImageProps)}
        alt={props.alt ?? ""}
      />
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-emerald-400 dark:border-emerald-500 pl-5 italic my-6 text-gray-600 dark:text-gray-400 bg-emerald-50/50 dark:bg-emerald-950/20 py-2 pr-4 rounded-r-lg">
        {children}
      </blockquote>
    ),
    code: ({ children, className }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-emerald-700 dark:text-emerald-300">
            {children}
          </code>
        );
      }
      return <code className={className}>{children}</code>;
    },
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800">
        {children}
      </td>
    ),
    hr: () => <hr className="border-gray-200 dark:border-gray-700 my-8" />,

    // Custom MDX components — available in all .mdx files without importing
    KeyTakeaways,
    InfoBox,
    ProsCons,
    ComparisonTable,
    FaqAccordion,
    Sources,
    GoogleAdSense,
    FifaInteractive,
    CompoundGrowthChart,
    RothIraCalculator,
    SelfEmploymentTaxChart,
    SideHustleTaxEstimator,
    LLCFeesChart,
    RetirementContributionChart,

    ...components,
  };
}

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
import BudgetCalculator from "@/components/custom/BudgetCalculator";
import TrumpVs529Calculator from "@/components/custom/TrumpVs529Calculator";
import TaxTreatmentChart from "@/components/custom/TaxTreatmentChart";
import ContributionSourcesChart from "@/components/custom/ContributionSourcesChart";
import GrowthVsSpendableChart from "@/components/custom/GrowthVsSpendableChart";
import AssetDrawdownChart from "@/components/custom/AssetDrawdownChart";
import BitcoinDrawdownCalculator from "@/components/custom/BitcoinDrawdownCalculator";
import TechConcentrationExplorer from "@/components/custom/TechConcentrationExplorer";
import AiCapexParadoxFlow from "@/components/custom/AiCapexParadoxFlow";
import GrowthDivergenceChart from "@/components/custom/GrowthDivergenceChart";
import ConcentrationGaugeChart from "@/components/custom/ConcentrationGaugeChart";
import FundTechExposureChart from "@/components/custom/FundTechExposureChart";
import DollarCycleFlow from "@/components/custom/DollarCycleFlow";
import FedTransmissionFlow from "@/components/custom/FedTransmissionFlow";
import RothVsTraditionalScenarioChart from "@/components/custom/RothVsTraditionalScenarioChart";
import FirstDollarStepFlow from "@/components/custom/FirstDollarStepFlow";
import OnChainMetricsDashboard from "@/components/custom/OnChainMetricsDashboard";
import BudgetSplitDonutChart from "@/components/custom/BudgetSplitDonutChart";
import RateScenarioSimulator from "@/components/custom/RateScenarioSimulator";
import StudentLoanPlanComparator from "@/components/custom/StudentLoanPlanComparator";
import GoldPortfolioSimulator from "@/components/custom/GoldPortfolioSimulator";
import SideHustleROICalculator from "@/components/custom/SideHustleROICalculator";
import DebtPayoffCalculator from "@/components/custom/DebtPayoffCalculator";
import InsuranceDeductibleCalculator from "@/components/custom/InsuranceDeductibleCalculator";
import StablecoinYieldGapCalculator from "@/components/custom/StablecoinYieldGapCalculator";
import RateHoldCashCalculator from "@/components/custom/RateHoldCashCalculator";
import ColaBenefitEstimator from "@/components/custom/ColaBenefitEstimator";
import AcaCliffEstimator from "@/components/custom/AcaCliffEstimator";
import TipsOvertimeDeductionEstimator from "@/components/custom/TipsOvertimeDeductionEstimator";
import RentVsBuyCalculator from "@/components/custom/RentVsBuyCalculator";
import ColaCalculationFlow from "@/components/custom/ColaCalculationFlow";
import AcaCliffFlow from "@/components/custom/AcaCliffFlow";
import TipsOvertimeClaimFlow from "@/components/custom/TipsOvertimeClaimFlow";
import BuyOrRentDecisionFlow from "@/components/custom/BuyOrRentDecisionFlow";
import PlatformTaxEstimator from "@/components/custom/PlatformTaxEstimator";
import CryptoRetirementSimulator from "@/components/custom/CryptoRetirementSimulator";
import AIExposureCalculator from "@/components/custom/AIExposureCalculator";
import ElectricBillProjector from "@/components/custom/ElectricBillProjector";
import RealIncomeCalculator from "@/components/custom/RealIncomeCalculator";
import CryptoRuleTimelineFlow from "@/components/custom/CryptoRuleTimelineFlow";
import GDPReactionFlow from "@/components/custom/GDPReactionFlow";
import RothCatchUpEstimator from "@/components/custom/RothCatchUpEstimator";
import CarLoanInterestDeductionCalculator from "@/components/custom/CarLoanInterestDeductionCalculator";
import CryptoBasisGapEstimator from "@/components/custom/CryptoBasisGapEstimator";
import TreasuryVsBankYieldCalculator from "@/components/custom/TreasuryVsBankYieldCalculator";
import NewGradIncomeGapCalculator from "@/components/custom/NewGradIncomeGapCalculator";
import BackToSchoolBudgetPlanner from "@/components/custom/BackToSchoolBudgetPlanner";
import CollegeRoiEstimator from "@/components/custom/CollegeRoiEstimator";
import StudentHustleIncomePlanner from "@/components/custom/StudentHustleIncomePlanner";
import CreatorPayoutEstimator from "@/components/custom/CreatorPayoutEstimator";
import TripCostInflationCalculator from "@/components/custom/TripCostInflationCalculator";
import HouseholdTariffCostEstimator from "@/components/custom/HouseholdTariffCostEstimator";
import TrueCostOfDrivingCalculator from "@/components/custom/TrueCostOfDrivingCalculator";
import NoBuySavingsProjector from "@/components/custom/NoBuySavingsProjector";
import EtfFlowImpactSimulator from "@/components/custom/EtfFlowImpactSimulator";
import GameLaunchValueCalculator from "@/components/custom/GameLaunchValueCalculator";
import LineChart from "@/components/charts/LineChartLazy";
import PieChart from "@/components/charts/PieChartLazy";
import BarChart from "@/components/charts/BarChartLazy";
import StatCard from "@/components/charts/StatCard";

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
    BudgetCalculator,
    TrumpVs529Calculator,
    TaxTreatmentChart,
    ContributionSourcesChart,
    GrowthVsSpendableChart,
    AssetDrawdownChart,
    BitcoinDrawdownCalculator,
    TechConcentrationExplorer,
    AiCapexParadoxFlow,
    GrowthDivergenceChart,
    ConcentrationGaugeChart,
    FundTechExposureChart,
    DollarCycleFlow,
    FedTransmissionFlow,
    RothVsTraditionalScenarioChart,
    FirstDollarStepFlow,
    OnChainMetricsDashboard,
    BudgetSplitDonutChart,
    RateScenarioSimulator,
    StudentLoanPlanComparator,
    GoldPortfolioSimulator,
    SideHustleROICalculator,
    DebtPayoffCalculator,
    InsuranceDeductibleCalculator,
    StablecoinYieldGapCalculator,
    RateHoldCashCalculator,
    ColaBenefitEstimator,
    AcaCliffEstimator,
    TipsOvertimeDeductionEstimator,
    RentVsBuyCalculator,
    ColaCalculationFlow,
    AcaCliffFlow,
    TipsOvertimeClaimFlow,
    BuyOrRentDecisionFlow,
    PlatformTaxEstimator,
    CryptoRetirementSimulator,
    AIExposureCalculator,
    ElectricBillProjector,
    RealIncomeCalculator,
    CryptoRuleTimelineFlow,
    GDPReactionFlow,
    RothCatchUpEstimator,
    CarLoanInterestDeductionCalculator,
    CryptoBasisGapEstimator,
    TreasuryVsBankYieldCalculator,
    NewGradIncomeGapCalculator,
    BackToSchoolBudgetPlanner,
    CollegeRoiEstimator,
    StudentHustleIncomePlanner,
    CreatorPayoutEstimator,
    TripCostInflationCalculator,
    HouseholdTariffCostEstimator,
    TrueCostOfDrivingCalculator,
    NoBuySavingsProjector,
    EtfFlowImpactSimulator,
    GameLaunchValueCalculator,
    LineChart,
    PieChart,
    BarChart,
    StatCard,

    ...components,
  };
}

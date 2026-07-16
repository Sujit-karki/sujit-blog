import type { FaqItem } from "@/components/mdx/FaqAccordion";

export interface HowToStep {
  name: string;
  text: string;
}

export interface ToolConfig {
  slug: string;
  title: string;
  shortDescription: string;
  intro: string;
  category: string;
  relatedPosts: { slug: string; title: string }[];
  howTo: HowToStep[];
  faq: FaqItem[];
}

export const tools: ToolConfig[] = [
  {
    slug: "compound-interest-calculator",
    title: "Compound Interest Calculator",
    shortDescription: "See what a lump sum plus monthly contributions can grow into over time.",
    intro:
      "Drag the chart or adjust the sliders to see how a one-time $1,000 investment, plus an optional monthly contribution, compounds over time at a 7.5% average annual return — roughly the long-run average of a broad U.S. stock index.",
    category: "Investing",
    relatedPosts: [{ slug: "how-to-invest-first-1000", title: "How to Invest Your First $1,000" }],
    howTo: [
      { name: "Set your monthly contribution", text: "Use the slider to set how much you plan to add each month, from $0 to $300." },
      { name: "Set your time horizon", text: "Use the slider to choose how many years you plan to stay invested, from 10 to 40 years." },
      { name: "Read the projection", text: "Compare the three lines: cash left uninvested, a one-time $1,000 investment, and $1,000 plus your monthly contribution." },
      { name: "Hover or drag for detail", text: "Hover over the chart (or drag on mobile) to see the exact projected value at any year." },
    ],
    faq: [
      { q: "What rate of return does this calculator assume?", a: "A 7.5% average annual return, compounded monthly. This approximates the long-run historical average of a broad U.S. stock index fund like an S&P 500 tracker, after accounting for some inflation drag. Actual returns vary significantly year to year." },
      { q: "Does this account for inflation or taxes?", a: "No — this is a simplified illustration of compounding math, not a financial projection. It doesn't account for taxes, fees, inflation, or the sequence of real market returns, which are never a smooth straight line." },
      { q: "Why does the monthly contribution make such a big difference?", a: "Each new contribution gets its own compounding runway. A dollar added in year one compounds for the full period, while a dollar added in year 20 has much less time to grow — so starting early and contributing consistently both matter more than the exact dollar amount." },
    ],
  },
  {
    slug: "roth-vs-traditional-ira",
    title: "Roth vs Traditional IRA Calculator",
    shortDescription: "Find out which account likely saves you more, based on your tax situation.",
    intro:
      "Set your current tax rate, your expected tax rate in retirement, and your time horizon. The calculator compares the spendable retirement value of a $7,500 contribution to a Roth IRA versus a Traditional IRA.",
    category: "Investing",
    relatedPosts: [{ slug: "roth-ira-vs-traditional-ira", title: "Roth IRA vs Traditional IRA: Which One Actually Saves You More?" }],
    howTo: [
      { name: "Set your current tax rate", text: "Use the slider to set your marginal tax rate today." },
      { name: "Set your retirement tax rate", text: "Use the slider to set your best estimate of your tax rate when you'll withdraw the money." },
      { name: "Choose a time horizon", text: "Pick 15, 25, or 35 years until retirement." },
      { name: "Compare the result", text: "The calculator shows which account leaves you with more spendable money, and by how much." },
    ],
    faq: [
      { q: "Which is better, a Roth or Traditional IRA?", a: "It depends entirely on whether your tax rate today is higher or lower than your tax rate will be in retirement. If your rate today is lower, a Roth usually wins. If it's higher today, a Traditional IRA usually wins. If they're about equal, the two accounts are mathematically identical." },
      { q: "What contribution amount does this calculator assume?", a: "A single $7,500 contribution (the 2026 IRA contribution limit), growing at a 7% average annual return until your chosen retirement horizon." },
      { q: "Can I contribute to both a Roth and Traditional IRA?", a: "Yes — you can split contributions between both in the same tax year, as long as the combined total doesn't exceed the annual limit. This is a common hedge when you're unsure which way your future tax rate will move." },
    ],
  },
  {
    slug: "side-hustle-tax-estimator",
    title: "Side Hustle Tax Estimator",
    shortDescription: "Estimate how much to set aside for self-employment and income tax on side income.",
    intro:
      "Enter your average monthly side-hustle profit and your rough income tax bracket. The estimator shows how much to set aside each quarter for self-employment tax and income tax, so you're not caught off guard at tax time.",
    category: "Side Hustles",
    relatedPosts: [{ slug: "how-to-start-a-side-hustle", title: "How to Start a Side Hustle" }],
    howTo: [
      { name: "Enter your monthly profit", text: "Use the slider to set your average monthly side-hustle profit, after expenses." },
      { name: "Pick your tax bracket", text: "Choose the income tax bracket closest to your situation." },
      { name: "Read your quarterly set-aside", text: "The estimator shows how much to set aside per quarter and what percentage of profit that represents." },
    ],
    faq: [
      { q: "What is self-employment tax?", a: "Self-employment tax is the 15.3% combination of Social Security (12.4%, capped at the annual wage base) and Medicare (2.9%, uncapped) taxes that self-employed people pay directly, since there's no employer to split the cost with." },
      { q: "Is this estimate exact?", a: "No — it's a simplified estimate that ignores deductions, the QBI deduction, and the Social Security wage base cap. A real tax return will differ. Use it as a starting point for how much to set aside, not a final number." },
      { q: "How often do I need to pay estimated taxes?", a: "The IRS generally expects self-employed people to pay estimated taxes quarterly (April, June, September, and January) if they expect to owe $1,000 or more for the year." },
    ],
  },
  {
    slug: "budget-calculator",
    title: "50/30/20 Budget Calculator",
    shortDescription: "Split your monthly income into needs, wants, and savings — and see it in dollars.",
    intro:
      "Enter your monthly take-home income and adjust the wants and savings sliders to see how much goes to needs, wants, and savings each month, and how that compares to the classic 50/30/20 rule.",
    category: "Personal Finance",
    relatedPosts: [{ slug: "budgeting-50-30-20-rule", title: "The 50/30/20 Budget Rule: How to Budget Your Money Like a Pro" }],
    howTo: [
      { name: "Enter your monthly income", text: "Use the slider to set your monthly take-home (after-tax) income." },
      { name: "Set your wants percentage", text: "Adjust how much of your income goes to discretionary wants like dining out and entertainment." },
      { name: "Set your savings percentage", text: "Adjust how much goes to savings and extra debt payoff." },
      { name: "Read the breakdown", text: "Needs is whatever remains after wants and savings. Compare your split to the classic 50/30/20 rule." },
    ],
    faq: [
      { q: "What is the 50/30/20 rule?", a: "A budgeting framework popularized by Senator Elizabeth Warren: 50% of after-tax income goes to needs, 30% to wants, and 20% to savings and debt payoff." },
      { q: "What counts as a need vs a want?", a: "Needs are expenses required for a basic standard of living — rent, utilities, groceries, minimum debt payments. Wants are discretionary — dining out, streaming services, travel." },
      { q: "What if my needs are more than 50% of my income?", a: "This is common in high cost-of-living areas. Try reducing the wants percentage in the calculator to see how much that would need to shrink to keep your savings rate intact." },
    ],
  },
  {
    slug: "trump-account-vs-529",
    title: "Trump Account vs 529 Calculator",
    shortDescription: "Compare what's actually spendable for college: a Trump Account after tax, or a 529 plan.",
    intro:
      "Set your annual contribution, years until your kid needs the money, and the tax bracket it'll be withdrawn at. The calculator compares the spendable-for-college value of a Trump Account (basis tax-free, seed and growth taxed as ordinary income) against a 529 plan (100% tax-free for qualified education expenses).",
    category: "Personal Finance",
    relatedPosts: [{ slug: "trump-account-vs-529", title: "Trump Account vs 529 Plan: Grab the Free $1,000, But Don't Fall for the Tax Trap" }],
    howTo: [
      { name: "Set your annual contribution", text: "Use the slider to set how much you plan to contribute each year, from $0 to $5,000." },
      { name: "Set your time horizon", text: "Use the slider to choose how many years until your kid needs the money, up to 18." },
      { name: "Set the withdrawal tax bracket", text: "Use the slider to set the ordinary income tax bracket that will apply when the money is withdrawn." },
      { name: "Compare the result", text: "The calculator shows which account leaves more spendable money for college, and by how much, even after the Trump Account's free $1,000 seed." },
    ],
    faq: [
      { q: "Why does the 529 usually win even though the Trump Account has a free $1,000?", a: "Because a 529's qualified education withdrawals are 100% tax-free, while a Trump Account only shelters your own after-tax contributions (the basis) — the $1,000 seed and every dollar of investment growth are taxed as ordinary income when withdrawn, which usually outweighs the free seed over any meaningful time horizon." },
      { q: "What growth rate does this calculator assume?", a: "A 7% average annual return on both accounts, so the comparison isolates the effect of taxes rather than investment performance." },
      { q: "Does this calculator account for employer contributions or charitable deposits?", a: "No — it models your own annual contribution plus the $1,000 government seed, kept simple so you can see the tax-treatment gap clearly. Employer and charitable deposits would add more to the Trump Account side, but they're also taxed as ordinary income on withdrawal, same as the seed." },
    ],
  },
];

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return tools.find((t) => t.slug === slug);
}

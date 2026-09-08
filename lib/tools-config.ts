import type { FaqItem } from "@/components/mdx/FaqAccordion";

export interface HowToStep {
  name: string;
  text: string;
}

/**
 * Long-form prose rendered under each calculator: what the math actually does,
 * which simplifications it makes, and where the answer flips. Every figure
 * quoted in here is computed from the calculator's own constants at its
 * default slider positions — if you change a rate or a default in
 * components/custom/, re-check the numbers cited in the matching explainer.
 */
export interface ExplainerSection {
  heading: string;
  paragraphs: string[];
}

export interface ToolConfig {
  slug: string;
  title: string;
  shortDescription: string;
  intro: string;
  category: string;
  relatedPosts: { slug: string; title: string }[];
  howTo: HowToStep[];
  explainer: ExplainerSection[];
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
    explainer: [
      {
        heading: "What the three lines actually do",
        paragraphs: [
          "The grey dashed line is $1,000 sitting still, earning nothing. The green line is that same $1,000 invested once and left alone, compounded monthly at 7.5% a year. The gold line adds your monthly contribution as an ordinary annuity, so each deposit lands at the end of its month and compounds from there — the most recent one has done almost nothing, and the first one has done all the work.",
          "That split is the point of the chart. At $100 a month over 30 years the gold line ends near $144,000, but only $37,000 of that is money you actually handed over. The other $107,000 is growth. Run the same numbers at 10 years and it inverts: about $19,900 in total on $13,000 deposited. Growth does not overtake your own deposits until roughly year 17. Everything before that is mostly you. Everything after is mostly time.",
        ],
      },
      {
        heading: "What the chart quietly ignores",
        paragraphs: [
          "Three things, and all of them make the real number smaller. Inflation: at 3% a year, a dollar 30 years out buys about 41 cents of what it buys today, so that $144,000 is closer to $59,000 in today's money. Fees: the chart runs at a clean 7.5%, and a fund charging 0.60% leaves you 6.9% — which sounds like a rounding error and costs about $16,700 over the same 30 years. Taxes: in a Roth IRA the chart is roughly honest, but in a taxable brokerage account dividends and eventual capital gains take a cut it never shows.",
          "The one place the chart is unfair in the other direction is that flat grey line. Cash does not earn zero. At 4% in a savings account, $1,000 becomes about $3,243 over 30 years. The penalty for staying in cash is real, but the honest gap is to $3,243, not to $1,000.",
        ],
      },
      {
        heading: "The straight line is the lie",
        paragraphs: [
          "A 7.5% average is not 7.5% every year, and the smooth curve is the most misleading thing on this page. Real returns arrive out of order — a flat decade, then a violent recovery, then a crash you did not plan for.",
          "While you are still contributing, a bad early stretch is actually a gift: your monthly deposits buy more shares cheaply and the eventual recovery lifts all of them. That is the opposite of the sequence risk that hurts retirees drawing money down, which is why the same average return can produce very different outcomes depending on which decade you are in. Use this chart for the shape of compounding and the size of the contribution effect. Do not use it as a forecast.",
        ],
      },
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
    relatedPosts: [
      { slug: "roth-ira-vs-traditional-ira", title: "Roth IRA vs Traditional IRA: Which One Actually Saves You More?" },
      // The explainer raises IRMAA as the cost the bracket slider can't show;
      // this is where a reader goes to actually understand that.
      { slug: "roth-conversion-irmaa-2026", title: "Roth Conversions and the IRMAA Cliff (2026)" },
    ],
    howTo: [
      { name: "Set your current tax rate", text: "Use the slider to set your marginal tax rate today." },
      { name: "Set your retirement tax rate", text: "Use the slider to set your best estimate of your tax rate when you'll withdraw the money." },
      { name: "Choose a time horizon", text: "Pick 15, 25, or 35 years until retirement." },
      { name: "Compare the result", text: "The calculator shows which account leaves you with more spendable money, and by how much." },
    ],
    explainer: [
      {
        heading: "Why the two bars are so often the same length",
        paragraphs: [
          "The Roth side is $7,500, minus your tax rate today, grown at 7%. The Traditional side is $7,500, grown at 7%, minus your tax rate in retirement. Same three numbers, different order — and multiplication does not care about order. When your rate today equals your rate in retirement, the two accounts produce identical spendable dollars. Not similar. Identical, to the cent.",
          "That is the entire decision. Every real argument between Roth and Traditional is an argument about which of those two rates is higher. At the defaults — 22% today, 15% in retirement, 25 years — Traditional wins, leaving about $34,600 against the Roth's $31,750. Drag the retirement rate up past 22% and the bars swap.",
        ],
      },
      {
        heading: "The comparison being made",
        paragraphs: [
          "Both sides start from $7,500 of pre-tax money, which is the only fair way to run this. A $7,500 Traditional contribution costs you $7,500 of gross pay. Putting the same $7,500 of gross pay into a Roth means paying tax on it first, so the calculator deducts your current rate up front and grows what is left.",
          "If you instead compared $7,500 landing inside each account after tax, the Roth would look artificially better — you would quietly be contributing more total money to it. That is the most common way this comparison gets rigged, usually by accident.",
        ],
      },
      {
        heading: "What it leaves out, which matters more than the math",
        paragraphs: [
          "The calculator stops at one contribution and two tax rates. The real decision turns on things it does not model. Required minimum distributions: Traditional balances eventually force taxable withdrawals whether you need the money or not, and Roth IRAs do not. Medicare surcharges: those forced withdrawals raise your income, and income above the IRMAA thresholds raises your Part B and Part D premiums — an effective tax the bracket slider never sees. State income tax: retiring from a high-tax state to a no-tax one is a large, genuine argument for Traditional that lives entirely outside this model.",
          "Then there is the part no calculator solves. You are being asked to predict your marginal rate decades out, under tax law that has not been written yet. If the two rates you would enter are honestly a coin flip, that is itself a useful answer: split your contributions between both. The math says you cannot lose much either way, and you hedge the one variable nobody can forecast.",
        ],
      },
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
    explainer: [
      {
        heading: "How the number is built",
        paragraphs: [
          "Two separate taxes, stacked. Self-employment tax comes first: your annual profit is multiplied by 0.9235 — the IRS only taxes 92.35% of net earnings, which approximates the employer half you would otherwise get to deduct — and then by 15.3%, being 12.4% Social Security plus 2.9% Medicare. On $18,000 of annual profit that is about $2,543. Income tax comes second: annual profit times the bracket you picked, or $3,960 at 22%.",
          "Together that is $6,503 a year, or $1,626 a quarter — about 36% of profit. That 36% is the number that catches people out. Side income is not taxed like a paycheck. It is taxed like a paycheck plus the employer's half of payroll tax, which you are now paying yourself.",
        ],
      },
      {
        heading: "Where the estimate is deliberately conservative",
        paragraphs: [
          "It applies your marginal bracket to every dollar of profit and takes no deductions, so it reserves slightly too much on purpose. The biggest omission is the deduction for one-half of self-employment tax, which reduces the income your bracket applies to. Folding that in drops the default estimate from $6,503 to roughly $6,224 — about $280 of over-reserving a year. It also ignores the QBI deduction, ordinary business expenses, and the Social Security wage base cap, all of which push the real bill down further.",
          "Over-reserving is the right direction for a tool like this. A quarter where you set aside too much is an inconvenience. A quarter where you set aside too little is a penalty.",
        ],
      },
      {
        heading: "Where it can under-reserve instead",
        paragraphs: [
          "State income tax is not in here at all. Depending on where you live that is another 3% to 10% on top, and a few cities add their own on top of that. If your state taxes income, add it to the bracket you pick rather than trusting the headline percentage.",
          "The marginal-rate assumption also cuts both ways. Applying 22% to every dollar is roughly right when side income stacks on top of a W-2 salary that has already filled the lower brackets, which is the common case. If the side hustle is your only income, the real bill is lower, because your first dollars are taxed at 10% and 12%. If the side income is big enough to push you into the next bracket partway through the year, it is higher.",
          "Treat the quarterly figure as a set-aside target, not a filing. The IRS generally expects estimated payments in April, June, September, and January once you expect to owe $1,000 or more for the year.",
        ],
      },
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
    explainer: [
      {
        heading: "Needs is the number you do not set",
        paragraphs: [
          "You move two sliders — wants and savings — and needs is whatever is left over: 100 minus the other two. That is backwards from how a month actually works, and noticing it is the most useful thing this calculator can do for you.",
          "In real life rent is fixed, the car payment is fixed, and groceries have a floor. Needs is the input, not the remainder. So use this in reverse: work out what your needs genuinely cost as a share of take-home, set that first, and see what is actually left to divide. If your needs land at 65%, the calculator will cheerfully show you a 20% savings rate — it just quietly requires wants to fall to 15%, and it will not tell you whether that is a life you would tolerate for a decade.",
        ],
      },
      {
        heading: "What income means here",
        paragraphs: [
          "Take-home, after tax. That distinction moves the answer more than the percentages do. A $75,000 salary is not $6,250 a month to budget with. It is whatever reaches your account after federal and state tax, payroll tax, health premiums, and retirement contributions.",
          "Which raises a question the rule never answers cleanly: does a 401(k) deferral count toward the 20%? If it comes out before you ever see it, your take-home is already net of it, and a strict reading says you need another 20% on top of that. Most people count it, which is defensible. Just be consistent, because it is the difference between claiming a 20% savings rate and actually having a 6% one.",
        ],
      },
      {
        heading: "Where 50/30/20 stops being useful",
        paragraphs: [
          "It was built as a sanity check, not a prescription, and it breaks in fairly predictable places. In high cost-of-living areas, when rent alone is 40% of take-home, the framework's only answer is to cut wants to nearly nothing, which is not a plan. With volatile income, freelancers and hourly workers do not have a stable denominator, and percentages of a number that swings 40% month to month do not mean much — budget against your worst recent month instead.",
          "The sharpest failure is high-interest debt. The rule lumps savings and debt payoff into a single 20% bucket, as if they were interchangeable. They are not. A credit card at 24% deserves everything you can throw at it, even at the cost of the wants line, because paying it down is a guaranteed 24% return and nothing in the savings column is going to match that.",
        ],
      },
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
    explainer: [
      {
        heading: "Where the gap comes from",
        paragraphs: [
          "Both accounts get the same annual contribution growing at the same 7%. The only difference the calculator models is what the tax code does on the way out.",
          "A 529's qualified education withdrawals are entirely tax-free, contributions and growth alike. A Trump Account only shelters your basis — the dollars you personally put in. The $1,000 government seed and every dollar of investment growth come out as ordinary income at whatever bracket applies. At the defaults of $2,000 a year for 18 years withdrawn at 22%, the 529 leaves about $67,998 spendable against the Trump Account's $63,595. The free $1,000 is real. Eighteen years of taxable growth simply costs more than it is worth.",
        ],
      },
      {
        heading: "When the Trump Account actually wins",
        paragraphs: [
          "Two cases, and you can find both with the sliders. The first is a low withdrawal bracket: the accounts cross over at around 10%. Below that, the seed's head start outruns the tax drag, and at a 0% bracket the Trump Account wins by exactly the future value of the seed, about $3,380 over 18 years.",
          "The second is a short horizon. Run five years instead of eighteen and the Trump Account comes out ahead by roughly $764, because there has not been enough growth yet for ordinary-income treatment to hurt. The advantage does not flip to the 529 until around year 10. If you are starting when your kid is thirteen rather than newborn, the conclusion genuinely changes — which is the opposite of the advice most write-ups give.",
        ],
      },
      {
        heading: "What is not modeled",
        paragraphs: [
          "Three things, and they do not all point the same way. State tax deductions: many states offer a deduction or credit for 529 contributions, and where they exist they are worth real money up front, widening the 529's lead beyond what you see here.",
          "Flexibility: a 529 is only tax-free for qualified education expenses, and non-qualified withdrawals get taxed with a 10% penalty on the earnings. A Trump Account carries no such restriction. If there is a genuine chance the money gets spent on something other than school, the 529's advantage above is conditional on a future you cannot promise.",
          "Outside contributions: employer and charitable deposits into a Trump Account are ignored here. They would add to that side of the bar, but they land in the taxable bucket alongside the seed, so they change the size of the gap without changing the shape of the argument.",
        ],
      },
    ],
    faq: [
      { q: "Why does the 529 usually win even though the Trump Account has a free $1,000?", a: "Because a 529's qualified education withdrawals are 100% tax-free, while a Trump Account only shelters your own after-tax contributions (the basis) — the $1,000 seed and every dollar of investment growth are taxed as ordinary income when withdrawn, which usually outweighs the free seed over any meaningful time horizon." },
      { q: "What growth rate does this calculator assume?", a: "A 7% average annual return on both accounts, so the comparison isolates the effect of taxes rather than investment performance." },
      { q: "Does this calculator account for employer contributions or charitable deposits?", a: "No — it models your own annual contribution plus the $1,000 government seed, kept simple so you can see the tax-treatment gap clearly. Employer and charitable deposits would add more to the Trump Account side, but they're also taxed as ordinary income on withdrawal, same as the seed." },
    ],
  },
  {
    slug: "bitcoin-drawdown-calculator",
    title: "Bitcoin DCA vs Lump Sum Calculator",
    shortDescription: "See what dollar-cost averaging into the 2025-26 Bitcoin crash would actually be worth today.",
    intro:
      "Pick when you would have started buying — at the October 2025 peak, after the first crash, or near the low — and a monthly dollar amount. The calculator compares dollar-cost averaging, an all-at-once lump sum, and waiting in cash and buying today, using approximate monthly BTC prices through July 2026.",
    category: "Crypto",
    relatedPosts: [{ slug: "bitcoin-crash-2026-buy-or-wait", title: "Bitcoin at $65K: Down 50% From Its Peak — Falling Knife or the Buy of the Cycle?" }],
    howTo: [
      { name: "Pick a start point", text: "Choose whether you started buying at the October 2025 peak, after the first crash, or near the 2026 low." },
      { name: "Set your monthly amount", text: "Use the slider to set how much you'd invest each month, from $50 to $1,000." },
      { name: "Compare the three strategies", text: "See dollar-cost averaging, an all-at-once lump sum, and waiting in cash side by side, in dollars and percentage gain or loss." },
    ],
    explainer: [
      {
        heading: "What the three bars mean",
        paragraphs: [
          "All three spend exactly the same money. Starting at the October 2025 peak at $200 a month, that is $2,000 across ten months. Dollar-cost averaging buys $200 of Bitcoin at each monthly price, ending with an average cost near $70,910 a coin and about $1,833 today, down 8%. Lump sum puts the whole $2,000 in at the starting price, and at the peak's $126,198 that is about $1,030, down 49%. Waiting in cash holds the money and buys today, showing $2,000 and 0%.",
          "That third bar is a definition, not a result. Cash converted at today's price is worth precisely what you put in, so it reads 0% no matter which settings you choose. It is a reference line — and it is the line that beats dollar-cost averaging whenever the window ends below where it started.",
        ],
      },
      {
        heading: "The window is doing most of the work",
        paragraphs: [
          "This is a ten-month stretch that begins at a cycle top and ends 49% below it. Dollar-cost averaging wins here because it was built to win here: it keeps buying as the price falls, dragging the average cost down. The mechanism is real.",
          "It is not a general result. Pick a window that ends higher than it starts and the lump sum wins, for the plain reason that more money spent more time invested. Most historical windows, in most assets, look like that. The honest claim is narrow — in a long, choppy drawdown, dollar-cost averaging loses less. Not that it is better.",
          "You can watch the effect shrink inside the tool. Start at the peak and dollar-cost averaging beats the lump sum by about 41 percentage points. Start near the February low and that gap collapses to roughly 7 points. Same strategy, far less of the fall left to average into.",
        ],
      },
      {
        heading: "What is approximate",
        paragraphs: [
          "The prices are rounded monthly reference points running from a $126,198 peak to $64,975 in July 2026, not daily closes, so read the outputs as shape rather than precision. Fees and taxes are ignored entirely.",
          "So is the fact that cash actually earns interest. At 4% APY, the waited-in-cash bar would land closer to $2,036 than $2,000 — a small edge, but it means waiting is very slightly better than the flat 0% implies, and the tool understates it. One historical stretch of one unusually volatile asset is intuition, not evidence.",
        ],
      },
    ],
    faq: [
      { q: "What price data does this calculator use?", a: "Approximate monthly Bitcoin reference prices from the October 2025 cycle peak (~$126,198) through July 15, 2026 (~$64,975), rounded to illustrate the shape of the crash rather than exact daily closes." },
      { q: "Does dollar-cost averaging always beat a lump sum?", a: "No. In a rising market, investing a lump sum immediately tends to outperform DCA, since more money spends more time invested. DCA tends to win specifically in choppy, drawn-out drawdowns like this one, because it keeps buying at lower prices as the market falls instead of locking in one entry point." },
      { q: "Is this financial advice?", a: "No — it's a simplified, illustrative tool using one historical stretch of one asset. It ignores fees, taxes, and the fact that past price action never repeats exactly. Use it to build intuition about how DCA behaves in a drawdown, not to predict returns." },
    ],
  },
];

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return tools.find((t) => t.slug === slug);
}

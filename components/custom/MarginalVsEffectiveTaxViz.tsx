'use client'

// 2026 bracket thresholds and standard deductions follow Rev. Proc. 2025-32
// (Oct 9, 2025) to the nearest published figure. The IRS has not released
// 2027 brackets as of this writing (expected ~October 2026) — the "2027
// projected" toggle applies the same ~2.7% adjustment seen from 2025→2026 as
// an illustrative estimate only, clearly labeled, not an official number.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import BarChart from '@/components/charts/BarChartLazy'

type Filing = 'single' | 'mfj' | 'hoh'

const STD_DEDUCTION_2026: Record<Filing, number> = { single: 16100, mfj: 32200, hoh: 24150 }

// [rate %, income where this bracket starts]
const BRACKETS_2026: Record<Filing, [number, number][]> = {
  single: [[10, 0], [12, 12400], [22, 50400], [24, 105700], [32, 201775], [35, 256225], [37, 640600]],
  mfj: [[10, 0], [12, 24800], [22, 100800], [24, 211400], [32, 403550], [35, 512450], [37, 768700]],
  hoh: [[10, 0], [12, 17700], [22, 67450], [24, 105700], [32, 201750], [35, 256200], [37, 640600]],
}

const PROJECTION_FACTOR = 1.027 // illustrative ~2.7% adjustment, matching the 2025→2026 move

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function buildBrackets(filing: Filing, year: 2026 | 2027) {
  const base = BRACKETS_2026[filing]
  const stdDeduction = STD_DEDUCTION_2026[filing] * (year === 2027 ? PROJECTION_FACTOR : 1)
  const brackets = base.map(([rate, threshold]) => [rate, threshold * (year === 2027 ? PROJECTION_FACTOR : 1)] as [number, number])
  return { brackets, stdDeduction }
}

function computeTax(taxableIncome: number, brackets: [number, number][]) {
  const perBracket: { rate: number; amount: number }[] = []
  let tax = 0
  let marginalRate = brackets[0][0]
  for (let i = 0; i < brackets.length; i++) {
    const [rate, start] = brackets[i]
    const end = i + 1 < brackets.length ? brackets[i + 1][1] : Infinity
    if (taxableIncome > start) {
      const amountInBracket = Math.min(taxableIncome, end) - start
      tax += amountInBracket * (rate / 100)
      perBracket.push({ rate, amount: amountInBracket })
      marginalRate = rate
    }
  }
  return { tax, perBracket, marginalRate }
}

export default function MarginalVsEffectiveTaxViz() {
  const [income, setIncome] = useState(80000)
  const [filing, setFiling] = useState<Filing>('single')
  const [year, setYear] = useState<2026 | 2027>(2026)

  const result = useMemo(() => {
    const { brackets, stdDeduction } = buildBrackets(filing, year)
    const taxableIncome = Math.max(0, income - stdDeduction)
    const { tax, perBracket, marginalRate } = computeTax(taxableIncome, brackets)
    const effectiveRate = income > 0 ? (tax / income) * 100 : 0
    return { tax, perBracket, marginalRate, effectiveRate, stdDeduction, taxableIncome }
  }, [income, filing, year])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · marginal vs. effective rate
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Your bracket isn&apos;t your tax rate
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-4">
        <div className="sm:col-span-2">
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Taxable income (gross)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(income)}</b>
          </div>
          <input type="range" min={20000} max={500000} step={1000} value={income} onChange={(e) => setIncome(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Filing status</p>
          <div className="inline-flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {(['single', 'mfj', 'hoh'] as Filing[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiling(f)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${filing === f ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {f === 'mfj' ? 'Married filing jointly' : f === 'hoh' ? 'Head of household' : 'Single'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Tax year</p>
          <div className="inline-flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {([2026, 2027] as const).map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${year === y ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {y} {y === 2027 ? '(projected)' : '(official)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {year === 2027 && (
        <div className="mb-4 rounded-lg border-l-4 border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">Projected — not official IRS figures</p>
          <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">The IRS typically announces next year&apos;s brackets in October. This applies an illustrative ~2.7% adjustment to 2026&apos;s confirmed figures.</p>
        </div>
      )}

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Your top bracket is{' '}
          <strong className="text-gray-900 dark:text-white">
            <AnimatedNumber value={result.marginalRate} format={(v) => v.toFixed(0) + '%'} />
          </strong>
          , but after the standard deduction and lower brackets, your effective rate on total income works out to just{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={result.effectiveRate} format={(v) => v.toFixed(1) + '%'} />
          </strong>{' '}
          — total tax of{' '}
          <strong>
            <AnimatedNumber value={result.tax} format={(v) => money(v)} startFromZero />
          </strong>
          .
        </p>

        <BarChart
          title={`Dollars taxed per bracket — ${filing === 'mfj' ? 'married filing jointly' : filing === 'hoh' ? 'head of household' : 'single'}, ${year}`}
          description={`Standard deduction applied: ${money(result.stdDeduction)}. Taxable income after deduction: ${money(result.taxableIncome)}.`}
          data={result.perBracket.map((b) => ({ bracket: `${b.rate}%`, Taxed: Math.round(b.amount) }))}
          xKey="bracket"
          series={[{ key: 'Taxed', label: 'Income taxed in this bracket ($)', color: '#6366f1' }]}
          unit="$"
        />

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
          Federal income tax only — ignores payroll tax, state tax, credits, and the NIIT. Bracket thresholds are approximate to the nearest published figure; confirm exact cutoffs at irs.gov before filing. Not tax advice.
        </p>
      </div>
    </div>
  )
}

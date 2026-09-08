'use client'

// A deliberately simplified ROI model — NOT the NY Fed's actual methodology
// (Abel & Deitz, Liberty Street Economics, April 16, 2025), which uses lifetime
// earnings profiles across many majors and schools. This tool treats total
// 4-year cost + 4 years of forgone HS-only wages as the "investment," and the
// annual wage premium (grown at a flat assumed rate) as the "return," solving
// for a simple annualized rate. It's meant to build intuition about the shape
// of the trade-off, not to reproduce a peer-reviewed estimate.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const WAGE_GROWTH: number = 0.03 // flat assumed annual growth applied to both salary paths

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function CollegeRoiEstimator() {
  const [totalCost, setTotalCost] = useState(100000)
  const [startingSalary, setStartingSalary] = useState(58000)
  const [hsSalary, setHsSalary] = useState(38000)
  const [years, setYears] = useState(15)

  const { totalInvestment, cumulativeGap, breakevenYear, annualizedRoi } = useMemo(() => {
    const opportunityCost = hsSalary * 4
    const totalInvestment = totalCost + opportunityCost
    const premiumYear1 = Math.max(0, startingSalary - hsSalary)

    // Growing-annuity cumulative sum: premium * ((1+g)^y - 1) / g
    const cumulativeAt = (y: number) =>
      WAGE_GROWTH === 0 ? premiumYear1 * y : premiumYear1 * ((Math.pow(1 + WAGE_GROWTH, y) - 1) / WAGE_GROWTH)

    const cumulativeGap = cumulativeAt(years)

    let breakevenYear: number | null = null
    for (let y = 1; y <= years; y++) {
      if (cumulativeAt(y) >= totalInvestment) {
        breakevenYear = y
        break
      }
    }

    const finalValue = totalInvestment + cumulativeGap
    const annualizedRoi =
      totalInvestment > 0 && years > 0 ? (Math.pow(finalValue / totalInvestment, 1 / years) - 1) * 100 : 0

    return { totalInvestment, cumulativeGap, breakevenYear, annualizedRoi }
  }, [totalCost, startingSalary, hsSalary, years])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · run your own numbers
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Is your college math worth it?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Total 4-year cost (tuition + living)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(totalCost)}</b>
          </div>
          <input type="range" min={20000} max={250000} step={5000} value={totalCost} onChange={e => setTotalCost(+e.target.value)} className="w-full accent-indigo-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Expected starting salary (with degree)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(startingSalary)}</b>
          </div>
          <input type="range" min={25000} max={150000} step={1000} value={startingSalary} onChange={e => setStartingSalary(+e.target.value)} className="w-full accent-indigo-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Comparable salary, high-school-only path</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(hsSalary)}</b>
          </div>
          <input type="range" min={20000} max={80000} step={1000} value={hsSalary} onChange={e => setHsSalary(+e.target.value)} className="w-full accent-indigo-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Years to project after graduation</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{years}</b>
          </div>
          <input type="range" min={5} max={25} step={1} value={years} onChange={e => setYears(+e.target.value)} className="w-full accent-indigo-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Over {years} years, this scenario implies about{' '}
          <strong className="text-indigo-600 dark:text-indigo-400">{annualizedRoi.toFixed(1)}% annualized return</strong>, breaking even{' '}
          {breakevenYear ? <>around <strong>year {breakevenYear}</strong> after graduation</> : <>after more than {years} years (not within your selected horizon)</>}.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Annualized ROI</p>
            <AnimatedNumber value={annualizedRoi} format={v => `${v.toFixed(1)}%`} startFromZero className="font-serif text-2xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Breakeven year</p>
            <p className="font-serif text-2xl font-bold text-gray-900 dark:text-white">{breakevenYear ?? `${years}+`}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Total &quot;invested&quot;</p>
            <AnimatedNumber value={totalInvestment} format={money} startFromZero className="font-serif text-2xl font-bold text-gray-900 dark:text-white" />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Simplified model, not the NY Fed&apos;s published methodology — assumes both salary paths grow {Math.round(WAGE_GROWTH * 100)}%/year, ignores loan interest, taxes, and investment returns on forgone tuition. Estimate only — not financial advice.
        </p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">College ROI estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Total 4-year cost</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(totalCost)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Forgone HS-path wages (4 yrs)</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(hsSalary * 4)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Total &quot;invested&quot;</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(totalInvestment)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Cumulative earnings gap ({years} yrs)</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(cumulativeGap)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Breakeven year</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{breakevenYear ?? `> ${years}`}</td></tr>
              <tr><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Annualized ROI</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{annualizedRoi.toFixed(1)}%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

'use client'

// Defaults: median home price $440,600 and 30-yr fixed 6.55% are NAR/Freddie
// Mac's July 2026 figures. Property tax (1.1%), insurance ($150/mo), closing
// costs (3%), and home appreciation (1.8%/yr) are reasonable illustrative
// assumptions, not a quote — actual costs vary heavily by location.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const PROPERTY_TAX_PCT = 1.1
const HOME_INSURANCE_MONTHLY = 150
const CLOSING_COST_PCT = 3
const HOME_APPRECIATION_PCT = 1.8
const SELLING_COST_PCT = 6

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export default function RentVsBuyCalculator() {
  const [homePrice, setHomePrice] = useState(440600)
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [mortgageRate, setMortgageRate] = useState(6.55)
  const [monthlyRent, setMonthlyRent] = useState(2000)
  const [yearsStaying, setYearsStaying] = useState(7)

  const result = useMemo(() => {
    const downPayment = (homePrice * downPaymentPct) / 100
    const loanAmount = homePrice - downPayment
    const payment = monthlyPayment(loanAmount, mortgageRate, 30)
    const monthlyOwnCost = payment + (homePrice * PROPERTY_TAX_PCT) / 100 / 12 + HOME_INSURANCE_MONTHLY
    const closingCosts = (homePrice * CLOSING_COST_PCT) / 100

    let breakevenYear: number | null = null
    let buyTotalAtHorizon = 0
    let rentTotalAtHorizon = 0

    for (let year = 1; year <= 30; year++) {
      const homeValue = homePrice * Math.pow(1 + HOME_APPRECIATION_PCT / 100, year)
      const sellingCosts = (homeValue * SELLING_COST_PCT) / 100
      const cumulativeOwnCash = downPayment + closingCosts + monthlyOwnCost * 12 * year
      const netBuyCost = cumulativeOwnCash - (homeValue - sellingCosts - loanAmount)

      let cumulativeRent = 0
      for (let m = 0; m < year * 12; m++) {
        cumulativeRent += monthlyRent * Math.pow(1.03, Math.floor(m / 12))
      }

      if (breakevenYear === null && netBuyCost < cumulativeRent) breakevenYear = year
      if (year === yearsStaying) {
        buyTotalAtHorizon = netBuyCost
        rentTotalAtHorizon = cumulativeRent
      }
    }

    return { payment, monthlyOwnCost, closingCosts, breakevenYear, buyTotalAtHorizon, rentTotalAtHorizon }
  }, [homePrice, downPaymentPct, mortgageRate, monthlyRent, yearsStaying])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · find your break-even year
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Buy vs. rent, at today&apos;s rate
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Home price</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(homePrice)}</b>
          </div>
          <input type="range" min={150000} max={1000000} step={5000} value={homePrice} onChange={e => setHomePrice(+e.target.value)} className="w-full accent-sky-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Down payment</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{downPaymentPct}%</b>
          </div>
          <input type="range" min={0} max={50} step={1} value={downPaymentPct} onChange={e => setDownPaymentPct(+e.target.value)} className="w-full accent-sky-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>30-year mortgage rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{mortgageRate.toFixed(2)}%</b>
          </div>
          <input type="range" min={4} max={9} step={0.05} value={mortgageRate} onChange={e => setMortgageRate(+e.target.value)} className="w-full accent-sky-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Comparable monthly rent</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(monthlyRent)}</b>
          </div>
          <input type="range" min={800} max={6000} step={50} value={monthlyRent} onChange={e => setMonthlyRent(+e.target.value)} className="w-full accent-amber-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Years you plan to stay</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{yearsStaying} yrs</b>
          </div>
          <input type="range" min={1} max={30} step={1} value={yearsStaying} onChange={e => setYearsStaying(+e.target.value)} className="w-full accent-amber-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Monthly principal, interest, tax &amp; insurance: about{' '}
          <strong className="text-sky-600 dark:text-sky-400">
            <AnimatedNumber value={result.monthlyOwnCost} format={v => money(v) + '/mo'} startFromZero />
          </strong>
          . Your break-even year — where buying beats renting — is about{' '}
          {result.breakevenYear ? (
            <strong className="text-emerald-600 dark:text-emerald-400">year {result.breakevenYear}</strong>
          ) : (
            <strong className="text-red-500 dark:text-red-400">beyond 30 years at these inputs</strong>
          )}
          {result.breakevenYear && yearsStaying < result.breakevenYear && (
            <> — since you&apos;re planning {yearsStaying} years, renting comes out ahead in this model.</>
          )}
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Net cost of buying over {yearsStaying} years</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(Math.max(0, result.buyTotalAtHorizon))}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-sky-600 dark:bg-sky-500 rounded-lg transition-all duration-500" style={{ width: `${Math.min(100, (Math.max(0, result.buyTotalAtHorizon) / (result.buyTotalAtHorizon + result.rentTotalAtHorizon || 1)) * 100)}%` }} />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Total cost of renting over {yearsStaying} years</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.rentTotalAtHorizon)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-amber-500 dark:bg-amber-400 rounded-lg transition-all duration-500" style={{ width: `${Math.min(100, (result.rentTotalAtHorizon / (result.buyTotalAtHorizon + result.rentTotalAtHorizon || 1)) * 100)}%` }} />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          Assumes {PROPERTY_TAX_PCT}% property tax, {money(HOME_INSURANCE_MONTHLY)}/mo insurance, {CLOSING_COST_PCT}% closing costs, {HOME_APPRECIATION_PCT}%/yr appreciation, {SELLING_COST_PCT}% selling costs, and 3%/yr rent growth — illustrative assumptions, not a quote. Not financial advice.
        </p>
      </div>
    </div>
  )
}

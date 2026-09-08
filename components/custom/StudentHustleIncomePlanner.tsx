'use client'

// Hourly/rate anchors, each independently sourced (see post Sources):
// - Tutoring: ~$35/hr, mid-range of the $25-80/hr typical 2026 market rate; Wyzant's
//   average tutor payout is ~$34.60/hr.
// - Freelance: $25/hr default — a conservative *beginner* rate. Upwork's platform-wide
//   average is $47.71/hr, but that blends all experience levels, not first-time sellers.
// - Delivery (DoorDash/Uber Eats): ~$19/hr gross, roughly the midpoint of DoorDash's
//   ~$18.93/hr and Uber Eats' ~$14-22/hr GPS-tracked gross range. Net (after gas,
//   vehicle wear, and taxes) runs meaningfully lower — flagged in the UI.
// - Reselling (Depop/Etsy): not a clean hourly rate. Modeled as a piecewise monthly
//   curve anchored to industry-reported ranges (casual ~$50-200/mo, consistent sellers
//   ~$500-3,000+/mo) rather than a rigorous government survey — flagged as a
//   lower-confidence, secondary-source estimate in the post itself.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

type HustleKey = 'tutoring' | 'freelance' | 'delivery' | 'reselling'

const HUSTLES: Record<HustleKey, { label: string; rate: number; note: string }> = {
  tutoring: { label: 'Tutoring', rate: 35, note: '~$35/hr typical (Wyzant avg. tutor pay ~$34.60/hr)' },
  freelance: { label: 'Freelance (writing/design/etc.)', rate: 25, note: 'Conservative beginner rate — Upwork platform avg. is $47.71/hr, all experience levels' },
  delivery: { label: 'Food delivery (DoorDash/Uber Eats)', rate: 19, note: 'Gross rate — net after gas/vehicle wear/taxes runs lower' },
  reselling: { label: 'Reselling (Depop/Etsy)', rate: 0, note: 'Not hourly — modeled as a monthly curve, see below' },
}

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function resellingMonthly(hours: number): number {
  if (hours <= 3) return 40 + hours * 12
  if (hours <= 8) return 76 + (hours - 3) * 60
  if (hours <= 15) return 376 + (hours - 8) * 140
  return Math.min(3000, 1356 + (hours - 15) * 90)
}

export default function StudentHustleIncomePlanner() {
  const [hours, setHours] = useState(10)
  const [hustle, setHustle] = useState<HustleKey>('tutoring')
  const [taxReserve, setTaxReserve] = useState(27)

  const { grossMonthly, netMonthly, seTax } = useMemo(() => {
    const grossMonthly =
      hustle === 'reselling' ? resellingMonthly(hours) : hours * 4.33 * HUSTLES[hustle].rate
    const seTax = grossMonthly * 0.153
    const netMonthly = grossMonthly * (1 - taxReserve / 100)
    return { grossMonthly, netMonthly, seTax }
  }, [hours, hustle, taxReserve])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · plan your own hustle
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What could your side hustle actually earn?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Hustle type</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(HUSTLES) as HustleKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setHustle(key)}
                className={`font-mono text-[11px] tracking-wide px-3 py-2 rounded-lg border transition-colors text-left ${
                  hustle === key
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {HUSTLES[key].label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{HUSTLES[hustle].note}</p>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Hours per week available</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{hours}</b>
          </div>
          <input type="range" min={1} max={30} step={1} value={hours} onChange={e => setHours(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Tax set-aside for self-employment income</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{taxReserve}%</b>
          </div>
          <input type="range" min={15} max={35} step={1} value={taxReserve} onChange={e => setTaxReserve(+e.target.value)} className="w-full accent-emerald-600" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Covers the 15.3% self-employment tax plus a cushion for income tax — adjust to your bracket.</p>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At {hours} hrs/week {hustle !== 'reselling' ? `and ${money(HUSTLES[hustle].rate)}/hr` : 'of reselling'}, that&apos;s roughly{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">{money(grossMonthly)}/month gross</strong>, about{' '}
          <strong>{money(netMonthly)}/month</strong> after a {taxReserve}% tax set-aside.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Gross monthly</p>
            <AnimatedNumber value={grossMonthly} format={money} startFromZero className="font-serif text-2xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Est. SE tax (15.3%)</p>
            <AnimatedNumber value={seTax} format={money} startFromZero className="font-serif text-2xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">After tax set-aside</p>
            <AnimatedNumber value={netMonthly} format={money} startFromZero className="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-400" />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          {hustle === 'reselling'
            ? 'Reselling income is modeled from industry-reported ranges, not a rigorous government survey — treat as a rougher estimate than the other three hustle types.'
            : 'Estimate only — not financial or tax advice.'}
        </p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Student side hustle income estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Hustle type</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{HUSTLES[hustle].label}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Hours/week</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{hours}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Gross monthly</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(grossMonthly)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Est. self-employment tax</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(seTax)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Tax set-aside applied</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{taxReserve}%</td></tr>
              <tr><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Net after set-aside</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(netMonthly)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

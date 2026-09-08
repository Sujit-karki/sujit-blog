'use client'

// Caps and MAGI phase-out thresholds are from IRS Schedule 1-A guidance for
// the "no tax on tips" / "no tax on overtime" OBBBA deductions: $25,000 tips
// cap (not doubled for joint filers), $12,500/$25,000 (single/joint) overtime
// cap, phase-out starting at $150,000/$300,000 MAGI. The phase-out RATE below
// (deduction reduced $100 per $1,000 of MAGI over the threshold) mirrors the
// mechanism commonly described for this OBBBA deduction family — verify the
// exact rate against the current Schedule 1-A instructions before relying on
// this for a real return.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const TIPS_CAP = 25000
const OVERTIME_CAP_SINGLE = 12500
const OVERTIME_CAP_JOINT = 25000
const PHASEOUT_THRESHOLD_SINGLE = 150000
const PHASEOUT_THRESHOLD_JOINT = 300000
const PHASEOUT_RATE_PER_1000 = 100

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function applyPhaseout(amount: number, magi: number, threshold: number): number {
  if (magi <= threshold) return amount
  const excessThousands = Math.ceil((magi - threshold) / 1000)
  const reduction = excessThousands * PHASEOUT_RATE_PER_1000
  return Math.max(0, amount - reduction)
}

export default function TipsOvertimeDeductionEstimator() {
  const [annualTips, setAnnualTips] = useState(8000)
  const [overtimePremium, setOvertimePremium] = useState(3000)
  const [magi, setMagi] = useState(60000)
  const [filingStatus, setFilingStatus] = useState<'single' | 'joint'>('single')
  const [marginalRate, setMarginalRate] = useState(22)

  const result = useMemo(() => {
    const threshold = filingStatus === 'joint' ? PHASEOUT_THRESHOLD_JOINT : PHASEOUT_THRESHOLD_SINGLE
    const overtimeCap = filingStatus === 'joint' ? OVERTIME_CAP_JOINT : OVERTIME_CAP_SINGLE

    const cappedTips = Math.min(annualTips, TIPS_CAP)
    const cappedOvertime = Math.min(overtimePremium, overtimeCap)

    const eligibleTips = applyPhaseout(cappedTips, magi, threshold)
    const eligibleOvertime = applyPhaseout(cappedOvertime, magi, threshold)
    const totalDeduction = eligibleTips + eligibleOvertime
    const estimatedSavings = (totalDeduction * marginalRate) / 100

    return { eligibleTips, eligibleOvertime, totalDeduction, estimatedSavings }
  }, [annualTips, overtimePremium, magi, filingStatus, marginalRate])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · estimate your deduction
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        No tax on tips &amp; overtime, in your numbers
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Filing status</p>
          <div className="inline-flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {(['single', 'joint'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilingStatus(s)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none capitalize transition-colors ${
                  filingStatus === s
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {s === 'joint' ? 'Married filing jointly' : 'Single'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Annual qualified tips</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(annualTips)}</b>
          </div>
          <input
            type="range" min={0} max={50000} step={500} value={annualTips}
            onChange={e => setAnnualTips(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Overtime premium (&quot;half&quot;) pay</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(overtimePremium)}</b>
          </div>
          <input
            type="range" min={0} max={25000} step={250} value={overtimePremium}
            onChange={e => setOvertimePremium(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>MAGI</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(magi)}</b>
          </div>
          <input
            type="range" min={0} max={400000} step={5000} value={magi}
            onChange={e => setMagi(+e.target.value)}
            className="w-full accent-amber-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Marginal tax rate (for savings estimate)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{marginalRate}%</b>
          </div>
          <input
            type="range" min={10} max={37} step={1} value={marginalRate}
            onChange={e => setMarginalRate(+e.target.value)}
            className="w-full accent-amber-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Your combined deduction after caps and phase-out is about{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={result.totalDeduction} format={v => money(v)} startFromZero />
          </strong>
          , an estimated{' '}
          <strong>
            <AnimatedNumber value={result.estimatedSavings} format={v => money(v)} startFromZero />
          </strong>{' '}
          in federal income tax savings at your marginal rate.
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Eligible tips deduction</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.eligibleTips)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500" style={{ width: `${Math.min(100, (result.eligibleTips / TIPS_CAP) * 100)}%` }} />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Eligible overtime deduction</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.eligibleOvertime)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-sky-600 dark:bg-sky-500 rounded-lg transition-all duration-500" style={{ width: `${Math.min(100, (result.eligibleOvertime / OVERTIME_CAP_JOINT) * 100)}%` }} />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-3">
          Simplified estimate, not tax advice — the phase-out mechanics shown here approximate IRS Schedule 1-A guidance and payroll tax (Social Security/Medicare) still applies regardless of this deduction. Confirm the exact phase-out formula and your eligibility with a tax professional or the current Schedule 1-A instructions.
        </p>
      </div>
    </div>
  )
}

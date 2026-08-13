'use client'

// 2027 HSA limits are official under Rev. Proc. 2026-24 (May 29, 2026):
// self-only $4,500 / family $9,000, +$1,000 catch-up at 55+. 2026 FSA limit
// is $3,400 with up to $680 carryover; the 2027 FSA limit had not been
// announced as of this writing (typically released Oct/Nov). Not tax advice.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import PieChart from '@/components/charts/PieChartLazy'

type PlanType = 'HDHP' | 'PPO'
type Coverage = 'self' | 'family'

const HSA_CAP_2027: Record<Coverage, number> = { self: 4500, family: 9000 }
const HSA_CATCHUP = 1000
const FSA_CAP_2026 = 3400

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function PretaxHealthElectionPlanner() {
  const [predictableSpend, setPredictableSpend] = useState(1800)
  const [marginalRate, setMarginalRate] = useState(22)
  const [planType, setPlanType] = useState<PlanType>('HDHP')
  const [coverage, setCoverage] = useState<Coverage>('self')
  const [age55plus, setAge55plus] = useState(false)

  const result = useMemo(() => {
    const cap =
      planType === 'HDHP'
        ? HSA_CAP_2027[coverage] + (age55plus ? HSA_CATCHUP : 0)
        : FSA_CAP_2026
    const recommendedElection = Math.min(predictableSpend, cap)
    const uncoveredSpend = Math.max(0, predictableSpend - cap)
    const taxSaved = recommendedElection * (marginalRate / 100)
    return { cap, recommendedElection, uncoveredSpend, taxSaved }
  }, [predictableSpend, marginalRate, planType, coverage, age55plus])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · HSA vs. FSA election
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How much should you actually elect?
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">Your plan type</p>
          <div className="inline-flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {(['HDHP', 'PPO'] as PlanType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlanType(p)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${planType === p ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {p === 'HDHP' ? 'HDHP → HSA' : 'PPO → FSA'}
              </button>
            ))}
          </div>
        </div>
        {planType === 'HDHP' && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">HDHP coverage</p>
            <div className="inline-flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
              {(['self', 'family'] as Coverage[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCoverage(c)}
                  className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${coverage === c ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {c === 'self' ? 'Self-only' : 'Family'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Predictable medical spend for the year</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(predictableSpend)}</b>
          </div>
          <input type="range" min={0} max={12000} step={100} value={predictableSpend} onChange={(e) => setPredictableSpend(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Marginal tax rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{marginalRate}%</b>
          </div>
          <input type="range" min={10} max={37} step={1} value={marginalRate} onChange={(e) => setMarginalRate(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        {planType === 'HDHP' && (
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" checked={age55plus} onChange={(e) => setAge55plus(e.target.checked)} className="accent-emerald-600" />
            I&apos;m 55 or older (adds a $1,000 HSA catch-up)
          </label>
        )}
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Your {planType === 'HDHP' ? 'HSA' : 'FSA'} cap is{' '}
          <strong>{money(result.cap)}</strong>. Electing{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.recommendedElection} format={(v) => money(v)} startFromZero />
          </strong>{' '}
          saves roughly{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.taxSaved} format={(v) => money(v)} startFromZero />
          </strong>{' '}
          in taxes this year.
          {result.uncoveredSpend > 0 && (
            <> {money(result.uncoveredSpend)} of your predictable spend exceeds the cap and stays after-tax.</>
          )}
        </p>

        <PieChart
          title="Predictable spend: covered by pretax dollars vs. not"
          data={[
            { label: 'Covered pretax', value: Math.round(result.recommendedElection), color: '#059669' },
            { label: 'Exceeds cap (after-tax)', value: Math.round(result.uncoveredSpend), color: '#6b7280' },
          ]}
          unit="$"
        />

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          HSA figures use the official 2027 IRS limits (Rev. Proc. 2026-24); FSA uses the 2026 limit — the IRS had not announced the 2027 FSA cap as of this writing. An HSA requires enrollment in a qualifying HDHP. Not tax advice.
        </p>
      </div>
    </div>
  )
}

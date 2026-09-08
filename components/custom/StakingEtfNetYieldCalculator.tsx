'use client'

// Defaults reflect Bitwise BSOL as reported on bsoletf.com as of 08/10/2026:
// ~6.21% gross staking reward rate, 0.20% sponsor fee, ~100% staked. Solana
// ETF yields, fees, and staked share move regularly — check each fund's site
// before relying on a number here. Not investment advice.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import BarChart from '@/components/charts/BarChartLazy'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function StakingEtfNetYieldCalculator() {
  const [investment, setInvestment] = useState(10000)
  const [grossYield, setGrossYield] = useState(6.21)
  const [expenseRatio, setExpenseRatio] = useState(0.2)
  const [stakingFee, setStakingFee] = useState(0)
  const [pctStaked, setPctStaked] = useState(100)

  const result = useMemo(() => {
    const effectiveGross = grossYield * (pctStaked / 100)
    const afterStakingFee = effectiveGross * (1 - stakingFee / 100)
    const netYieldPct = Math.max(0, afterStakingFee - expenseRatio)
    const annualIncome = investment * (netYieldPct / 100)
    const grossIncome = investment * (grossYield / 100)
    return { netYieldPct, annualIncome, grossIncome, effectiveGross, afterStakingFee }
  }, [investment, grossYield, expenseRatio, stakingFee, pctStaked])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · staking ETF net yield
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What a staked Solana ETF actually pays you
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Investment</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(investment)}</b>
          </div>
          <input type="range" min={1000} max={100000} step={500} value={investment} onChange={(e) => setInvestment(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Gross staking reward rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{grossYield.toFixed(2)}%</b>
          </div>
          <input type="range" min={0} max={10} step={0.01} value={grossYield} onChange={(e) => setGrossYield(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Sponsor / expense ratio</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{expenseRatio.toFixed(2)}%</b>
          </div>
          <input type="range" min={0} max={1} step={0.01} value={expenseRatio} onChange={(e) => setExpenseRatio(+e.target.value)} className="w-full accent-red-500" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Staking fee (% of rewards)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{stakingFee}%</b>
          </div>
          <input type="range" min={0} max={10} step={0.5} value={stakingFee} onChange={(e) => setStakingFee(+e.target.value)} className="w-full accent-red-500" />
        </div>
        <div className="sm:col-span-2">
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Share of fund assets actually staked</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{pctStaked}%</b>
          </div>
          <input type="range" min={0} max={100} step={1} value={pctStaked} onChange={(e) => setPctStaked(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          On {money(investment)}, a {grossYield.toFixed(2)}% gross reward rate would pay{' '}
          <strong>{money(result.grossIncome)}/yr</strong> before fees, but only{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={result.annualIncome} format={(v) => money(v) + '/yr'} startFromZero />
          </strong>{' '}
          net — a real yield of{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={result.netYieldPct} format={(v) => v.toFixed(2) + '%'} />
          </strong>
          .
        </p>

        <BarChart
          title="Yield waterfall: gross reward rate to net"
          description="Each step reflects the share not staked, the staking fee, and the sponsor's expense ratio."
          data={[
            { step: 'Gross reward rate', Yield: Number(grossYield.toFixed(2)) },
            { step: 'After staked-share', Yield: Number(result.effectiveGross.toFixed(2)) },
            { step: 'After staking fee', Yield: Number(result.afterStakingFee.toFixed(2)) },
            { step: 'Net yield', Yield: Number(result.netYieldPct.toFixed(2)) },
          ]}
          xKey="step"
          series={[{ key: 'Yield', label: 'Yield (%)', color: '#8b5cf6' }]}
          unit="%"
        />

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
          Staking yield and fund AUM move regularly — check the fund&apos;s own site for today&apos;s figures before relying on this. Ignores SOL price risk entirely, which typically dwarfs the yield. Not investment advice.
        </p>
      </div>
    </div>
  )
}

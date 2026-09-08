'use client'

// Defaults: base protocol staking APR ~2.6% (Staking Rewards, Aug 2026);
// BlackRock ETHB-style staked ETF fee structure used as a representative
// "staked ETF" comparison, not a specific fund's current terms.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function EthStakingYieldCalculator() {
  const [ethAmount, setEthAmount] = useState(2)
  const [ethPrice, setEthPrice] = useState(1900)
  const [etfFeePct, setEtfFeePct] = useState(18)
  // Held fixed — not user-adjustable in this widget, only the ETF fee slice is.
  const grossApr = 2.6
  const mgmtFeePct = 0.25

  const result = useMemo(() => {
    const netApr = Math.max(0, grossApr * (1 - etfFeePct / 100) - mgmtFeePct)
    const positionValue = ethAmount * ethPrice
    const grossYieldUsd = (positionValue * grossApr) / 100
    const netYieldUsd = (positionValue * netApr) / 100
    return { netApr, positionValue, grossYieldUsd, netYieldUsd }
  }, [ethAmount, ethPrice, grossApr, etfFeePct, mgmtFeePct])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · staking, gross vs. net
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What ETH staking actually pays after fees
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>ETH held</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{ethAmount.toFixed(1)} ETH</b>
          </div>
          <input type="range" min={0.1} max={20} step={0.1} value={ethAmount} onChange={(e) => setEthAmount(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>ETH price</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(ethPrice)}</b>
          </div>
          <input type="range" min={500} max={6000} step={50} value={ethPrice} onChange={(e) => setEthPrice(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Staked ETF fee (% of staking rewards)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{etfFeePct}%</b>
          </div>
          <input type="range" min={0} max={30} step={1} value={etfFeePct} onChange={(e) => setEtfFeePct(+e.target.value)} className="w-full accent-red-500" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At a {grossApr}% gross staking yield, your position would earn{' '}
          <strong className="text-gray-900 dark:text-white">
            <AnimatedNumber value={result.grossYieldUsd} format={(v) => money(v) + '/yr'} startFromZero />
          </strong>{' '}
          before fees, but only{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={result.netYieldUsd} format={(v) => money(v) + '/yr'} startFromZero />
          </strong>{' '}
          net through a staked ETF at {etfFeePct}% — a net yield of{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={result.netApr} format={(v) => v.toFixed(2) + '%'} />
          </strong>
          .
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Gross staking yield ({grossApr}% APR)</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.grossYieldUsd)}/yr</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-gray-400 dark:bg-gray-500 rounded-lg transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Net yield after ETF + management fees</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.netYieldUsd)}/yr</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.min(100, (result.netYieldUsd / Math.max(result.grossYieldUsd, 1)) * 100)}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-3">
          Models a representative staked-ETF fee structure, not a specific fund&apos;s current terms — check any fund&apos;s prospectus before investing. Not investment advice, and ETH&apos;s price and staking yield both change constantly.
        </p>
      </div>
    </div>
  )
}

'use client'

// Base spend figures are illustrative, anchored to the order of magnitude in
// the EIA's 2025 Winter Fuels Outlook (natural gas roughly flat YoY,
// electricity up, propane/oil down) — not exact EIA dollar figures, and not
// yet the 2026-27 update, which typically publishes in mid-October. Home-size
// and region multipliers are directional estimates, not EIA data.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import BarChart from '@/components/charts/BarChartLazy'

type Fuel = 'natgas' | 'electric' | 'propane' | 'oil'
type HomeSize = 'S' | 'M' | 'L'
type Region = 'NE' | 'MW' | 'S' | 'W'

const FUEL_LABELS: Record<Fuel, string> = {
  natgas: 'Natural gas',
  electric: 'Electricity',
  propane: 'Propane',
  oil: 'Heating oil',
}
const BASE_SPEND: Record<Fuel, number> = { natgas: 610, electric: 1130, propane: 1650, oil: 1700 }
const SIZE_MULT: Record<HomeSize, number> = { S: 0.7, M: 1.0, L: 1.4 }
const SIZE_LABELS: Record<HomeSize, string> = { S: 'Small / apartment', M: 'Medium / typical', L: 'Large' }
const REGION_MULT: Record<Region, number> = { NE: 1.3, MW: 1.15, S: 0.75, W: 0.85 }
const REGION_LABELS: Record<Region, string> = { NE: 'Northeast', MW: 'Midwest', S: 'South', W: 'West' }

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function WinterHeatingEstimator() {
  const [fuel, setFuel] = useState<Fuel>('natgas')
  const [homeSize, setHomeSize] = useState<HomeSize>('M')
  const [region, setRegion] = useState<Region>('NE')

  const result = useMemo(() => {
    const estWinterSpend = BASE_SPEND[fuel] * SIZE_MULT[homeSize] * REGION_MULT[region]
    const allFuels = (Object.keys(BASE_SPEND) as Fuel[]).map((f) => ({
      fuel: FUEL_LABELS[f],
      Spend: Math.round(BASE_SPEND[f] * SIZE_MULT[homeSize] * REGION_MULT[region]),
    }))
    return { estWinterSpend, allFuels }
  }, [fuel, homeSize, region])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · winter heating estimate
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Estimate your winter heating bill by fuel type
      </p>

      <div className="mb-2 rounded-lg border-l-4 border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">Awaiting the 2026-27 EIA update</p>
        <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">This uses last winter&apos;s (2025-26) EIA outlook as a base. The next Winter Fuels Outlook typically publishes in mid-October.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 my-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Primary heating fuel</p>
          <select value={fuel} onChange={(e) => setFuel(e.target.value as Fuel)} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-2">
            {(Object.keys(FUEL_LABELS) as Fuel[]).map((f) => (
              <option key={f} value={f}>{FUEL_LABELS[f]}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Home size</p>
          <select value={homeSize} onChange={(e) => setHomeSize(e.target.value as HomeSize)} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-2">
            {(Object.keys(SIZE_LABELS) as HomeSize[]).map((s) => (
              <option key={s} value={s}>{SIZE_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Region</p>
          <select value={region} onChange={(e) => setRegion(e.target.value as Region)} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-2">
            {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
              <option key={r} value={r}>{REGION_LABELS[r]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          A {SIZE_LABELS[homeSize].toLowerCase()} home in the {REGION_LABELS[region]} heated primarily with {FUEL_LABELS[fuel].toLowerCase()} might expect to spend around{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={result.estWinterSpend} format={(v) => money(v)} startFromZero />
          </strong>{' '}
          this winter.
        </p>

        <BarChart
          title={`Estimated winter spend by fuel — ${SIZE_LABELS[homeSize]}, ${REGION_LABELS[region]}`}
          description="Illustrative, based on the direction of last winter's EIA outlook, not confirmed 2026-27 figures."
          data={result.allFuels}
          xKey="fuel"
          series={[{ key: 'Spend', label: 'Estimated spend ($)', color: '#f59e0b' }]}
          unit="$"
          colorByCategory
        />

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
          Directional estimate only, not a bill projection — actual costs depend on your home&apos;s insulation, thermostat habits, local utility rates, and how cold the winter actually runs. Check the EIA&apos;s Winter Fuels Outlook once it&apos;s published.
        </p>
      </div>
    </div>
  )
}

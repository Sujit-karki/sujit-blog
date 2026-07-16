'use client'

import { useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { m } from 'motion/react'
import type { ChartData, ChartOptions } from 'chart.js'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

ChartJS.register(ArcElement, Tooltip, Legend)

// Illustrative maxed-out scenario: $5,000/yr for 18 years ($90,000 basis) +
// the $1,000 seed, growing to the White House CEA's own projected $303,800.
const BASIS = 90000
const SEED_AND_GROWTH = 303800 - BASIS

const SLICES = [
  { label: 'Your after-tax contributions (basis)', value: BASIS, color: '#2563eb' },
  { label: 'Seed + all investment growth', value: SEED_AND_GROWTH, color: '#f59e0b' },
]

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function TaxTreatmentChart() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const total = BASIS + SEED_AND_GROWTH

  const data: ChartData<'doughnut'> = {
    labels: SLICES.map(s => s.label),
    datasets: [
      {
        data: SLICES.map(s => s.value),
        backgroundColor: SLICES.map(s => s.color),
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 10,
        spacing: 2,
        borderRadius: 4,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    animation: { animateRotate: true, animateScale: true, duration: 900, easing: 'easeOutQuart' },
    onHover: (_evt, elements) => setHoverIdx(elements[0]?.index ?? null),
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        padding: 10,
        displayColors: true,
        boxPadding: 4,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: item => `${item.label}: ${money(Number(item.raw))}`,
        },
      },
    },
  }

  const activeSlice = hoverIdx !== null ? SLICES[hoverIdx] : null

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        A maxed-out account at 18, by tax treatment
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Only the basis slice comes out tax-free
      </p>

      <div className="grid sm:grid-cols-[minmax(0,220px)_1fr] gap-6 items-center">
        <div className="relative h-52 sm:h-56 mx-auto w-full max-w-[220px]">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
            <AnimatedNumber
              value={activeSlice ? activeSlice.value : total}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white text-center"
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mt-1 text-center">
              {activeSlice ? activeSlice.label : 'Total balance at 18'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {SLICES.map((s, i) => (
            <m.div
              key={s.label}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 border transition-colors ${
                hoverIdx === i
                  ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.label}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    {i === 0 ? 'Withdrawn tax-free, like a Roth' : 'Taxed as ordinary income on withdrawal'}
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white shrink-0">
                {money(s.value)}
              </span>
            </m.div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-4 leading-relaxed">
        Illustrative: $5,000/yr contributed for 18 years ($90,000 in basis) plus the $1,000 seed, growing to the White House Council of Economic Advisers&apos; own projected $303,800 maxed-out balance. Over two-thirds of that balance is the seed and growth &mdash; the part taxed as ordinary income, not capital gains, when withdrawn.
      </p>
    </ChartCard>
  )
}

'use client'

import { useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { m } from 'motion/react'
import type { ChartData, ChartOptions } from 'chart.js'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

ChartJS.register(ArcElement, Tooltip, Legend)

const SLICES = [
  { label: 'Social Security', pct: 12.4, color: '#059669' },
  { label: 'Medicare', pct: 2.9, color: '#f59e0b' },
]

export default function SelfEmploymentTaxChart() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const data: ChartData<'doughnut'> = {
    labels: SLICES.map(s => s.label),
    datasets: [
      {
        data: SLICES.map(s => s.pct),
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
          label: item => `${item.label}: ${item.raw}%`,
        },
      },
    },
  }

  const activeSlice = hoverIdx !== null ? SLICES[hoverIdx] : null

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Where the 15.3% goes
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Self-employment tax, broken down
      </p>

      <div className="grid sm:grid-cols-[minmax(0,220px)_1fr] gap-6 items-center">
        {/* Chart */}
        <div className="relative h-52 sm:h-56 mx-auto w-full max-w-[220px]">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatedNumber
              value={activeSlice ? activeSlice.pct : 15.3}
              format={v => `${v.toFixed(1)}%`}
              startFromZero
              className="font-serif text-3xl font-bold text-gray-900 dark:text-white"
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mt-1 text-center px-2">
              {activeSlice ? activeSlice.label : 'Total SE Tax'}
            </span>
          </div>
        </div>

        {/* Legend + explanation */}
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
                    {s.label === 'Social Security'
                      ? 'Capped at the $184,500 wage base (2026)'
                      : 'No income cap — applies to every dollar'}
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white shrink-0">
                {s.pct}%
              </span>
            </m.div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-4 leading-relaxed">
        Applied to 92.35% of your net self-employment earnings, not the full amount. High earners also owe an extra 0.9% Medicare surtax above $200,000 in net self-employment income (single filers).
      </p>
    </ChartCard>
  )
}

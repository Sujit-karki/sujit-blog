'use client'

import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

ChartJS.register(ArcElement, Tooltip)

const MAX_SCALE = 300

const GAUGES = [
  { label: 'March 2000 (dot-com peak)', value: 123, color: '#f59e0b' },
  { label: 'Mid-2026', value: 190, color: '#ef4444' },
]

function Gauge({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const data: ChartData<'doughnut'> = {
    labels: [label, 'remainder'],
    datasets: [
      {
        data: [value, MAX_SCALE - value],
        backgroundColor: [color, 'rgba(107,114,128,0.12)'],
        borderColor: 'transparent',
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    animation: {
      animateRotate: true,
      duration: 1100,
      easing: 'easeOutQuart',
      delay,
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-32 w-full max-w-[220px]">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 top-4 flex flex-col items-center justify-end pb-1">
          <AnimatedNumber
            value={value}
            format={v => Math.round(v).toString()}
            startFromZero
            className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
          />
          <span className="text-[9px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">HHI</span>
        </div>
      </div>
      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center mt-1">{label}</p>
    </div>
  )
}

export default function ConcentrationGaugeChart() {
  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Herfindahl-Hirschman Index (S&amp;P 500)
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        More concentrated than the dot-com peak
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Gauge {...GAUGES[0]} delay={0} />
        <Gauge {...GAUGES[1]} delay={300} />
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-6 leading-relaxed">
        HHI is the same concentration measure antitrust regulators use — higher means fewer companies control a bigger share of the index. Gauges scaled to a 0-{MAX_SCALE} range for visual comparison. Sources: Axios (2000 peak), Kobeissi Letter (2026), approximate.
      </p>
    </ChartCard>
  )
}

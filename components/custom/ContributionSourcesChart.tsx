'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const SOURCES = [
  { label: 'Charitable donor deposit\n(Dell, Dalio, Gerstner)', amount: 250, kind: 'one-time' as const, note: 'One-time, ZIP-code eligibility applies' },
  { label: 'Treasury seed', amount: 1000, kind: 'one-time' as const, note: 'One-time, opt in via Form 4547' },
  { label: 'Employer match', amount: 2500, kind: 'per-year' as const, note: 'Up to this much per year, pre-tax' },
  { label: 'Combined annual cap', amount: 5000, kind: 'per-year' as const, note: 'All sources combined, per year' },
]

const COLORS = { 'one-time': 'rgba(37,99,235,0.75)', 'per-year': 'rgba(5,150,105,0.75)' }

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function ContributionSourcesChart() {
  const data: ChartData<'bar'> = {
    labels: SOURCES.map(s => s.label),
    datasets: [
      {
        data: SOURCES.map(s => s.amount),
        backgroundColor: SOURCES.map(s => COLORS[s.kind]),
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 40,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        padding: 10,
        displayColors: false,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: item => `${money(Number(item.raw))} — ${SOURCES[item.dataIndex].note}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(107,114,128,0.1)' },
        ticks: { color: '#6b7280', font: { size: 10 }, callback: v => money(Number(v)) },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11 } },
        border: { display: false },
      },
    },
  }

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Per-child dollar amounts
      </p>
      <p className="font-serif text-xl mb-1 text-gray-900 dark:text-white">
        Where the free money can come from
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Roughly{' '}
        <AnimatedNumber value={1.4} format={v => `$${v.toFixed(1)}B`} startFromZero className="font-semibold text-gray-700 dark:text-gray-300" />
        {' '}in Treasury seed money alone had gone out to 1.4 million kids as of early July 2026
      </p>

      <div className="h-56 sm:h-64">
        <Bar data={data} options={options} />
      </div>

      <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS['one-time'] }} />
          One-time deposit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS['per-year'] }} />
          Per year, ongoing
        </span>
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
        Charitable deposits vary by program and ZIP-code income eligibility; $250 is the common per-child figure across the Dell, Dalio, and Gerstner pledges. Employer contributions count toward, not on top of, the $5,000 combined annual cap.
      </p>
    </ChartCard>
  )
}

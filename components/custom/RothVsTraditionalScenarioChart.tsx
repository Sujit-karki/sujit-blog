'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'
import ChartCard from './ChartCard'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// Illustrative: a single $7,500 contribution grown at 7%/yr for 30 years
// (~$57,100 pre-tax), matching the calculator's assumptions above. Roth is
// already taxed, so it keeps the full amount in every scenario; Traditional
// is taxed on withdrawal at the bracket shown.
const SCENARIOS: { label: string[]; roth: number; traditional: number }[] = [
  { label: ['Retire in a lower bracket', '(12%)'], roth: 57100, traditional: 50251 },
  { label: ['Same bracket', '(22%)'], roth: 57100, traditional: 44554 },
  { label: ['Retire in a higher bracket', '(32%)'], roth: 57100, traditional: 38856 },
]

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function RothVsTraditionalScenarioChart() {
  const data: ChartData<'bar'> = {
    labels: SCENARIOS.map(s => s.label),
    datasets: [
      {
        label: 'Roth IRA',
        data: SCENARIOS.map(s => s.roth),
        backgroundColor: 'rgba(16,185,129,0.8)',
        borderRadius: 5,
        borderSkipped: false,
        maxBarThickness: 36,
      },
      {
        label: 'Traditional IRA',
        data: SCENARIOS.map(s => s.traditional),
        backgroundColor: 'rgba(99,102,241,0.8)',
        borderRadius: 5,
        borderSkipped: false,
        maxBarThickness: 36,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
      delay: (ctx) => (ctx.type === 'data' ? ctx.datasetIndex * 150 + ctx.dataIndex * 100 : 0),
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { color: '#6b7280', font: { size: 11 }, boxWidth: 10, boxHeight: 10 },
      },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        padding: 10,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: { label: item => `${item.dataset.label}: ${money(Number(item.raw))}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 10 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(107,114,128,0.1)' },
        ticks: { color: '#6b7280', font: { size: 10 }, callback: v => money(Number(v)) },
        border: { display: false },
      },
    },
  }

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Same $7,500, three tax futures
      </p>
      <p className="font-serif text-xl mb-4 text-gray-900 dark:text-white">
        Roth stays flat. Traditional moves with your future rate.
      </p>

      <div className="h-64 sm:h-72">
        <Bar data={data} options={options} />
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
        Illustrative: a single $7,500 contribution growing at 7%/year for 30 years (~$57,100 pre-tax), matching the calculator above. Roth is already taxed, so it keeps the full balance regardless of future rates; Traditional is taxed on withdrawal at the bracket shown. Not personalized tax advice.
      </p>
    </ChartCard>
  )
}

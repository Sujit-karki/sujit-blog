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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const EMPLOYEE_DEFERRAL_CAP_2026 = 24500
const COMBINED_CAP_2026 = 72000
const EMPLOYER_RATE = 0.20 // simplified sole-proprietor employer-side rate
const PROFIT_LEVELS = [20000, 40000, 60000, 80000, 100000, 150000]

function money(v: number): string {
  if (v >= 1000) return '$' + Math.round(v / 1000) + 'k'
  return '$' + Math.round(v)
}

function sepContribution(profit: number): number {
  return Math.min(profit * EMPLOYER_RATE, COMBINED_CAP_2026)
}

function solo401kContribution(profit: number): number {
  const employerPortion = profit * EMPLOYER_RATE
  const employeePortion = Math.min(EMPLOYEE_DEFERRAL_CAP_2026, profit)
  const combined = Math.min(employerPortion + employeePortion, COMBINED_CAP_2026)
  return Math.min(combined, profit)
}

export default function RetirementContributionChart() {
  const sepValues = PROFIT_LEVELS.map(sepContribution)
  const solo401kValues = PROFIT_LEVELS.map(solo401kContribution)

  const data: ChartData<'bar'> = {
    labels: PROFIT_LEVELS.map(money),
    datasets: [
      {
        label: 'SEP IRA',
        data: sepValues,
        backgroundColor: 'rgba(245,158,11,0.75)',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 26,
      },
      {
        label: 'Solo 401(k)',
        data: solo401kValues,
        backgroundColor: 'rgba(5,150,105,0.75)',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 26,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { color: '#6b7280', font: { size: 11 }, boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: 'rect' },
      },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        padding: 10,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: item => `${item.dataset.label}: $${Math.round(Number(item.raw)).toLocaleString('en-US')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        title: { display: true, text: 'Net side-hustle profit', color: '#9ca3af', font: { size: 10 } },
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
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Max 2026 contribution by profit level
      </p>
      <p className="font-serif text-xl mb-4 text-gray-900 dark:text-white">
        Solo 401(k) vs. SEP IRA, side by side
      </p>

      <div className="h-64 sm:h-72">
        <Bar data={data} options={options} />
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-4 leading-relaxed">
        Simplified: SEP IRA modeled as 20% of net profit; Solo 401(k) modeled as a $24,500 employee deferral plus 20% employer contribution, both capped at $72,000 combined and at net profit. The gap is largest at lower profit because the Solo 401(k)&apos;s flat employee deferral doesn&apos;t depend on the 20% employer formula the way SEP contributions do.
      </p>
    </div>
  )
}

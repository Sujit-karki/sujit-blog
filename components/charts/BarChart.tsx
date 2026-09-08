"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useIsDark } from "./useIsDark";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface BarSeries {
  key: string;
  label: string;
  color?: string;
}

export interface BarChartProps {
  title: string;
  description?: string;
  data: Record<string, number | string>[];
  xKey: string;
  series: BarSeries[];
  unit?: string;
  height?: number;
  /** Per-bar colors for a single-series chart (e.g. highlighting one category) */
  colorByCategory?: boolean;
}

const PALETTE = ["#059669", "#6366f1", "#f59e0b", "#ef4444", "#0d9488"];

export default function BarChart({
  title,
  description,
  data,
  xKey,
  series,
  unit = "",
  height = 320,
  colorByCategory = false,
}: BarChartProps) {
  const isDark = useIsDark();
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#9ca3af" : "#6b7280";

  const chartData: ChartData<"bar"> = {
    labels: data.map((row) => String(row[xKey])),
    datasets: series.map((s, i) => ({
      label: s.label,
      data: data.map((row) => Number(row[s.key])),
      backgroundColor: colorByCategory
        ? data.map((_, di) => PALETTE[di % PALETTE.length])
        : (s.color ?? PALETTE[i % PALETTE.length]),
      borderRadius: 4,
      borderSkipped: false,
      maxBarThickness: 56,
    })),
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      // Single-series charts label themselves via the figcaption title.
      legend: {
        display: series.length > 1,
        labels: { color: textColor, boxWidth: 12, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: isDark ? "#111827" : "#ffffff",
        titleColor: isDark ? "#f1f5f9" : "#111827",
        bodyColor: isDark ? "#f1f5f9" : "#111827",
        borderColor: gridColor,
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (item) => `${item.dataset.label}: ${item.formattedValue}${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: gridColor },
        ticks: { color: textColor, font: { size: 12 } },
      },
      y: {
        grid: { color: gridColor },
        border: { display: false },
        ticks: { color: textColor, font: { size: 12 }, callback: (v) => `${v}${unit}` },
      },
    },
  };

  return (
    <figure className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <figcaption className="mb-4">
        <p className="font-serif text-lg text-gray-900 dark:text-white">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </figcaption>

      <div style={{ height }}>
        <Bar data={chartData} options={options} role="img" aria-label={`${title} — bar chart`} />
      </div>

      {/* Visible data-table fallback. Chart.js draws to <canvas>, which is opaque
          to screen readers and to anything without JS, so this table is the
          accessible representation of the data — not a nicety. */}
      <div tabIndex={0} className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <caption className="sr-only">{title} — data table</caption>
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                {xKey}
              </th>
              {series.map((s) => (
                <th
                  key={s.key}
                  className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
                >
                  {s.label}
                  {unit ? ` (${unit})` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{row[xKey]}</td>
                {series.map((s) => (
                  <td key={s.key} className="px-3 py-2 text-gray-600 dark:text-gray-300">
                    {row[s.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

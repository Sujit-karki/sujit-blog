"use client";

import { PieChart as RPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useIsDark } from "./useIsDark";

export interface PieSlice {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  title: string;
  description?: string;
  data: PieSlice[];
  unit?: string;
  height?: number;
}

const PALETTE = ["#059669", "#f59e0b", "#6366f1", "#0d9488", "#ef4444", "#8b5cf6"];

export default function PieChart({ title, description, data, unit = "", height = 320 }: PieChartProps) {
  const isDark = useIsDark();
  const gridColor = isDark ? "#374151" : "#e5e7eb";

  return (
    <figure className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <figcaption className="mb-4">
        <p className="font-serif text-lg text-gray-900 dark:text-white">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </figcaption>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RPieChart accessibilityLayer>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={d.label} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: isDark ? "#111827" : "#ffffff",
                border: `1px solid ${gridColor}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => [`${value}${unit}`, String(name)]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </RPieChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <caption className="sr-only">{title} — data table</caption>
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                Category
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                Value{unit ? ` (${unit})` : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{d.label}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                  {d.value}
                  {unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

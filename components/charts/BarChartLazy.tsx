"use client";

import dynamic from "next/dynamic";
import type { BarChartProps } from "./BarChart";

const BarChart = dynamic<BarChartProps>(() => import("./BarChart"), {
  ssr: false,
  loading: () => (
    <div className="not-prose my-8 h-80 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
  ),
});

export default BarChart;

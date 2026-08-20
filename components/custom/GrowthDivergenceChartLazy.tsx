"use client";

import dynamic from "next/dynamic";

// Chart.js is heavy enough to matter for INP/LCP on a post that embeds it —
// load it only on the client, after the rest of the article is interactive,
// and reserve its height up front so it doesn't shift layout in (CLS).
const GrowthDivergenceChart = dynamic(() => import("./GrowthDivergenceChart"), {
  ssr: false,
  loading: () => (
    <div className="not-prose my-8 h-80 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
  ),
});

export default GrowthDivergenceChart;

"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/site-config";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSlotProps {
  slot: string;
  className?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
}

export default function AdSlot({ slot, className = "", format = "auto" }: AdSlotProps) {
  const { enabled, publisherId } = siteConfig.adsense;
  const active = enabled && !!publisherId && process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!active) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense push error:", e);
    }
  }, [active]);

  if (!active) {
    return (
      <div
        data-ad-slot={slot}
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-xs font-medium text-gray-400 dark:text-gray-500 select-none ${className}`}
      >
        Advertisement
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

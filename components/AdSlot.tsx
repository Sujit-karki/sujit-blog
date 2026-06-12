import { siteConfig } from "@/lib/site-config";

interface AdSlotProps {
  slot: string;
  className?: string;
}

export default function AdSlot({ slot, className = "" }: AdSlotProps) {
  if (!siteConfig.adsense.enabled) {
    return (
      <div
        data-ad-slot={slot}
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-xs font-medium text-gray-400 dark:text-gray-500 select-none ${className}`}
      >
        Advertisement
      </div>
    );
  }

  // Real AdSense code — swap in when adsense.enabled = true
  return (
    <div data-ad-slot={slot} className={className}>
      {/* ins class="adsbygoogle" goes here */}
    </div>
  );
}

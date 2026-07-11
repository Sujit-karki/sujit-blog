import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "@/components/search/SearchResults";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" />}>
      <SearchResults />
    </Suspense>
  );
}

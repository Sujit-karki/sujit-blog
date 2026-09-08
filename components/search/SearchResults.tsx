"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSearchIndex } from "./useSearchIndex";
import { useFuseSearch } from "./useFuseSearch";
import { slugifyCategory } from "@/lib/site-config";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const index = useSearchIndex();
  const results = useFuseSearch(index, query);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Search</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        placeholder="Search posts…"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-8"
      />

      {query.trim() && results.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No results for &ldquo;{query}&rdquo;.</p>
      )}

      <ul className="space-y-4">
        {results.map((r) => (
          <li key={r.slug}>
            <article className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors">
              <Link
                href={`/category/${slugifyCategory(r.category)}`}
                className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
              >
                {r.category}
              </Link>
              <Link href={`/posts/${r.slug}`} className="block">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mt-1 mb-1">
                  {r.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {r.description}
                </p>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

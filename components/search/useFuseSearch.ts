"use client";

import { useMemo } from "react";
import Fuse from "fuse.js";
import type { SearchIndexEntry } from "@/app/api/search-index/route";

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<SearchIndexEntry>>[1] = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "description", weight: 0.25 },
    { name: "tags", weight: 0.15 },
    { name: "category", weight: 0.1 },
  ],
  threshold: 0.25,
  minMatchCharLength: 2,
  ignoreLocation: false,
};

export function useFuseSearch(index: SearchIndexEntry[], query: string): SearchIndexEntry[] {
  const fuse = useMemo(() => new Fuse(index, FUSE_OPTIONS), [index]);

  return useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query, { limit: 10 }).map((r) => r.item);
  }, [fuse, query]);
}

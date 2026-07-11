"use client";

import { useEffect, useState } from "react";
import type { SearchIndexEntry } from "@/app/api/search-index/route";

let cached: SearchIndexEntry[] | null = null;
let inflight: Promise<SearchIndexEntry[]> | null = null;

function fetchIndex(): Promise<SearchIndexEntry[]> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch("/api/search-index")
      .then((res) => res.json())
      .then((data: SearchIndexEntry[]) => {
        cached = data;
        return data;
      });
  }
  return inflight;
}

export function useSearchIndex(): SearchIndexEntry[] {
  const [index, setIndex] = useState<SearchIndexEntry[]>(cached ?? []);

  useEffect(() => {
    let active = true;
    fetchIndex().then((data) => {
      if (active) setIndex(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return index;
}

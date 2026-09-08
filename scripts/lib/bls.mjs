// BLS series access via the published flat files rather than the JSON API.
//
// Why not the API. The public JSON API allows 25 requests a day without a
// registration key, counted per IP rather than per script, and it silently
// truncates any request spanning more than ten years. A day of iterating on
// one script exhausts it, and once exhausted every other script that needs BLS
// data fails too — including on a build machine, where the failure looks like
// a bug rather than a quota.
//
// The flat files at download.bls.gov are the same numbers from the same
// publisher, carry the full history rather than a ten-year window, and have no
// quota at all. They are larger, which is what the on-disk cache below is for:
// a file is fetched once and reused until it is older than CACHE_TTL_HOURS.
//
// This mirrors research/data/sec-cache, which exists for the same reason.

import fs from "node:fs";
import path from "node:path";

const BASE = "https://download.bls.gov/pub/time.series";
const CACHE_DIR = path.join(process.cwd(), "research", "data", "bls-cache");
const CACHE_TTL_HOURS = 24;

// BLS blocks requests without a descriptive User-Agent naming a contact.
const UA = "sujitkarki.com.np research script (karkisujit02@gmail.com)";

/** Flat files that carry the series this repo uses. */
export const DATASETS = {
  /** CPI-U and CPI-W, all-items series, full history. */
  cpiAllItems: "cu/cu.data.1.AllItems",
  /** CPI, every currently-published series (large). */
  cpiCurrent: "cu/cu.data.0.Current",
  /** Current Employment Statistics, all series (large). */
  cesAll: "ce/ce.data.0.AllCESSeries",
  /** CES series metadata, for resolving an id to its title. */
  cesSeries: "ce/ce.series",
  /** CPI item code reference. */
  cpiItems: "cu/cu.item",
};

function cachePathFor(relative) {
  return path.join(CACHE_DIR, relative.replace(/[\/]/g, "__"));
}

function isFresh(file) {
  if (!fs.existsSync(file)) return false;
  const ageHours = (Date.now() - fs.statSync(file).mtimeMs) / 36e5;
  return ageHours < CACHE_TTL_HOURS;
}

/**
 * Fetch one flat file as text, from cache when it is fresh.
 * `force` bypasses the cache; `allowStale` falls back to an expired copy when
 * the network fails, which keeps a build working through an outage rather than
 * failing on something that has not changed in months.
 */
export async function fetchFlatFile(relative, { force = false, allowStale = true } = {}) {
  const file = cachePathFor(relative);
  if (!force && isFresh(file)) return fs.readFileSync(file, "utf8");

  try {
    const res = await fetch(`${BASE}/${relative}`, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`download.bls.gov returned HTTP ${res.status} for ${relative}`);
    const text = await res.text();
    if (text.length < 200) throw new Error(`${relative} came back suspiciously small (${text.length} bytes)`);
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(file, text, "utf8");
    return text;
  } catch (err) {
    if (allowStale && fs.existsSync(file)) {
      const ageHours = ((Date.now() - fs.statSync(file).mtimeMs) / 36e5).toFixed(1);
      console.warn(`  ! ${relative}: ${err.message}; using cached copy ${ageHours}h old`);
      return fs.readFileSync(file, "utf8");
    }
    throw err;
  }
}

/**
 * Monthly observations for the given series ids, as
 * Map<seriesId, Map<year*100+month, value>>.
 *
 * The flat files are tab-separated with padded fields, and M13 rows are BLS's
 * annual averages — including them would double-count every year, so they are
 * dropped here rather than in each caller.
 */
export async function monthlySeries(dataset, ids, options = {}) {
  const text = await fetchFlatFile(dataset, options);
  const wanted = new Set(ids);
  const out = new Map(ids.map((id) => [id, new Map()]));

  let matched = 0;
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("series_id")) continue;
    const parts = line.split("\t");
    if (parts.length < 4) continue;
    const id = parts[0].trim();
    if (!wanted.has(id)) continue;
    const period = parts[2].trim();
    if (!period.startsWith("M") || period === "M13") continue;
    const value = Number(parts[3].trim());
    if (!Number.isFinite(value)) continue;
    out.get(id).set(Number(parts[1].trim()) * 100 + Number(period.slice(1)), value);
    matched++;
  }

  const empty = ids.filter((id) => out.get(id).size === 0);
  if (empty.length) {
    throw new Error(
      `no observations found for ${empty.join(", ")} in ${dataset} — check the series id ` +
        `(${matched} rows matched overall)`
    );
  }
  return out;
}

/** Average monthly points into calendar quarters, reporting incomplete ones. */
export function toQuarters(points) {
  const buckets = new Map();
  for (const [key, value] of points) {
    const id = `${Math.floor(key / 100)}Q${Math.ceil((key % 100) / 3)}`;
    if (!buckets.has(id)) buckets.set(id, []);
    buckets.get(id).push(value);
  }
  const averaged = new Map();
  const partial = [];
  for (const [id, values] of buckets) {
    if (values.length < 3) partial.push(`${id} (${values.length}/3 months)`);
    averaged.set(id, values.reduce((a, b) => a + b, 0) / values.length);
  }
  return { averaged, partial };
}

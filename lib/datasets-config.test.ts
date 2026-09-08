import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { datasets, buildDatasetJsonLd } from "./datasets-config";
import { getAllPosts } from "./posts";

const RESEARCH_DATA = path.join(process.cwd(), "research", "data");
const entries = Object.entries(datasets);

describe("dataset metadata", () => {
  it("describes at least one dataset", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("%s points at a real post", (slug) => {
    const slugs = getAllPosts().map((p) => p.slug);
    expect(slugs).toContain(slug);
  });

  // Google Dataset Search requires 50-5,000 characters and reads only the
  // first 5,000 characters of any textual property. A description that fails
  // this is not a style problem, it is an invalid record.
  it.each(entries)("%s has a description within Dataset Search's bounds", (_slug, meta) => {
    expect(meta.description.length).toBeGreaterThanOrEqual(50);
    expect(meta.description.length).toBeLessThanOrEqual(5000);
  });

  it.each(entries)("%s declares keywords, variables and coverage", (_slug, meta) => {
    expect(meta.name.length).toBeGreaterThan(0);
    expect(meta.keywords.length).toBeGreaterThan(0);
    expect(meta.variableMeasured.length).toBeGreaterThan(0);
    expect(meta.temporalCoverage.length).toBeGreaterThan(0);
  });

  // Every contentUrl advertised to a crawler must resolve. publish-data.mjs
  // copies research/data into public/data at build time, so checking the
  // source directory catches a missing file before the copy step rather than
  // shipping structured data that points at a 404.
  it.each(entries)("%s lists files that exist in research/data", (_slug, meta) => {
    expect(meta.files.length).toBeGreaterThan(0);
    for (const file of meta.files) {
      expect(fs.existsSync(path.join(RESEARCH_DATA, file.name))).toBe(true);
    }
  });
});

describe("buildDatasetJsonLd", () => {
  it("returns null for a post that publishes no rows", () => {
    expect(buildDatasetJsonLd("not-a-dataset-post")).toBeNull();
  });

  it("emits a valid Dataset with a download per file", () => {
    const [slug, meta] = entries[0];
    const jsonLd = buildDatasetJsonLd(slug)!;

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Dataset");
    expect(jsonLd.name).toBe(meta.name);
    expect(jsonLd.isAccessibleForFree).toBe(true);
    expect(jsonLd.distribution).toHaveLength(meta.files.length);

    for (const download of jsonLd.distribution) {
      expect(download["@type"]).toBe("DataDownload");
      expect(download.contentUrl).toMatch(/^https:\/\/.+\/data\/.+/);
    }
  });

  it("survives JSON serialisation with angle brackets escaped", () => {
    const serialised = JSON.stringify(buildDatasetJsonLd(entries[0][0])).replace(/</g, "\\u003c");
    expect(serialised).not.toContain("<");
    expect(() => JSON.parse(serialised)).not.toThrow();
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  datasets,
  buildDatasetJsonLd,
  DATA_LICENSE,
  ZENODO_CONCEPT_DOI,
} from "./datasets-config";
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

  it("declares the CC BY 4.0 licence the data ships under", () => {
    const jsonLd = buildDatasetJsonLd(entries[0][0])!;
    expect(jsonLd.license).toBe(DATA_LICENSE);
    expect(fs.existsSync(path.join(process.cwd(), "LICENSE-DATA"))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), "LICENSE"))).toBe(true);
  });

  // The DOI is empty until a Zenodo archive exists. Either state is fine; a
  // malformed one is not, and neither is claiming an identifier that resolves
  // to nothing — so the property is present exactly when the constant is set.
  it("emits an identifier only when a DOI has been minted", () => {
    const jsonLd = buildDatasetJsonLd(entries[0][0])! as Record<string, unknown>;
    if (ZENODO_CONCEPT_DOI) {
      expect(ZENODO_CONCEPT_DOI).toMatch(/^https:\/\/doi\.org\/10\.\d{4,9}\/\S+$/);
      expect(jsonLd.identifier).toBe(ZENODO_CONCEPT_DOI);
      expect(jsonLd.citation).toContain(ZENODO_CONCEPT_DOI);
    } else {
      expect(jsonLd).not.toHaveProperty("identifier");
      expect(jsonLd).not.toHaveProperty("citation");
    }
  });

  it("keeps the Zenodo deposit metadata in step with the licence", () => {
    const zenodo = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), ".zenodo.json"), "utf8")
    );
    expect(zenodo.license).toBe("cc-by-4.0");
    expect(zenodo.upload_type).toBe("dataset");
    expect(zenodo.creators.length).toBeGreaterThan(0);
    // Zenodo rejects a deposit whose description is empty, and truncates hard.
    expect(zenodo.description.length).toBeGreaterThan(50);
  });

  it("survives JSON serialisation with angle brackets escaped", () => {
    const serialised = JSON.stringify(buildDatasetJsonLd(entries[0][0])).replace(/</g, "\\u003c");
    expect(serialised).not.toContain("<");
    expect(() => JSON.parse(serialised)).not.toThrow();
  });
});

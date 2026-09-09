// Generates content/posts-registry.ts — a static slug -> import() map for every
// MDX post.
//
// Why this exists. The post route used to load its body with a template-literal
// dynamic import:
//
//   await import(`@/content/posts/${slug}.mdx`)
//
// A path built at runtime is invisible to the bundler, so the module graph for
// a post only exists once a request names the slug. Turbopack therefore has no
// registered client-reference for the client components living inside that MDX
// (StatCard, BarChartLazy, and the rest), and Next 16's `instant` navigation
// validation — which renders the target segment ahead of time — fails with
// "module factory is not available", naming whichever client component the
// current post happens to use. Production was never affected: `next build`
// resolves every post up front. It was a dev-only error, but a constant one.
//
// Listing the imports statically fixes it at the root: the bundler sees all of
// them, so the client references exist before any request arrives.
//
// Runs from both `dev` and `prebuild`, so the file cannot drift from the
// content directory in normal use. It is committed so a clean checkout
// typechecks before anything is run.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = path.join(root, "content", "posts");
const outFile = path.join(root, "content", "posts-registry.ts");

const slugs = fs
  .readdirSync(postsDir)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => f.replace(/\.mdx$/, ""))
  .sort();

if (slugs.length === 0) {
  console.error("generate-post-registry: no .mdx files found in content/posts");
  process.exit(1);
}

// A slug reaches this file as an object key and as an import path, so anything
// outside this set would either break the module or, worse, resolve somewhere
// unintended. Filenames are ours, not user input, but a bad one should stop the
// build rather than emit a file that fails to parse later.
const bad = slugs.filter((s) => !/^[a-zA-Z0-9._-]+$/.test(s));
if (bad.length > 0) {
  console.error(`generate-post-registry: unsupported characters in slug(s): ${bad.join(", ")}`);
  process.exit(1);
}

const entries = slugs
  .map((slug) => `  ${JSON.stringify(slug)}: () => import("./posts/${slug}.mdx"),`)
  .join("\n");

const out = `// GENERATED FILE — do not edit by hand.
// Regenerate with: npm run gen:posts
// Source: content/posts/*.mdx  (${slugs.length} posts)
//
// See scripts/generate-post-registry.mjs for why these imports are listed
// statically instead of built from the slug at request time.

import type { ComponentType } from "react";

type PostModule = { default: ComponentType };

export const postModules: Record<string, () => Promise<PostModule>> = {
${entries}
};

export function hasPostModule(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(postModules, slug);
}
`;

const previous = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf-8") : null;
if (previous === out) {
  console.log(`generate-post-registry: up to date (${slugs.length} posts)`);
} else {
  fs.writeFileSync(outFile, out, "utf-8");
  console.log(`generate-post-registry: wrote content/posts-registry.ts (${slugs.length} posts)`);
}

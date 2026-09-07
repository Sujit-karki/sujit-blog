// Copies the research datasets into public/ so the posts can link to data a
// reader can actually download.
//
// Runs automatically before every build via the `prebuild` script.
//
// Why not link to the repository instead. Several posts promised "the raw data
// is published in the repository" and linked to GitHub while the repository was
// still private, so every one of those links returned 404 — a promise of
// transparency that delivered a login wall. The repository is public now, and
// the posts link to the scripts directly, but the data itself still ships with
// the site: a reader after one CSV should not have to go and find it.
//
// public/data/ is generated, so it is gitignored: research/data/ stays the one
// copy under version control.

import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "research", "data");
const DEST = path.join(process.cwd(), "public", "data");
const EXTENSIONS = new Set([".json", ".csv", ".jsonl"]);

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// Every dataFile="..." a post declares, so a link that would 404 fails the
// build instead of shipping. This is the whole reason the script is a build
// step rather than something run by hand: the previous version of these links
// pointed at a then-private repository and returned 404 to every reader, and
// nothing in the pipeline noticed.
function referencedDatasets() {
  if (!fs.existsSync(POSTS_DIR)) return new Map();
  const refs = new Map();
  for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"))) {
    const body = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    for (const [, name] of body.matchAll(/(?:dataFile="|\(\/data\/)([A-Za-z0-9._-]+)/g)) {
      // A post normally references its dataset twice — once in the signup
      // block, once in the sources — so collect slugs as a set.
      if (!refs.has(name)) refs.set(name, new Set());
      refs.get(name).add(file.replace(/\.mdx$/, ""));
    }
  }
  return refs;
}

if (!fs.existsSync(SRC)) {
  const refs = referencedDatasets();
  if (refs.size) {
    const lines = [...refs].map(([n, p]) => `  ${n} <- ${[...p].join(", ")}`);
    console.error(
      `publish-data: no research/data directory, but ${refs.size} dataset(s) are ` +
        `referenced by posts:\n${lines.join("\n")}`
    );
    process.exit(1);
  }
  console.log("publish-data: no research/data directory, nothing to publish");
  process.exit(0);
}

fs.mkdirSync(DEST, { recursive: true });

// Anything already in public/data that no longer exists upstream is removed, so
// a dataset deleted from research/ cannot keep being served from a stale copy.
for (const existing of fs.readdirSync(DEST)) {
  if (!fs.existsSync(path.join(SRC, existing))) {
    fs.unlinkSync(path.join(DEST, existing));
    console.log(`  removed stale ${existing}`);
  }
}

let copied = 0;
let bytes = 0;
for (const file of fs.readdirSync(SRC)) {
  if (!EXTENSIONS.has(path.extname(file))) continue;
  const from = path.join(SRC, file);
  const to = path.join(DEST, file);
  const stat = fs.statSync(from);
  // Skip an unchanged file so a rebuild does not churn mtimes for no reason.
  if (fs.existsSync(to) && fs.statSync(to).mtimeMs >= stat.mtimeMs) continue;
  fs.copyFileSync(from, to);
  copied += 1;
  bytes += stat.size;
}

const published = new Set(fs.readdirSync(DEST));
const missing = [...referencedDatasets()].filter(([name]) => !published.has(name));
if (missing.length) {
  const lines = missing.map(([n, p]) => `  /data/${n} <- ${[...p].join(", ")}`);
  console.error(
    `publish-data: posts reference datasets that do not exist:\n${lines.join("\n")}`
  );
  process.exit(1);
}

console.log(
  `publish-data: ${published.size} datasets available at /data/ ` +
    `(${copied} updated, ${(bytes / 1024).toFixed(0)} KB), all post references resolve`
);

// Verifies every external URL cited across the posts still resolves.
//
//   npm run audit:links              check every post
//   npm run audit:links -- <slug>    check one post
//
// Why this exists. Three times in one working session a cited source turned out
// to be wrong: two official whitepaper links 404'd at the URL the project's own
// site publishes, and a "privacy policy" link went to a marketing landing page
// eighteen times shorter than the actual document. Each was found by accident.
// Source rot is silent — the post keeps rendering, the citation keeps looking
// authoritative, and nothing tells you the thing behind it moved.
//
// This is deliberately NOT wired into CI. It depends on twelve dozen third-party
// hosts being up and not rate-limiting a data-centre IP, so as a merge gate it
// would fail for reasons that have nothing to do with the commit. Run it
// manually, read the output, judge each failure.

import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 8;

// Several agencies and publishers reject unadorned automated requests. Sending
// a normal browser UA is not evasion here — it is asking for the same public
// page a reader would get. Hosts that still refuse are reported as UNVERIFIED
// rather than BROKEN, because a 403 to a bot says nothing about whether the
// page is there.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function collect() {
  const byUrl = new Map();
  for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"))) {
    const slug = file.replace(/\.mdx$/, "");
    const body = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    for (const [url] of body.matchAll(/https?:\/\/[^\s)"'\]}]+/g)) {
      const clean = url.replace(/[.,;]+$/, "");
      if (!byUrl.has(clean)) byUrl.set(clean, new Set());
      byUrl.get(clean).add(slug);
    }
  }
  return byUrl;
}

async function probe(url) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": UA, Accept: "*/*" },
      });
      return { status: res.status, finalUrl: res.url };
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    // HEAD first — cheap, and most hosts answer it. A few reject HEAD outright
    // with 403/405 while serving GET fine, so fall through rather than trusting
    // the first answer.
    let out = await attempt("HEAD");
    if (out.status >= 400) out = await attempt("GET");
    return out;
  } catch (err) {
    return { status: 0, error: err.name === "AbortError" ? "timeout" : String(err.message || err) };
  }
}

function classify({ status, error }) {
  if (status >= 200 && status < 300) return "ok";
  // 405 means the host refused the method, not that the page is missing.
  if ([401, 403, 405, 429, 999].includes(status)) return "unverified";
  if (status === 0) return "unverified";
  return "broken";
}

async function main() {
  const only = process.argv[2];
  let entries = [...collect()];
  if (only) {
    entries = entries.filter(([, slugs]) => [...slugs].some((s) => s.includes(only)));
    if (!entries.length) {
      console.error(`no post matching "${only}"`);
      process.exit(1);
    }
  }

  console.log(`checking ${entries.length} distinct URLs across the posts\n`);

  const results = [];
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    const settled = await Promise.all(
      batch.map(async ([url, slugs]) => {
        const probed = await probe(url);
        return { url, slugs: [...slugs], ...probed, verdict: classify(probed) };
      })
    );
    for (const r of settled) {
      if (r.verdict !== "ok") {
        const detail = r.error ? r.error : `HTTP ${r.status}`;
        console.log(`  ${r.verdict.toUpperCase().padEnd(10)} ${detail.padEnd(22)} ${r.url}`);
      }
      results.push(r);
    }
  }

  const broken = results.filter((r) => r.verdict === "broken");
  const unverified = results.filter((r) => r.verdict === "unverified");

  console.log(
    `\n${results.length - broken.length - unverified.length} ok  ` +
      `${unverified.length} unverified  ${broken.length} broken`
  );

  if (broken.length) {
    console.log("\nbroken links, by post:");
    const byPost = new Map();
    for (const r of broken) {
      for (const s of r.slugs) {
        if (!byPost.has(s)) byPost.set(s, []);
        byPost.get(s).push(r);
      }
    }
    for (const [slug, rs] of [...byPost].sort()) {
      console.log(`\n  ${slug}`);
      for (const r of rs) console.log(`      HTTP ${r.status}  ${r.url}`);
    }
    console.log(
      "\nA broken citation is worse than no citation: it looks like grounding\n" +
        "and is not. Replace the URL or drop the claim it supports."
    );
  }

  if (unverified.length) {
    console.log(
      `\n${unverified.length} URLs refused automated checking (403/429/timeout).\n` +
        "That is not evidence they are broken — open them in a browser to confirm."
    );
  }

  process.exit(broken.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Tell Bing and Yandex that pages changed, instead of waiting to be recrawled.
//
//   npm run seo:indexnow                 URLs whose post file changed in HEAD
//   npm run seo:indexnow -- --all        every URL in the sitemap
//   npm run seo:indexnow -- <url> ...    exactly these
//   npm run seo:indexnow -- --dry-run    print what would be sent, send nothing
//
// Google does not participate in IndexNow — it ignores these submissions
// entirely, and the sitemap plus Search Console remain the only levers there.
// This is worth running anyway because Bing, Yandex, Seznam and Naver share one
// IndexNow network: submitting once reaches all of them, and Bing's index is
// what several AI assistants retrieve from.
//
// The protocol is deliberately unglamorous: host a file at
// /<key>.txt containing the key, then POST a JSON body of URLs. The key file
// proves you control the domain, so a submission for someone else's site fails.
//
// Submit changed URLs, not the whole site on every deploy. The endpoints treat
// repeated bulk submission of unchanged pages as spam, and the penalty is being
// ignored — which costs the one thing this is for.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const HOST = "www.sujitkarki.com.np";
const ORIGIN = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const PUBLIC_DIR = path.join(process.cwd(), "public");

// The key is whatever <key>.txt sits in public/. Deriving it from the file
// rather than hardcoding it means the two can never disagree — a mismatch is
// the single most common reason submissions are rejected, and it fails
// silently as a 403 rather than as anything that says "your key is wrong".
function findKey() {
  const candidates = fs
    .readdirSync(PUBLIC_DIR)
    .filter((f) => /^[0-9a-f]{8,128}\.txt$/i.test(f));

  if (candidates.length === 0) {
    console.error(
      "indexnow: no key file in public/. Create one with:\n" +
        "  node -e \"const k=require('crypto').randomBytes(16).toString('hex');" +
        "require('fs').writeFileSync('public/'+k+'.txt',k+'\\n');console.log(k)\""
    );
    process.exit(1);
  }
  if (candidates.length > 1) {
    console.error(`indexnow: more than one key file in public/: ${candidates.join(", ")}`);
    process.exit(1);
  }

  const file = candidates[0];
  const key = file.replace(/\.txt$/i, "");
  const contents = fs.readFileSync(path.join(PUBLIC_DIR, file), "utf8").trim();
  if (contents !== key) {
    console.error(
      `indexnow: ${file} must contain exactly its own filename-without-extension.\n` +
        `  expected: ${key}\n  found:    ${contents || "(empty)"}`
    );
    process.exit(1);
  }
  return key;
}

/** Post URLs whose MDX changed in the most recent commit. */
function changedInHead() {
  let files;
  try {
    files = execSync("git diff --name-only HEAD~1 HEAD -- content/posts", {
      encoding: "utf8",
    });
  } catch {
    console.error("indexnow: could not read git history. Pass URLs explicitly, or --all.");
    process.exit(1);
  }
  return files
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".mdx"))
    .map((line) => `${ORIGIN}/posts/${path.basename(line, ".mdx")}`);
}

/** Every URL in the built sitemap. */
function fromSitemap() {
  const sitemap = path.join(process.cwd(), ".next", "server", "app", "sitemap.xml.body");
  if (!fs.existsSync(sitemap)) {
    console.error(
      "indexnow: no built sitemap found. Run `npm run build` first, or pass URLs explicitly."
    );
    process.exit(1);
  }
  const xml = fs.readFileSync(sitemap, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const explicit = args.filter((a) => a.startsWith("http"));

  let urls;
  if (explicit.length) urls = explicit;
  else if (args.includes("--all")) urls = fromSitemap();
  else urls = changedInHead();

  // Every URL must be on the host the key authorises; the endpoint rejects the
  // whole batch over one stray domain rather than skipping it.
  const foreign = urls.filter((u) => !u.startsWith(`${ORIGIN}/`) && u !== ORIGIN);
  if (foreign.length) {
    console.error(`indexnow: these are not on ${HOST}:\n  ${foreign.join("\n  ")}`);
    process.exit(1);
  }

  urls = [...new Set(urls)];
  if (urls.length === 0) {
    console.log("indexnow: nothing changed in HEAD, nothing to submit.");
    return;
  }

  const key = findKey();
  console.log(`indexnow: ${urls.length} URL(s)`);
  for (const url of urls) console.log(`  ${url}`);

  if (dryRun) {
    console.log("\n--dry-run, nothing sent.");
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `${ORIGIN}/${key}.txt`,
      urlList: urls,
    }),
  });

  // 200 accepted, 202 accepted but the key is still being verified. Both mean
  // the batch landed; anything else did not.
  if (response.status === 200 || response.status === 202) {
    console.log(`\nsubmitted (HTTP ${response.status}).`);
    if (response.status === 202) {
      console.log(`key at ${ORIGIN}/${key}.txt is pending verification — normal on first use.`);
    }
    return;
  }

  const body = await response.text().catch(() => "");
  console.error(`\nindexnow: rejected with HTTP ${response.status}. ${body.slice(0, 300)}`);
  if (response.status === 403) {
    console.error(
      `A 403 means the endpoint could not read the key at ${ORIGIN}/${key}.txt — ` +
        `check it is deployed and served as text/plain.`
    );
  }
  process.exit(1);
}

main();

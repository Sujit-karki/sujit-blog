// Measures every post against the three content-quality signals that can be
// read straight out of the files: prose depth, primary-source grounding, and
// original interactive elements.
//
// This exists because the site's weakness is depth, not structure — an August
// 2026 audit found all 75 posts already carry a chart, a calculator or a
// source, while the median post ran only 637 words. Deepening posts is slow
// work spread over weeks, so it needs a repeatable measurement rather than a
// one-off count.
//
// Deliberately NOT a full quality score. Two of the five dimensions in the
// audit rubric — search demand and uniqueness against the live SERP — are not
// file properties and cannot be measured here; a fourth, trust/compliance, is
// rendered by the post template and so scores identically for every post. Read
// the output as an evidence floor: a low score is reliably thin, but a high
// score only means well-built, not that it deserves to rank.
//
//   npm run audit:posts              summary + the weakest posts
//   npm run audit:posts -- --all     every post
//   npm run audit:posts -- --json    machine-readable, for diffing over time
//   npm run audit:posts -- --min 2   exit 1 if any post scores below 2

import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// The agency that publishes the number, not a site paraphrasing it. Keep this
// list to genuine primary sources — adding aggregators would inflate the score
// and defeat the point of measuring sourcing at all.
const PRIMARY_SOURCES = [
  "irs.gov", "bls.gov", "ssa.gov", "sec.gov", "cbo.gov", "treasury.gov",
  "cms.gov", "medicare.gov", "cfpb.gov", "ftc.gov", "congress.gov", "gao.gov",
  "census.gov", "bea.gov", "dol.gov", "federalreserve.gov", "fred.stlouisfed.org",
  "newyorkfed.org", "stlouisfed.org", "usa.gov", "healthcare.gov",
  "studentaid.gov", "fdic.gov", "occ.gov", "finra.org", "nber.org", "eia.gov",
  "usgs.gov", "noaa.gov", "energy.gov", "hud.gov", "sba.gov", "pbgc.gov",
  // The regulators' own body, which publishes the insurance filings data
  // rather than summarising someone else's.
  "naic.org",
  // This site covers Nepal as well as the US, and the original list silently
  // scored every Nepali agency as if it were an aggregator. These publish
  // their own figures exactly as the US agencies above do.
  "dhm.gov.np", "drrportal.gov.np", "nea.org.np", "nepalarmy.mil.np",
  "mof.gov.np", "nrb.org.np", "cbs.gov.np", "icimod.org",
  // Multilateral bodies, included only where they publish the statistics
  // themselves rather than republishing a member state's.
  "oecd.org", "imf.org", "worldbank.org", "bis.org",
];

// A post that publishes its own dataset is the primary source for it. Scoring
// those as unsourced was backwards: the original-data posts are the best-
// grounded on the site, and the checker was marking them the worst.
//
// This originally matched a github.com/Sujit-karki/sujit-blog link, which no
// post carries any more: the repository is private, so those links served a
// login wall rather than data, and publish-data.mjs replaced them with files
// copied into public/data/. The pattern therefore never fired once, and
// local-ai-money-math-2026 — 2,000 words resting entirely on a dataset it
// publishes and links twice — scored as having no source at all. Match how a
// post actually publishes data now: a /data/<file> link or the dataFile
// attribute on the download block. publish-data.mjs already fails the build if
// either points at a file that is not there, so this cannot credit a dead link.
const OWN_DATA = /\(\/data\/[A-Za-z0-9._-]+|dataFile="[A-Za-z0-9._-]+"/;

const BANDS = [
  { name: "strong", min: 5 },
  { name: "solid", min: 3.5 },
  { name: "thin", min: 2 },
  { name: "weakest", min: 0 },
];

// The house standard every published post is expected to clear. Set from where
// the archive actually sits rather than an aspiration: as of September 2026 the
// median post runs ~830 words and two thirds are "solid" or better, so these are
// a floor the body of work already meets, not a stretch target.
//
// Enforced with `npm run audit:posts -- --check`, which exits non-zero on any
// indexed post below the line. noindex posts are exempt — they are deliberately
// out of the index and not held to it.
const STANDARD = {
  words: 500, // below this a post reads as a stub regardless of components
  primarySources: 1, // at least one link to the agency publishing the figures
  score: 3.5, // the "solid" band
};

function analyse(file) {
  // Two posts carry a UTF-8 BOM; gray-matter strips it at build time, so the
  // frontmatter regex below has to as well or their dates read as empty.
  const raw = fs
    .readFileSync(path.join(POSTS_DIR, file), "utf8")
    .replace(String.fromCharCode(0xfeff), "");

  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const frontmatter = match ? match[1] : "";
  const body = match ? raw.slice(match[0].length) : raw;

  const field = (key) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
  };

  // Strip JSX, code fences and link syntax so component-heavy posts aren't
  // credited for markup as though it were writing.
  // Order and anchoring both matter here. Paired components are removed first,
  // with a backreference so </InfoBox> can only close <InfoBox>. Self-closing
  // components are then matched with [^<] so the pattern cannot run from an
  // opening tag, past intervening prose, to some later component's "/>" —
  // which silently ate real paragraphs and under-counted component-heavy posts.
  const prose = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<([A-Z][A-Za-z0-9]*)[^<]*?>[\s\S]*?<\/\1>/g, " ")
    .replace(/<[A-Z][^<]*?\/>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  const words = prose.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w)).length;

  // Match on the hostname, not a substring of the whole URL: a bare
  // `includes("irs.gov")` would also count `notirs.gov` and any URL carrying
  // the string in its path or query.
  const urls = [...body.matchAll(/https?:\/\/[^\s)"'\]]+/g)].map((m) => m[0]);
  const primary = urls.filter((u) => {
    let host;
    try {
      host = new URL(u).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return false;
    }
    return PRIMARY_SOURCES.some((d) => host === d || host.endsWith("." + d));
  }).length + (OWN_DATA.test(body) ? 1 : 0);

  const components = [...new Set([...body.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]))];
  const charts = components.filter((c) => /Chart|Viz|Graph|Gauge/.test(c)).length;
  // Original presentation is not only calculators. A hand-built timeline or
  // tracker is the same kind of work — something made for this post rather
  // than prose wrapped around a link — and the original regex missed it.
  const tools = components.filter((c) =>
    /Calculator|Simulator|Estimator|Planner|Explorer|Interactive|Quiz|Comparison|Timeline|Tracker|Checklist/.test(c)
  ).length;

  const depthPts = words >= 1200 ? 2 : words >= 800 ? 1.5 : words >= 500 ? 1 : 0;
  const sourcePts = primary >= 3 ? 2 : primary >= 1 ? 1 : 0;
  const originalPts = charts > 0 && tools > 0 ? 2 : charts > 0 || tools > 0 ? 1 : 0;
  const score = depthPts + sourcePts + originalPts;

  return {
    slug: file.replace(/\.mdx$/, ""),
    date: field("date"),
    noindex: /^noindex:\s*true/m.test(frontmatter),
    words,
    primary,
    charts,
    tools,
    depthPts,
    sourcePts,
    originalPts,
    score,
    band: BANDS.find((b) => score >= b.min).name,
  };
}

const args = process.argv.slice(2);
const minIndex = args.indexOf("--min");
const minScore = minIndex !== -1 ? Number(args[minIndex + 1]) : null;

const posts = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map(analyse)
  .sort((a, b) => a.score - b.score || a.words - b.words);

if (args.includes("--json")) {
  console.log(JSON.stringify(posts, null, 2));
} else {
  const counts = posts.reduce((acc, p) => ({ ...acc, [p.band]: (acc[p.band] ?? 0) + 1 }), {});
  const median = [...posts].sort((a, b) => a.words - b.words)[Math.floor(posts.length / 2)].words;

  console.log(`\n${posts.length} posts · median ${median} words · score 0-6\n`);
  for (const { name } of BANDS) {
    console.log(`  ${name.padEnd(8)} ${String(counts[name] ?? 0).padStart(3)}`);
  }
  console.log(`\n  under 500 words   ${String(posts.filter((p) => p.words < 500).length).padStart(3)}`);
  console.log(`  no primary source ${String(posts.filter((p) => p.primary === 0).length).padStart(3)}`);

  const shown = args.includes("--all") ? posts : posts.filter((p) => p.score < 3.5);
  console.log(`\nscore  words  .gov  charts  tools  published    slug`);
  for (const p of shown) {
    console.log(
      [
        String(p.score).padStart(5),
        String(p.words).padStart(6),
        String(p.primary).padStart(5),
        String(p.charts).padStart(7),
        String(p.tools).padStart(6),
        "  " + (p.date || "—").padEnd(11),
        p.slug + (p.noindex ? "  [noindex]" : ""),
      ].join("")
    );
  }
  if (!args.includes("--all")) {
    console.log(`\n(${posts.length - shown.length} posts scoring 3.5+ hidden — pass --all to see them)`);
  }
}

if (minScore !== null) {
  const failing = posts.filter((p) => p.score < minScore && !p.noindex);
  if (failing.length > 0) {
    console.error(`\n${failing.length} post(s) below the minimum score of ${minScore}:`);
    for (const p of failing) console.error(`  ${p.score}  ${p.slug}`);
    process.exit(1);
  }
}

if (args.includes("--check")) {
  const failures = [];
  for (const post of posts) {
    if (post.noindex) continue; // deliberately out of the index, exempt
    const reasons = [];
    if (post.words < STANDARD.words) reasons.push(`${post.words} words (min ${STANDARD.words})`);
    if (post.primary < STANDARD.primarySources) reasons.push("no primary source");
    if (post.score < STANDARD.score) reasons.push(`score ${post.score} (min ${STANDARD.score})`);
    if (reasons.length) failures.push({ slug: post.slug, reasons });
  }

  const indexed = posts.filter((p) => !p.noindex).length;
  if (failures.length === 0) {
    console.log(`\nhouse standard: all ${indexed} indexed posts pass`);
    console.log(`  >=${STANDARD.words} words, >=${STANDARD.primarySources} primary source, score >=${STANDARD.score}`);
  } else {
    console.error(`\nhouse standard: ${failures.length} of ${indexed} indexed posts below the line`);
    console.error(`  >=${STANDARD.words} words, >=${STANDARD.primarySources} primary source, score >=${STANDARD.score}\n`);
    for (const f of failures) console.error(`  ${f.slug}\n      ${f.reasons.join(", ")}`);
    process.exit(1);
  }
}

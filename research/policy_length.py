"""How long is the privacy policy you agreed to, and could you read it?

  python policy_length.py
  python policy_length.py --json

Everyone clicks accept. Almost nobody reads. This measures what was actually
being asked — how many words, at what reading level, and how many minutes it
would take at a normal adult reading pace.

Deliberately narrow. It does NOT try to judge whether a policy is invasive, or
detect what data gets shared. An earlier experiment on this site attempted that
kind of qualitative scoring by keyword and produced confident numbers that were
wrong in both directions; the lesson taken from it is to measure only what a
count can honestly support. Word counts, readability formulas and reading time
are arithmetic. Whether a clause is reasonable is not, and is not attempted here.

Reading time uses 250 words per minute, a common benchmark for adult reading of
non-technical prose. Legal text is slower to read than that, so the minutes below
are optimistic — which is the safe direction for the argument.
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from readability import DATA_DIR, analyse, clean, fetch, text_from_html, text_from_pdf

WORDS_PER_MINUTE = 250

# Only policies that returned a clean 200 on a direct fetch. Several major apps
# block automated requests or resolve unreliably and are listed as excluded
# rather than silently omitted.
POLICIES = [
    ("YNAB", "https://www.ynab.com/privacy-policy", "html"),
    ("Monarch Money", "https://monarchmoney.com/privacy", "html"),
    ("Empower", "https://docs.empower.com/Empower/privacy/Empower-privacy-policy.pdf", "pdf"),
    ("Goodbudget", "https://goodbudget.com/privacy-policy/", "html"),
]

EXCLUDED = [
    ("PocketGuard", "blocks automated requests (403)"),
    ("EveryDollar", "privacy URL returns 404"),
    ("Copilot", "privacy URL returns 404"),
    ("Mint", "no stable response"),
    ("Simplifi", "no stable response"),
]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    results, failures = [], []
    for name, url, fmt in POLICIES:
        try:
            raw = fetch(url)
            text = clean(text_from_pdf(raw) if fmt == "pdf" else text_from_html(raw))
            stats = analyse(text)
            if stats is None:
                failures.append(f"{name}: too little extractable prose")
                continue
            minutes = stats["words"] / WORDS_PER_MINUTE
            results.append({"name": name, "url": url, "reading_minutes": round(minutes, 1), **stats})
            print(f"  {name:<15}{stats['words']:>7} words  {minutes:>5.1f} min  "
                  f"ease {stats['flesch_reading_ease']:>5}  grade {stats['flesch_kincaid_grade']:>5}", flush=True)
        except Exception as exc:  # noqa: BLE001
            failures.append(f"{name}: {type(exc).__name__} {exc}")
            print(f"  {name:<15}FAILED: {exc}", flush=True)

    payload = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "wordsPerMinute": WORDS_PER_MINUTE,
        "method": "Word count, Flesch readability, and reading time over extracted policy text",
        "scope": "Length and readability only. No judgement of what the policies permit.",
        "policies": results,
        "failures": failures,
        "excluded": [{"name": n, "reason": r} for n, r in EXCLUDED],
    }
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "policy-length.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    if args.json:
        print(json.dumps(payload, indent=2))
        return 0

    if results:
        total = sum(r["words"] for r in results)
        mins = total / WORDS_PER_MINUTE
        print(f"\n{'policy':<15}{'words':>8}{'minutes':>9}{'ease':>7}{'grade':>7}")
        for r in sorted(results, key=lambda x: -x["words"]):
            print(f"{r['name']:<15}{r['words']:>8}{r['reading_minutes']:>9}"
                  f"{r['flesch_reading_ease']:>7}{r['flesch_kincaid_grade']:>7}")
        print(f"\nall four: {total:,} words, {mins:.0f} minutes at {WORDS_PER_MINUTE} wpm")
        avg_grade = sum(r["flesch_kincaid_grade"] for r in results) / len(results)
        print(f"mean grade level: {avg_grade:.1f}")
    for f in failures:
        print(f"note: {f}")
    print(f"\nwrote {DATA_DIR / 'policy-length.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

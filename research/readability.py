"""How hard are crypto whitepapers to read?

  pip install pypdf
  python readability.py
  python readability.py --json

Every crypto project asks people to read its whitepaper before putting money in.
This measures whether that is a reasonable request, using the same readability
formulas schools and government plain-language guidelines use.

Why formulas rather than a model. The previous experiment on this site tried to
score qualitative text by keyword and the metric was wrong in both directions.
Readability indices are deterministic arithmetic over counts of sentences, words
and syllables — no judgement, no vocabulary list, reproducible to the decimal by
anyone with the same text. That is the right instrument for this question, and
the lesson from the failure is to use one.

  Flesch Reading Ease   206.835 - 1.015 (words/sentence) - 84.6 (syllables/word)
                        higher is easier; 60-70 is "plain English"
  Flesch-Kincaid Grade  0.39 (words/sentence) + 11.8 (syllables/word) - 15.59
                        approximate US school grade needed to read it

Both are crude — they measure sentence and word length, not conceptual
difficulty, and a document full of short sentences about elliptic curves will
score as easy. That limitation is stated in the output and belongs in anything
published from it.
"""

from __future__ import annotations

import argparse
import io
import json
import re
import urllib.request
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)

# Documents that are genuinely the project's own foundational text, reachable
# without an API key, and stable enough to re-fetch. Reference documents at the
# end give the numbers a scale a reader already understands.
DOCUMENTS = [
    ("Bitcoin", "whitepaper", "https://bitcoin.org/bitcoin.pdf", "pdf"),
    ("Solana", "whitepaper", "https://solana.com/solana-whitepaper.pdf", "pdf"),
    ("Ethereum", "whitepaper", "https://ethereum.org/en/whitepaper/", "html"),
    ("Ripple", "whitepaper", "https://ripple.com/files/ripple_consensus_whitepaper.pdf", "pdf"),
    ("Cardano (Ouroboros)", "whitepaper", "https://cardano.org/ouroboros/", "html"),
    ("Chainlink", "whitepaper", "https://research.chain.link/whitepaper-v2.pdf", "pdf"),
    ("Monero", "whitepaper", "https://www.getmonero.org/library/Zero-to-Monero-2-0-0.pdf", "pdf"),
    ("Tezos", "whitepaper", "https://tezos.com/whitepaper.pdf", "pdf"),
    # The five below are attempted every run and currently do not resolve. They
    # stay in the list rather than being deleted: a candidate that 404s is a
    # result about the genre, and a corpus you can silently prune is a corpus
    # that drifts towards whatever happens to flatter the argument.
    ("Polkadot", "whitepaper", "https://polkadot.com/papers/Polkadot-whitepaper.pdf", "pdf"),
    ("Filecoin", "whitepaper", "https://filecoin.io/filecoin.pdf", "pdf"),
    ("Algorand", "whitepaper", "https://www.algorand.com/technology", "html"),
    ("Avalanche", "whitepaper", "https://www.avalabs.org/whitepapers", "html"),
    ("Litecoin", "whitepaper", "https://litecoin.org/", "html"),
]

# Reference points a reader already has an intuition for, so the whitepaper
# scores land on a scale rather than floating free.
REFERENCES = [
    ("US Constitution", "reference", "https://www.archives.gov/founding-docs/constitution-transcript", "html"),
    ("IRS Publication 17", "reference", "https://www.irs.gov/publications/p17", "html"),
    ("FTC crypto scam guide", "reference", "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams", "html"),
    ("Wikipedia: Blockchain", "reference", "https://en.wikipedia.org/wiki/Blockchain", "html"),
    ("Alice in Wonderland", "reference", "https://www.gutenberg.org/cache/epub/11/pg11.txt", "text"),
]


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def text_from_pdf(raw: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(raw))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def text_from_html(raw: bytes) -> str:
    html = raw.decode("utf-8", errors="ignore")
    # Drop the parts that are not prose before counting sentences.
    html = re.sub(r"(?is)<(script|style|nav|header|footer|svg)[^>]*>.*?</\1>", " ", html)
    text = re.sub(r"(?s)<[^>]+>", " ", html)
    text = (
        text.replace("&nbsp;", " ").replace("&amp;", "&")
        .replace("&lt;", "<").replace("&gt;", ">").replace("&#x27;", "'")
        .replace("&quot;", '"').replace("&#39;", "'")
    )
    return text


def clean(text: str) -> str:
    text = re.sub(r"https?://\S+", " ", text)     # URLs skew word length
    text = re.sub(r"\[\d+\]", " ", text)          # citation markers
    text = re.sub(r"[^\x20-\x7E\n]", " ", text)   # PDF ligature debris
    return re.sub(r"\s+", " ", text).strip()


def count_syllables(word: str) -> int:
    """Standard heuristic: vowel groups, minus a silent trailing e, minimum 1."""
    word = word.lower()
    groups = re.findall(r"[aeiouy]+", word)
    n = len(groups)
    if word.endswith("e") and not word.endswith(("le", "ee", "ye")) and n > 1:
        n -= 1
    return max(1, n)


def analyse(text: str) -> dict | None:
    sentences = [s for s in re.split(r"[.!?]+(?:\s|$)", text) if len(s.split()) >= 3]
    words = re.findall(r"[A-Za-z][A-Za-z'-]*", text)
    if len(sentences) < 5 or len(words) < 200:
        return None

    syllables = sum(count_syllables(w) for w in words)
    wps = len(words) / len(sentences)
    spw = syllables / len(words)
    complex_words = sum(1 for w in words if count_syllables(w) >= 3)

    return {
        "words": len(words),
        "sentences": len(sentences),
        "words_per_sentence": round(wps, 2),
        "syllables_per_word": round(spw, 3),
        "complex_word_pct": round(100 * complex_words / len(words), 1),
        "flesch_reading_ease": round(206.835 - 1.015 * wps - 84.6 * spw, 1),
        "flesch_kincaid_grade": round(0.39 * wps + 11.8 * spw - 15.59, 1),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    results, failures = [], []
    for name, kind, url, fmt in DOCUMENTS + REFERENCES:
        try:
            raw = fetch(url)
            if fmt == "pdf":
                extracted = text_from_pdf(raw)
            elif fmt == "text":
                extracted = raw.decode("utf-8", errors="ignore")
            else:
                extracted = text_from_html(raw)
            text = clean(extracted)
            stats = analyse(text)
            if stats is None:
                failures.append(f"{name}: too little extractable prose")
                continue
            results.append({"name": name, "kind": kind, "url": url, **stats})
            print(f"  {name:<18} {stats['words']:>6} words  ease {stats['flesch_reading_ease']:>6}"
                  f"  grade {stats['flesch_kincaid_grade']:>5}", flush=True)
        except Exception as exc:  # noqa: BLE001 - report and continue
            failures.append(f"{name}: {type(exc).__name__} {exc}")
            print(f"  {name:<18} FAILED: {exc}", flush=True)

    payload = {
        "generatedAt": __import__("time").strftime("%Y-%m-%dT%H:%M:%S"),
        "method": "Flesch Reading Ease and Flesch-Kincaid Grade Level over extracted text",
        "caveat": "Readability formulas measure sentence and word length, not conceptual difficulty.",
        "documents": results,
        "failures": failures,
    }
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "readability.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    if args.json:
        print(json.dumps(payload, indent=2))
        return 0

    print(f"\n{'document':<18}{'ease':>7}{'grade':>7}{'w/sent':>8}{'complex%':>10}")
    for r in sorted(results, key=lambda x: x["flesch_reading_ease"]):
        print(f"{r['name']:<18}{r['flesch_reading_ease']:>7}{r['flesch_kincaid_grade']:>7}"
              f"{r['words_per_sentence']:>8}{r['complex_word_pct']:>10}")
    for f in failures:
        print(f"note: {f}")
    print(f"\nwrote {DATA_DIR / 'readability.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

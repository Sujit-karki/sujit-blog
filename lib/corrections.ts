// The corrections log.
//
// The /corrections page used to state a policy and list nothing, which is the
// weak form of this page: anyone can promise to correct errors. The log is the
// part that costs something, so it is the part worth publishing.
//
// Add an entry whenever a published post's substance changes because it was
// wrong — not for typos, formatting, or a swapped-out dead link that supported
// the same claim. Each entry must also appear as a visible correction note in
// the post itself; this page is an index of those, not a replacement for them.

export interface Correction {
  /** Post slug, so the entry links to the corrected post. */
  slug: string;
  /** The post's title at the time of writing the entry. */
  title: string;
  /** ISO date the correction was published. */
  date: string;
  /** What the post said before. */
  wasWrong: string;
  /** What it says now, and why the first version was wrong. */
  correction: string;
  /** Who or what caught it — self-caught is still worth stating plainly. */
  foundBy: string;
}

export const corrections: Correction[] = [
  {
    slug: "crypto-whitepaper-readability-2026",
    title: "Seven of Eight Crypto Whitepapers Are Harder to Read Than the Tax Code",
    date: "2026-09-07",
    wasWrong:
      "Published with five documents and the headline claim that every crypto whitepaper measured is harder to read than the tax code.",
    correction:
      "Widening the corpus to thirteen attempts, of which eight resolved, falsified it. Monero's Zero to Monero scores 52.1, above IRS Publication 17's 49.7. The finding is now stated as seven of eight, and the exception is discussed rather than dropped. The original five scores were unchanged — the claim was simply too strong for the sample it rested on.",
    foundBy: "Self-caught, by widening the sample after publication.",
  },
  {
    slug: "2027-tax-brackets-projected",
    title: "2027 Tax Brackets: What's Projected vs. What's Official",
    date: "2026-09-07",
    wasWrong:
      "Gave the projected single-filer standard deduction as $16,600, with ranges for the joint and head-of-household figures.",
    correction:
      "The rounding was wrong. I had inferred it from the pattern in the published 2026 figures rather than reading 26 U.S.C. §1(f)(7)(A), which rounds the increase to the next lowest $50 — not the adjusted total to the nearest $50. The corrected figure is $16,550, and the ranges were an artefact of the wrong method.",
    foundBy: "Self-caught, while checking the statute rather than the pattern.",
  },
  {
    slug: "aca-premiums-2027-subsidy-cliff",
    title: "Obamacare Premiums Are Jumping Again in 2027 — and the Subsidy Cliff Is Back",
    date: "2026-09-07",
    wasWrong:
      "Gave the single-person subsidy cliff as roughly $62,600.",
    correction:
      "The correct figure from the 2026 HHS poverty guidelines is $63,840. This one mattered in the damaging direction: it would have told someone earning $63,000 they had lost all subsidy when they had not.",
    foundBy: "Self-caught, on re-checking against the HHS guidelines.",
  },
  {
    slug: "when-to-book-holiday-flights-2026",
    title: "When to Book Holiday Flights in 2026: The Data, Not the Hype",
    date: "2026-09-07",
    wasWrong:
      "Reported a 17.6% seasonal spread in airfares, with November and December both below average.",
    correction:
      "The analysis averaged the raw index by calendar month without removing the price trend. Airfares rose 25% across the sample, and months missing a 2026 reading were dragged down by its absence. The real spread is about 10 points, and November is slightly above average — the opposite of what the post advised.",
    foundBy: "Self-caught, while building a separate analysis on the same series.",
  },
];

/** Newest first, so the page does not depend on array order being maintained. */
export function correctionsByDate(): Correction[] {
  return [...corrections].sort((a, b) => b.date.localeCompare(a.date));
}

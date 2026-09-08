import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Accessibility regressions are invisible in review — nothing looks broken, and
// the person who hits the problem is not the person who shipped it. axe catches
// the machine-checkable subset: contrast, names, roles, landmarks, heading
// order. It cannot tell you whether the page makes sense read aloud, so passing
// this is a floor and not a certificate.
//
// Scoped to WCAG 2 A and AA, which is the bar the site's own design notes set.

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// One page per template, because a violation is nearly always a template bug
// rather than a content bug — checking every post would find the same defect 84
// times and slow the suite for nothing.
const PAGES: Array<{ name: string; path: string }> = [
  { name: "homepage", path: "/" },
  { name: "research hub", path: "/research" },
  { name: "data post", path: "/posts/platform-take-rates-2026" },
  { name: "tools index", path: "/tools" },
  { name: "calculator", path: "/tools/trump-account-vs-529" },
  { name: "about", path: "/about" },
];

for (const { name, path } of PAGES) {
  test(`${name} has no detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);
    // Charts mount on the client; scanning before they render would check a
    // skeleton and pass regardless of what the real chart does.
    await page.waitForLoadState("networkidle");

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();

    // Name the rule and the element rather than asserting a bare count, so a
    // failure is actionable from the CI log without reproducing it locally.
    const summary = violations.map(
      (v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes[0]?.target.join(" ")}`
    );
    expect(summary, `axe violations on ${path}`).toEqual([]);
  });
}

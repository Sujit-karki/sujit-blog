import { expect, test } from "@playwright/test";

// Visual regression for the chart components.
//
// These are the pieces most likely to break silently. A chart draws to a
// canvas, so nothing in the DOM changes shape when a colour token moves, an
// axis stops rendering, or a legend overlaps the plot — the unit tests still
// pass and the page still looks alive. A pixel comparison is the only check
// that notices.
//
// SNAPSHOTS ARE PER-PLATFORM. Font rasterisation and canvas antialiasing differ
// between Windows and Linux, so a baseline recorded on one will never match the
// other. Playwright encodes the platform in the snapshot filename, which is why
// the committed baselines end in -win32 and CI needs its own -linux set. See
// the visual job in .github/workflows/ci.yml: it stays dormant until a linux
// baseline is committed, rather than failing every build until someone
// generates one.
//
//   npm run test:visual                     compare against the baselines
//   npm run test:visual -- --update-snapshots   re-record after an intended change

const CHART_POST = "/posts/local-ai-money-math-2026";

test.describe("chart rendering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CHART_POST);
    await page.waitForLoadState("networkidle");
    // Chart.js animates on mount and draws to a canvas, where Playwright's
    // animation freezing does not reach. Wait for the animation to finish
    // rather than racing it, or the diff is measuring the animation's progress.
    await page.waitForTimeout(1200);
  });

  test("bar chart matches its baseline", async ({ page }) => {
    const figure = page.locator("figure").filter({ has: page.locator("canvas") }).first();
    await expect(figure).toBeVisible();
    await expect(figure).toHaveScreenshot("bar-chart.png", {
      // A canvas never rasterises identically twice across machines. This is
      // loose enough to absorb antialiasing and tight enough that a missing
      // series, a shifted axis or a colour change still fails.
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("chart data-table fallback matches its baseline", async ({ page }) => {
    // The table is the accessible representation of the chart, so it is worth
    // guarding on its own — it can break while the canvas still looks correct.
    const table = page.locator("figure table").first();
    await expect(table).toBeVisible();
    await expect(table).toHaveScreenshot("chart-data-table.png", {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    });
  });
});

test("comparison table matches its baseline", async ({ page }) => {
  await page.goto("/posts/platform-take-rates-2026");
  await page.waitForLoadState("networkidle");
  const table = page.locator("table").first();
  await expect(table).toBeVisible();
  await expect(table).toHaveScreenshot("comparison-table.png", {
    maxDiffPixelRatio: 0.01,
    animations: "disabled",
  });
});

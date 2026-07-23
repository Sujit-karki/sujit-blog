import { expect, test } from "@playwright/test";

test("homepage loads and shows the site name", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Lampard/i);
});

test("homepage links to at least one post", async ({ page }) => {
  await page.goto("/");
  const postLinks = page.locator('a[href^="/posts/"]');
  await expect(postLinks.first()).toBeVisible();
});

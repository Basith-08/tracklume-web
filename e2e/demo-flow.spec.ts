import { expect, test } from "@playwright/test";

test("demo workspace flow: login, create, move, inspect, logout", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@issueflow.local");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/projects$/);

  const projectLink = page.locator('a[href^="/projects/"]').first();
  await expect(projectLink).toBeVisible();
  await projectLink.click();
  await page.getByRole("button", { name: /new issue/i }).click();
  const title = `Demo issue from Playwright ${Date.now()}`;
  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: /create issue/i }).click();

  await page.getByRole("link", { name: "Board" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.getByText(title, { exact: true }).click();
  await page.locator("select").first().selectOption("in_progress");
  await expect(page.locator("select").first()).toHaveValue("in_progress");

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

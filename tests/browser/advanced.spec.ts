import { test, expect } from "@playwright/test";
test.beforeEach(async ({ request, page }) => {
  page.on("pageerror", (e) => console.error("PAGE ERROR", e.message));
  expect((await (await request.get("/api/status")).json()).mode).toBe(
    process.env.TEST_LIVE === "1" ? "live" : "rehearsal",
  );
});
test("skills load shopper instructions before giving product advice", async ({
  page,
}) => {
  await page.goto("/#skills");
  await page.getByRole("button", { name: "Ask the shop assistant" }).click();
  await expect(page.locator(".loaded-skill")).toContainText("beach-shopper", {
    timeout: 45000,
  });
  await expect(page.getByRole("status")).toHaveText("Run complete", {
    timeout: 45000,
  });
  await expect(page.locator(".skill-answer")).toContainText(/18/);
  await expect(page.locator(".skill-answer")).toContainText(/towel/i);
  await page.getByText("Read the loaded instructions").click();
  await expect(page.locator(".loaded-skill")).toContainText(
    "catalog",
  );
  await page.screenshot({
    path: "test-results/06-skills.png",
    animations: "disabled",
    fullPage: true,
  });
});
test("Code Mode executes a generated program and returns correct aggregate costs", async ({
  page,
}) => {
  await page.goto("/#codemode");
  await page.getByRole("button", { name: "Audit the meetings" }).click();
  await expect(page.locator(".cost-results")).toBeVisible({ timeout: 50000 });
  await expect(page.locator(".cost-results h2")).toHaveText("€11,870 / week");
  await expect(page.locator(".cost-results")).toContainText("leadership");
  await expect(page.locator(".advanced-result .syntax")).toContainText(
    "external_team_costs",
  );
  await expect(page.getByRole("status")).toHaveText("Run complete", {
    timeout: 45000,
  });
  await page.screenshot({
    path: "test-results/07-code-mode.png",
    animations: "disabled",
    fullPage: true,
  });
});
test("native WebMCP discovers tools, model calls them, and page changes", async ({
  page,
}) => {
  test.skip(
    process.env.TEST_NATIVE !== "1",
    "Native Chrome verification is opt-in.",
  );
  await page.goto("/#webmcp");
  await expect(page.locator(".native-status")).toContainText(
    "2 tools discovered",
  );
  await page.getByRole("button", { name: "Ask the page agent" }).click();
  await expect(page.locator(".webmcp-store")).toHaveAttribute(
    "data-theme-name",
    "lavender",
    { timeout: 45000 },
  );
  await expect(page.locator(".grid-summary")).toContainText(
    "3 items · up to €10 · in stock only",
  );
  await expect(page.getByLabel("Browser tool executions")).toContainText(
    "alicante_filter_catalog",
  );
  await expect(page.getByLabel("Browser tool executions")).toContainText(
    "alicante_set_theme",
  );
  await expect(page.getByRole("status")).toHaveText("Run complete", {
    timeout: 45000,
  });
  await page.screenshot({
    path: "test-results/08-webmcp.png",
    animations: "disabled",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Explain the code" }).click();
  await expect.poll(async () => page.evaluate(async () => {
    const mc = (document as any).modelContext;
    return mc ? (await mc.getTools()).filter((t: any) => t.name.startsWith('alicante_')).length : 0;
  })).toBe(0);
});

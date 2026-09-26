import { test, expect } from "@playwright/test";
import { rcById } from "../../src/rc-topics";
import { chapters as allChapters, lessons } from "../../src/lessons";
const chapters = allChapters.filter(c => c.lesson !== 6);
test("complete feature-demo-code sequence, image opening, notes and no auto requests", async ({
  page,
}) => {
  await page.goto("/#welcome");
  let requests = 0;
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().includes("/api/")) requests++;
  });
  await expect(page.getByAltText(/React Alicante — Building/)).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    /shiphappens|eleven minutes|11:00/i,
  );
  for (let i = 0; i < chapters.length; i++) {
    const c = chapters[i];
    await expect(page).toHaveURL(new RegExp("#" + c.id + "$"));
    await expect(
      page.getByRole("button", { name: "Choose slide" }),
    ).toHaveText(new RegExp(`^${String(i + 1).padStart(2, "0")}\\s*/\\s*${chapters.length}$`));
    await page.keyboard.press("n");
    await expect(page.locator(".speaker-notes")).not.toBeEmpty();
    await page.keyboard.press("Escape");
    await expect(page.locator(".speaker-notes")).toHaveCount(0);
    if (c.kind === "code" || c.kind === "rc") {
      const lesson = c.kind === "rc" ? rcById[c.id] : lessons[c.lesson!];
      for (let step = 0; step < lesson.steps.length; step++) {
        await expect(page.locator(".code-slide h1")).toHaveText(
          c.kind === "rc" ? rcById[c.id].title : lesson.steps[step].title,
        );
        await expect(page.locator(".syntax .token").first()).toBeVisible();
        if (step < lesson.steps.length - 1)
          await page.keyboard.press("ArrowRight");
      }
    }
    if (i < chapters.length - 1)
      await page.getByRole("button", { name: "Next reveal or slide" }).click();
  }
  expect(requests).toBe(0);
  await expect(page.getByAltText(/QR code/)).toBeVisible();
  await page.keyboard.press("Home");
  await expect(page).toHaveURL(/#welcome$/);
  await page.getByRole("button", { name: "Choose slide" }).click();
  await page.getByRole("button", { name: /How the pieces connect/ }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await page.reload();
  await expect(page.locator("h1")).toContainText("Your React app");
});
test("completed state survives navigating to explained code and back", async ({
  page,
}) => {
  test.skip(process.env.TEST_LIVE === "1", "fixture-only navigation check");
  await page.goto("/#shopchat");
  await page.getByRole("button", { name: "Ask the assistant" }).click();
  await expect(page.getByRole("status")).toHaveText("Run complete");
  const result = await page.locator(".shopchat-text").innerText();
  await page.getByRole("button", { name: "Explain the code" }).click();
  await expect(page).toHaveURL(/#shopchat-code$/);
  await page.getByText("Return to the live demo").click();
  await expect(page.locator(".shopchat-text")).toHaveText(result);
  await page.getByLabel("Ask about the products").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#shopchat$/);
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator(".shopchat-text")).toContainText("What would you like");
});
test("dark theme and motion preferences persist", async ({ page }) => {
  await page.goto("/#toolkit");
  await page.getByRole("button", { name: "Toggle dark theme" }).click();
  await page.getByRole("button", { name: "Motion on" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
});
for (const width of [320, 768, 1440])
  test(`all ${chapters.length} slides fit ${width}px with code and QR accessible`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const c of chapters) {
      await page.goto("/#" + c.id);
      await expect(
        page.getByRole("button", { name: "Choose slide" }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      expect(
        await page
          .locator(".deck-stage")
          .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      ).toBeTruthy();
    }
    await page.getByAltText(/QR code/).scrollIntoViewIfNeeded();
    await expect(page.getByAltText(/QR code/)).toBeInViewport();
    await page.screenshot({
      path: `test-results/new-deck-${width}.png`,
      animations: "disabled",
    });
  });

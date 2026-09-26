import { test, expect } from '@playwright/test';

test.skip('real Skillbox guides product advice and return-policy answers', async ({ page, request }) => {
  test.skip(process.env.TEST_LIVE !== '1', 'Requires the real Skillbox service and provider.');
  test.setTimeout(110000);
  const library = await (await request.get('/api/skillbox')).json();
  expect(library.mode).toBe('live');
  expect(library.skills.map((s: { name: string }) => s.name)).toEqual(['beach-shopper', 'returns-guide']);
  await page.goto('/lightning.html#skills');
  await expect(page.locator('.skillbox-status')).toContainText('Live Skillbox');
  await page.getByRole('button', { name: 'Help me choose products' }).click();
  await page.getByRole('button', { name: 'Ask the shop assistant' }).click();
  await expect(page.locator('.loaded-skill').first()).toContainText('beach-shopper', { timeout: 45000 });
  await expect(page.locator('.skillbox-receipt').first()).toContainText(library.skills[0].metadata.revision.slice(0, 8));
  await expect(page.getByRole('status')).toHaveText('Run complete', { timeout: 45000 });
  await expect(page.locator('.skill-answer')).toContainText('€18');
  await page.screenshot({ path: 'test-results/skillbox-launch.png', fullPage: true });
  await page.getByRole('button', { name: 'Can I return it?' }).click();
  await page.getByRole('button', { name: 'Ask the shop assistant' }).click();
  await expect(page.locator('.loaded-skill').last()).toContainText('returns-guide', { timeout: 45000 });
  await expect(page.locator('.skillbox-receipt').last()).toContainText(library.skills[1].metadata.revision.slice(0, 8));
  await expect(page.getByRole('status')).toHaveText('Run complete', { timeout: 45000 });
  await expect(page.locator('.skill-answer')).toContainText(/unused|used/i);
  await expect(page.locator('.skill-answer')).toContainText(/30/);
  await page.screenshot({ path: 'test-results/skillbox-incident.png', fullPage: true });
  await page.getByRole('button', { name: 'Explain the code' }).click();
  await expect(page).toHaveURL(/#skills-code$/);
  await expect(page.locator('.demo-code-slide .syntax .token').first()).toBeVisible();
});

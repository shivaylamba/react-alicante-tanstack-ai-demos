import { test, expect } from '@playwright/test';
import { lightningChapters } from '../../src/lightning';
test('reading guide matches the deck and supports phone navigation', async ({page, request}) => {
  const notes = await (await request.get('/speaker-notes/slides.json')).json();
  expect(notes.map((n:any)=>n.anchor)).toEqual(lightningChapters.map(c=>c.id));
  expect(JSON.stringify(notes)).not.toContain('Skillbox');
  await page.setViewportSize({width:390,height:844});
  await page.goto('/speaker-notes/#meme-budget');
  await expect(page.locator('#joke')).toBeVisible();
  await expect(page.locator('#jokeExplanation')).toContainText('towel');
  await page.getByRole('button',{name:'Next →',exact:true}).click();
  await expect(page.locator('h1')).toHaveText('Human approval');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

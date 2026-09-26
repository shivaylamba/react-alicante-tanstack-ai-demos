import { test, expect } from '@playwright/test';
import { lightningChapters, lightningNotes } from '../../src/lightning';
test('short deck follows the paced route, with Jev immediately before WebMCP', async ({page}) => {
  let modelRequests=0;
  page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/'))modelRequests++;});
  await page.goto('/lightning.html#welcome');
  await expect(page.getByAltText(/React Alicante — Building/)).toBeVisible();
  expect(Object.values(lightningNotes).reduce((total,n)=>total+n.seconds,0)).toBe(585);
  const demos=lightningChapters.filter(c=>c.kind==='demo');
  expect(demos.map(c=>c.id)).toEqual(['shopchat','product','agent','approval','jev','webmcp']);
  expect(demos[demos.findIndex(c=>c.id==='jev')+1].id).toBe('webmcp');
  for(const d of demos)expect(lightningChapters[lightningChapters.indexOf(d)+1].id).toBe(d.id+'-code');
  expect(lightningChapters.slice(0,5).map(c=>c.id)).toEqual(['welcome','toolkit','how-it-works','alicante','demo-roadmap']);
  for(const [i,c] of lightningChapters.entries()){
    await expect(page).toHaveURL(new RegExp('/lightning.html#'+c.id+'$'));
    await expect(page.getByRole('button',{name:'Choose slide'})).toHaveText(new RegExp(`^${String(i+1).padStart(2,'0')}\\s*/\\s*${lightningChapters.length}$`));
    await expect(page.locator('main')).not.toContainText(/0:15|1:30|10:40|11:00/);
    await page.keyboard.press('n');
    await expect(page.locator('.speaker-notes')).not.toBeEmpty();
    await expect(page.locator('.pacing-note')).toContainText(lightningNotes[c.id].window);
    await page.keyboard.press('Escape');
    await expect(page.locator('.speaker-notes')).toHaveCount(0);
    if(c.kind==='meme'){await expect(page.locator('.meme-panel')).toHaveCount(2);await expect(page.locator('.meme-punchline')).not.toBeEmpty();}
    if(c.kind==='demo-code'){await expect(page.locator('.demo-code-slide .syntax')).toHaveCount(2);await expect(page.locator('.demo-code-slide .syntax .token').first()).toBeVisible();}
    if(c.id==='one-pattern')await expect(page.locator('.syntax .token').first()).toBeVisible();
    if(c.id==='demo-roadmap')await expect(page.locator('.capability-row')).toHaveCount(6);
    if(c.id==='more')await expect(page.locator('.capability-row')).toHaveCount(8);
    if(i<lightningChapters.length-1)await page.getByRole('button',{name:'Next reveal or slide'}).click();
  }
  await expect(page.getByAltText(/QR code/)).toBeVisible();
  expect(modelRequests).toBe(0);
  await page.goto('/#welcome');
  await expect(page.getByRole('button',{name:'Choose slide'})).toHaveText(/01\s*\/\s*38/);
});
test('short page WebMCP executes then unregisters when moving to the code summary',async({page})=>{
  test.skip(process.env.TEST_NATIVE!=='1','Requires native Chrome WebMCP');
  await page.goto('/lightning.html#webmcp');
  await expect(page.locator('.native-status')).toContainText('2 tools discovered');
  await page.getByRole('button',{name:'Ask the page agent'}).click();
  await expect(page.locator('.webmcp-store')).toHaveAttribute('data-theme-name','lavender',{timeout:45000});
  await expect(page.locator('.grid-summary')).toContainText('3 items · up to €10 · in stock only');
  await expect(page.getByRole('status')).toHaveText('Run complete',{timeout:45000});
  await expect(page.locator('.webmcp-store .demo-punchline')).toContainText('lavender');
  await page.getByRole('button',{name:'Explain the code'}).click();
  await expect(page).toHaveURL(/lightning.html#webmcp-code$/);
  await expect(page.locator('.demo-code-slide .syntax')).toHaveCount(2);
  await page.getByRole('button',{name:'Next reveal or slide'}).click();
  await expect(page).toHaveURL(/lightning.html#one-pattern$/);
  await expect.poll(async()=>page.evaluate(async()=>{
    const mc=(document as any).modelContext;
    return (await mc.getTools()).filter((t:any)=>t.name.startsWith('alicante_')).length;
  })).toBe(0);
});
for(const width of [320,768,1440])test(`short deck fits ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  for(const c of lightningChapters){
    await page.goto('/lightning.html#'+c.id);
    await expect(page.getByRole('button',{name:'Choose slide'})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    expect(await page.locator('.deck-stage').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBeTruthy();
  }
});

test('startup presets edit the prompt without submitting and success jokes wait for results', async({page})=>{
  let requests=0;
  page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/'))requests++;});
  await page.goto('/#shopchat');
  await page.getByRole('button',{name:'What is in stock?',exact:true}).click();
  await expect(page.getByLabel('Ask about the products')).toHaveValue(/in stock/);
  await page.getByRole('button',{name:'Keep it under €10',exact:true}).click();
  await expect(page.getByLabel('Ask about the products')).toHaveValue(/€10/);
  expect(requests).toBe(0);
  await page.goto('/lightning.html#product');
  await expect(page.locator('.demo-punchline')).toHaveCount(0);
  await page.getByRole('button',{name:'Compare products'}).click();
  await expect(page.locator('.product-preview')).toBeVisible();
  await expect(page.locator('.product-preview')).toContainText('Beach Towel');
});

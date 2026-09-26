import { test, expect } from '@playwright/test';
import { mayHide } from '../../src/contracts';
const demoURL=(hash:string)=>(process.env.TEST_SHORT==='1'?'/lightning.html':'/')+hash;
test.beforeEach(async({request})=>{
 const status=await (await request.get('/api/status')).json();
 expect(status.mode).toBe(process.env.TEST_LIVE==='1'?'live':'rehearsal');
});
test('streaming text arrives and Stop cancels a run',async({page})=>{
 await page.goto('/#shopchat');await page.getByRole('button',{name:'Ask the assistant'}).click();
 await expect(page.locator('.shopchat-text')).not.toContainText('What would you like',{timeout:45000});
 await expect(page.locator('.shopchat-text')).not.toBeEmpty();
 const stop=page.getByRole('button',{name:'Stop',exact:true});if(await stop.isEnabled())await stop.click();
 await expect(stop).toBeDisabled();await page.screenshot({path:'test-results/01-shopchat.png',fullPage:true});
});
test('structured output renders a safe React product',async({page})=>{
 await page.goto(demoURL('#product'));await page.getByRole('button',{name:'Compare products'}).click();
 await expect(page.locator('.product-preview')).toBeVisible({timeout:50000});expect(await page.locator('.features section').count()).toBeGreaterThanOrEqual(2);await page.screenshot({path:'test-results/02-product.png',fullPage:true});
});
test('agent searches stock and returns code-calculated quote',async({page})=>{
 await page.goto(demoURL('#agent'));await page.getByRole('button',{name:'Build my beach kit'}).click();
 await expect(page.locator('.total')).toBeVisible({timeout:45000});const total=Number((await page.locator('.total strong').innerText()).replace('€',''));expect(total).toBeLessThanOrEqual(25);expect(total).toBeGreaterThan(0);await expect(page.getByLabel('Run events')).toContainText('search_beach_catalog');await expect(page.getByLabel('Run events')).toContainText('quote_beach_kit');await expect(page.getByRole('status')).toHaveText('Run complete',{timeout:45000});await page.screenshot({path:'test-results/03-agent.png',fullPage:true});
});
test('approval changes only the shared demo cart and survives slide navigation',async({page})=>{
 await page.goto(demoURL('#approval'));
 await page.getByRole('button',{name:'Propose cart addition'}).click();
 await expect(page.getByRole('button',{name:'Deny',exact:true})).toBeVisible({timeout:45000});
 await expect(page.locator('.cart-receipt')).toContainText('Your cart is empty');
 await expect(page.locator('.approval')).toContainText('Beach Towel');
 await page.getByRole('button',{name:'Deny',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('Run complete',{timeout:45000});
 await expect(page.locator('.cart-receipt')).toContainText('Cart total: €0');
 await page.getByRole('button',{name:'Reset demo'}).click();
 await page.getByRole('button',{name:'Propose cart addition'}).click();
 await expect(page.getByRole('button',{name:'Approve cart addition'})).toBeVisible({timeout:45000});
 await page.getByRole('button',{name:'Approve cart addition'}).click();
 await expect(page.locator('.cart-receipt')).toContainText('Cart total: €18');
 await expect(page.locator('.storefront-bar summary')).toHaveText('Cart · 2 items · €18');
 await expect(page.getByRole('status')).toHaveText('Run complete',{timeout:45000});
 await page.getByRole('button',{name:'Explain the code'}).click();
 await page.getByRole('link',{name:/Return to.*demo/}).click();
 await expect(page.locator('.storefront-bar summary')).toHaveText('Cart · 2 items · €18');
 await page.screenshot({path:'test-results/04-cart.png',fullPage:true});
});
test('Jev cleanup is reversible and protects the useful content',async({page})=>{
 test.skip(process.env.TEST_LIVE==='1'&&process.env.TEST_JEV!=='1','Gateway billing must be enabled before live Jev verification');
 await page.goto(demoURL('#jev'));
 await page.screenshot({path:'test-results/05-before.png',fullPage:true});
 const response = page.waitForResponse(r => r.url().endsWith('/api/cleanup') && r.request().method() === 'POST');
 await page.getByRole('button',{name:'Unclutter this disaster'}).click();
 const result = await (await response).json();
 await expect(page.locator('.decision-summary')).toContainText('distractions hidden',{timeout:30000});
 await expect(page.locator('.hero-essential')).toBeVisible();
 expect(result.decisions.filter((d:any)=>d.hidden).length).toBeGreaterThan(0);
 for (const d of result.decisions) {
   expect(d.hidden).toBe(mayHide(d.id,d));
   if (['hero','features','cta'].includes(d.id)) { expect(d.hidden).toBe(false); continue; }
   const element = page.locator('.clutter-slot.'+(d.id==='chat'?'chat-nag':d.id));
   if (d.hidden) await expect(element).toBeHidden();
   else await expect(element).toBeVisible();
 }
 await page.screenshot({path:'test-results/05-after.png',fullPage:true});
 await page.getByRole('button',{name:'Restore everything'}).click();
 for (const element of await page.locator('.clutter-slot').all()) await expect(element).toBeVisible();
});

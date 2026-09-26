import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteKit, comparisonSchema, decisionSchema, mayHide } from '../src/contracts';
import { app } from '../server/app';
test('quote enforces actual catalog price, budget, stock and IDs',()=>{
 assert.equal(quoteKit({ids:['towel','water','sticker'],budget:25}).total,21);
 assert.throws(()=>quoteKit({ids:['parasol'],budget:100}),/stock/);
 assert.throws(()=>quoteKit({ids:['towel','water'],budget:10}),/budget/);
 assert.throws(()=>quoteKit({ids:['invented'],budget:25}),/Unknown/);
 assert.equal(quoteKit({ids:['towel','towel'],budget:25}).total,12);
 assert.throws(()=>quoteKit({ids:['towel','water','fan'],budget:200}),/budget/);
 assert.throws(()=>quoteKit({ids:['towel'],budget:NaN}));
});
test('structured shortlist rejects unknown products, duplicate IDs and invented fields',()=>{
 const comparison={heading:'Beach essentials',picks:[{productId:'towel',reason:'A place to sit'},{productId:'water',reason:'Carry water'}]};
 assert.equal(comparisonSchema.safeParse(comparison).success,true);
 assert.equal(comparisonSchema.safeParse({...comparison,picks:[{productId:'invented',reason:'No'}]}).success,false);
 assert.equal(comparisonSchema.safeParse({...comparison,picks:[comparison.picks[0],comparison.picks[0]]}).success,false);
 assert.equal(comparisonSchema.safeParse({...comparison,price:1}).success,false);
});
test('Jev decisions cannot hide protected content or uncertain items',()=>{
 assert.equal(mayHide('hero',{category:'clutter',probability:1,confidence:1}),false);
 assert.equal(mayHide('ad',{category:'uncertain',probability:.99}),false);
 assert.equal(mayHide('ad',{category:'clutter',probability:.8}),false);
 assert.equal(mayHide('ad',{category:'clutter',probability:.99,confidence:.7}),false);
 assert.equal(mayHide('invented',{category:'clutter',probability:1}),false);
 assert.equal(mayHide('ad',{category:'clutter',probability:.98}),true);
 assert.equal(decisionSchema.safeParse({category:'clutter',probability:NaN}).success,false);
});
test('API rejects cross origin requests and malformed input',async()=>{
 assert.equal((await app.request('/api/cleanup',{method:'POST',headers:{origin:'https://evil.example'}})).status,403);
 assert.equal((await app.request('/api/cleanup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goal:''})})).status,400);
 assert.equal((await app.request('/api/chat/shopchat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[]})})).status,400);
});

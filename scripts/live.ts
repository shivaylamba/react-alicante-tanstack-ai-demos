import assert from 'node:assert/strict';
const base=process.env.DEMO_URL||'http://localhost:3100';
for(const [act,prompt] of Object.entries({shopchat:'What beach essentials are available for €25?',comparison:'Compare a towel and water bottle for my beach afternoon.',agent:'Use the catalog and quote a beach kit under €25 with a towel and water bottle.',cart:'Add a towel and water bottle to my cart. Ask for approval.'})){
 const started=performance.now();
 const response=await fetch(base+'/api/chat/'+act,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({threadId:crypto.randomUUID(),runId:crypto.randomUUID(),tools:[],context:[],state:{},messages:[{id:crypto.randomUUID(),role:'user',content:prompt}]}),signal:AbortSignal.timeout(60000)});
 const body=await response.text();
 const events=body.split('\n').filter(s=>s.startsWith('data: {')).map(s=>JSON.parse(s.slice(6)));
 const errors=events.filter(e=>e.type==='RUN_ERROR');
 console.log(act,response.status,Math.round(performance.now()-started)+'ms',events.map(e=>e.type).filter((x,i,a)=>a.indexOf(x)===i).join(','));
 if(errors.length)console.log(JSON.stringify(errors).slice(0,1000));
 assert.equal(response.status,200);assert.equal(errors.length,0);
 if(act==='shopchat')assert.ok(events.some(e=>e.type==='TEXT_MESSAGE_CONTENT'));
 if(act==='agent'){assert.ok(events.some(e=>e.type==='TOOL_CALL_START'&&e.toolCallName==='search_beach_catalog'));assert.ok(events.some(e=>e.type==='TOOL_CALL_START'&&e.toolCallName==='quote_beach_kit'));}
 if(act==='cart')assert.ok(body.includes('add_to_cart'));
 if(act==='comparison')assert.ok(body.includes('structured-output')||body.includes('STRUCTURED_OUTPUT')||body.includes('structured_output'));
}
const started=performance.now();
const result=await fetch(base+'/api/cleanup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goal:'Read what Vamos Alicante does without promotional distractions.'}),signal:AbortSignal.timeout(30000)});
const data=await result.json();console.log('jev',result.status,Math.round(performance.now()-started)+'ms',JSON.stringify(data));assert.equal(result.status,200);assert.equal(data.decisions.length,9);assert.ok(data.decisions.filter((d:any)=>['hero','features','cta'].includes(d.id)).every((d:any)=>!d.hidden));

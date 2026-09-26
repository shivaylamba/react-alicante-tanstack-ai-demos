import OpenAI from 'openai';
import { OpenAICompatibleChatAdapter } from '@tanstack/ai-openai/compatible';
export const rehearsal=()=>process.env.DEMO_MODE==='rehearsal';
class DemoAdapter extends OpenAICompatibleChatAdapter<string>{override supportsCombinedToolsAndSchema(){return false;}}
export function adapter(act:string){
 const key=rehearsal()?'fixture':process.env.NEBIUS_API_KEY;
 if(!key)throw new Error('NEBIUS_API_KEY is missing. Add it to .env and restart, or explicitly select DEMO_MODE=rehearsal.');
 return new DemoAdapter(new OpenAI({apiKey:key,baseURL:rehearsal()?`http://127.0.0.1:${process.env.PORT||3100}/fixture/v1`:'https://api.tokenfactory.nebius.com/v1',defaultHeaders:{'x-demo-act':act},maxRetries:0,timeout:30000}),process.env.NEBIUS_MODEL||'zai-org/GLM-5.3-Flash','nebius');
}

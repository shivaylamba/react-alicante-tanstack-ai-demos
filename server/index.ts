import type { Server } from 'node:http';
import { existsSync } from 'node:fs';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { createServer as createViteServer } from 'vite';
import { app } from './app.js';
if(existsSync('.env'))process.loadEnvFile('.env');
if(existsSync('.env.local'))process.loadEnvFile('.env.local');
const port=Number(process.env.PORT||3100);
if(process.env.NODE_ENV==='production')app.use('/*',serveStatic({root:'./dist'}));
const server=serve({fetch:async(req,env)=>{try{return await app.fetch(req,env);}catch(error){if(error instanceof Response)return error;console.error('Request error:',String(error).slice(0,600));return new Response('Server error',{status:500});}},port,hostname:'127.0.0.1'},()=>console.log(`TanStack AI: http://localhost:${port} (${process.env.DEMO_MODE==='rehearsal'?'REHEARSAL — no live model':'LIVE'})`));
if(process.env.NODE_ENV!=='production'){
 const vite=await createViteServer({server:{middlewareMode:true,hmr:{server:server as Server}},appType:'spa'});
 // Vite handles frontend paths only. The Hono listener keeps ownership of APIs.
 const listeners=server.listeners('request');server.removeAllListeners('request');
 server.on('request',(req,res)=>{if(req.url?.startsWith('/api/')||req.url?.startsWith('/fixture/'))for(const fn of listeners)fn.call(server,req,res);else vite.middlewares(req,res);});
 const close=()=>{void vite.close();server.close();};process.on('SIGTERM',close);process.on('SIGINT',close);
}

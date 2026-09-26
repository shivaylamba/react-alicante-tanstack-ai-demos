import { app } from '../server/app.js';

// Use Vercel's Web Standard handler so request bodies and SSE remain streams.
export default {
  fetch: (request: Request) => app.fetch(request),
};

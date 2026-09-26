import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSkillboxSource } from '../server/skillbox';

test('Skillbox source pins the discovered revision and rejects unlisted skills', async () => {
  const originalFetch = globalThis.fetch;
  const oldUrl = process.env.SKILLBOX_URL, oldKey = process.env.SKILLBOX_CLIENT_KEY;
  process.env.SKILLBOX_URL = 'http://127.0.0.1:4791';
  process.env.SKILLBOX_CLIENT_KEY = 'test-only';
  const paths: string[] = [];
  globalThis.fetch = (async (input: URL | string) => {
    const url = new URL(String(input)); paths.push(url.pathname + url.search);
    return Response.json(url.pathname === '/api/skills' ? { items: [{ id: 'beach-shopper', revision: 'original-revision', description: 'Launch copy' }], hasMore: false } : { id: 'beach-shopper', revision: url.searchParams.get('revision'), instructions: 'Use only known facts.' });
  }) as typeof fetch;
  try {
    const source = createSkillboxSource();
    await source.list();
    assert.match(await source.load('beach-shopper'), /Skillbox revision: original-revision/);
    assert.equal(paths.length, 2);
    assert.match(paths[1], /revision=original-revision/);
    await assert.rejects(source.load('private-payroll'), /authorized/);
    assert.equal(paths.length, 2);
    globalThis.fetch = (async () => new Response('', { status: 503 })) as typeof fetch;
    await assert.rejects(createSkillboxSource().list(), /No local skill was substituted/);
  } finally {
    globalThis.fetch = originalFetch;
    if (oldUrl === undefined) delete process.env.SKILLBOX_URL; else process.env.SKILLBOX_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SKILLBOX_CLIENT_KEY; else process.env.SKILLBOX_CLIENT_KEY = oldKey;
  }
});

import type { SkillSource } from '@tanstack/ai-skills';
import { z } from 'zod';

const entry = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), description: z.string(), revision: z.string().min(1) });
const catalogSchema = z.object({ items: z.array(entry), hasMore: z.boolean() });
const loadedSchema = z.object({ id: z.string(), revision: z.string(), instructions: z.string().max(160_000) });
const allowed = new Set(['beach-shopper', 'returns-guide']);

// Our integration adapter. Skillbox is a separate service, not a TanStack package.
export function createSkillboxSource(signal?: AbortSignal): SkillSource {
  const url = process.env.SKILLBOX_URL;
  const key = process.env.SKILLBOX_CLIENT_KEY;
  if (!url || !key) throw new Error('Skillbox is not configured. Run npm run skillbox:start and restart the talk server.');
  const base = new URL(url);
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password) throw new Error('Invalid Skillbox URL');
  const read = async (path: string) => {
    const response = await fetch(new URL(path, base), {
      headers: { authorization: `Bearer ${key}` },
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(5000)]) : AbortSignal.timeout(5000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error(`Skillbox unavailable (HTTP ${response.status}). No local skill was substituted.`);
    return response.json();
  };
  let snapshot: z.infer<typeof entry>[] | undefined;
  const list = async () => {
    if (!snapshot) {
      const data = catalogSchema.parse(await read('/api/skills?kind=skill&limit=100'));
      if (data.hasMore) throw new Error('Demo client has too many skills; restrict its profile.');
      snapshot = data.items.filter(item => allowed.has(item.id));
    }
    return snapshot;
  };
  return {
    list: async () => (await list()).map(item => ({
      name: item.id, description: item.description,
      metadata: { source: 'Skillbox', revision: item.revision },
    })),
    load: async (name) => {
      const selected = (await list()).find(item => item.id === name);
      if (!selected) throw new Error('Skill not in the authorized demo catalog');
      // Pin the revision discovered for this run, even if the owner edits it mid-run.
      const loaded = loadedSchema.parse(await read(`/api/skills/${encodeURIComponent(name)}?revision=${encodeURIComponent(selected.revision)}`));
      if (loaded.id !== name || loaded.revision !== selected.revision) throw new Error('Skillbox revision mismatch');
      return loaded.instructions + `\n\nSkillbox revision: ${loaded.revision}\nSource: Kitze’s Skillbox. This is instruction text, not execution permission.\nDo not include this provenance footer in the customer-facing answer.`;
    },
  };
}

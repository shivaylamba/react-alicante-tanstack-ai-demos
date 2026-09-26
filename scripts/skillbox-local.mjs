// Local-only demo services. No Docker, global agent config, or login services.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, openSync, closeSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const state = resolve(root, '.skillbox');
const upstream = resolve(state, 'upstream');
const pg = process.env.PG_BIN || '/opt/homebrew/opt/postgresql@16/bin';
const pin = 'cda64ad3310abe690c6d497352791da4cfeb9a0a';
const run = (cmd, args, options = {}) => execFileSync(cmd, args, { cwd: root, stdio: 'pipe', ...options });
const secretWrite = (path, value) => writeFileSync(path, value, { mode: 0o600 });
const action = process.argv[2] || 'start';
mkdirSync(state, { recursive: true, mode: 0o700 });
if (action === 'stop') {
  if (existsSync(resolve(state, 'server.pid'))) {
    const pid = Number(readFileSync(resolve(state, 'server.pid'), 'utf8'));
    // Verify ownership before signalling a PID that could have been reused.
    try {
      const command = run('ps', ['-p', String(pid), '-o', 'command=']).toString();
      if (command.includes(resolve(upstream, 'src/server/index.ts'))) process.kill(pid, 'SIGTERM');
    } catch {}
  }
  if (existsSync(resolve(state, 'pg/postmaster.pid'))) run(resolve(pg, 'pg_ctl'), ['-D', resolve(state, 'pg'), 'stop', '-m', 'fast']);
  console.log('Skillbox demo services stopped; data retained.');
  process.exit(0);
}
if (!existsSync(resolve(state, 'credentials.json'))) {
  secretWrite(resolve(state, 'credentials.json'), JSON.stringify({ password: randomBytes(24).toString('hex'), admin: randomBytes(32).toString('hex') }));
}
const credentials = JSON.parse(readFileSync(resolve(state, 'credentials.json'), 'utf8'));
if (!existsSync(resolve(state, 'pg/PG_VERSION'))) {
  secretWrite(resolve(state, 'pg-password'), credentials.password);
  run(resolve(pg, 'initdb'), ['-D', resolve(state, 'pg'), '-U', 'workshop', '--auth=scram-sha-256', '--pwfile=' + resolve(state, 'pg-password')]);
}
if (!existsSync(resolve(state, 'pg/postmaster.pid'))) {
  run(resolve(pg, 'pg_ctl'), ['-D', resolve(state, 'pg'), '-l', resolve(state, 'postgres.log'), '-o', '-p 5471 -h 127.0.0.1 -c shared_buffers=16MB -c work_mem=1MB -c max_connections=16', '-w', 'start']);
}
const dbEnv = { ...process.env, PGPASSWORD: credentials.password };
const databases = run(resolve(pg, 'psql'), ['-h', '127.0.0.1', '-p', '5471', '-U', 'workshop', '-d', 'postgres', '-Atc', "SELECT datname FROM pg_database WHERE datname='skillbox'"], { env: dbEnv }).toString();
if (!databases.trim()) run(resolve(pg, 'createdb'), ['-h', '127.0.0.1', '-p', '5471', '-U', 'workshop', 'skillbox'], { env: dbEnv });
if (!existsSync(resolve(upstream, '.git'))) {
  run('git', ['clone', 'https://github.com/kitze/skillbox.git', upstream]);
  run('git', ['checkout', pin], { cwd: upstream });
}
if (run('git', ['rev-parse', 'HEAD'], { cwd: upstream }).toString().trim() !== pin) throw new Error('Unexpected Skillbox revision; review it before upgrading.');
if (!existsSync(resolve(upstream, 'node_modules'))) run('bun', ['install', '--frozen-lockfile'], { cwd: upstream });
if (!existsSync(resolve(upstream, 'dist/index.html'))) run('bun', ['run', 'build'], { cwd: upstream, env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' } });
const url = 'http://127.0.0.1:4791';
let healthy = await fetch(url + '/healthz').then(r => r.ok).catch(() => false);
if (!healthy) {
  const log = openSync(resolve(state, 'server.log'), 'a', 0o600);
  const child = spawn('bun', ['--smol', resolve(upstream, 'src/server/index.ts')], {
    cwd: upstream, detached: true, stdio: ['ignore', log, log], env: {
      ...process.env, DATABASE_URL: `postgres://workshop:${credentials.password}@127.0.0.1:5471/skillbox`,
      SKILLBOX_ADMIN_TOKEN: credentials.admin, SKILLBOX_ORIGIN: url, PORT: '4791', HOST: '127.0.0.1',
    },
  });
  child.unref(); closeSync(log);
  secretWrite(resolve(state, 'server.pid'), String(child.pid));
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 500));
    healthy = await fetch(url + '/healthz').then(r => r.ok).catch(() => false);
    if (healthy) break;
  }
}
if (!healthy) throw new Error('Skillbox did not start; inspect .skillbox/server.log locally.');
const api = async (path, method = 'GET', body) => {
  const response = await fetch(url + '/api/' + path, { method, headers: { authorization: `Bearer ${credentials.admin}`, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`Skillbox setup ${path}: HTTP ${response.status}`);
  return response.json();
};
for (const id of ['beach-shopper', 'returns-guide']) {
  const current = await fetch(`${url}/api/skills/${id}`, { headers: { authorization: `Bearer ${credentials.admin}` } });
  if (current.ok) continue; // Never overwrite edits made in the real Skillbox UI.
  if (current.status !== 404) throw new Error(`Cannot inspect skill: HTTP ${current.status}`);
  const bytes = readFileSync(resolve(root, 'skills', id, 'SKILL.md'));
  await api('skills/' + id, 'PUT', { expectedRevision: null, message: 'Alicante talk starter playbook', files: [{ path: 'SKILL.md', content: bytes.toString('base64'), size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), executable: false }] });
}
const profiles = await api('profiles');
const profile = profiles.find(p => p.name === 'Alicante talk reader') || await api('profiles', 'POST', { name: 'Alicante talk reader', allSkills: false, skillIds: ['beach-shopper', 'returns-guide'], permissions: { create: false, update: false, delete: false, propose: false } });
// Keep this demo reader limited to the current two shopper playbooks.
if (JSON.stringify([...profile.skillIds].sort()) !== JSON.stringify(['beach-shopper', 'returns-guide'])) {
  await api('profiles/' + profile.id, 'PUT', { name: profile.name, version: profile.version, allSkills: false, skillIds: ['beach-shopper', 'returns-guide'], permissions: { create: false, update: false, delete: false, propose: false } });
}
if (!credentials.clientKey) {
  // Recover an interrupted first setup without leaving an orphaned active key.
  const clients = await api('clients');
  const orphan = clients.find(c => c.name === 'Vamos Alicante demo' && c.profileId === profile.id && c.active);
  if (orphan) await api('clients/' + orphan.id, 'PATCH', { active: false });
  const client = await api('clients', 'POST', { name: 'Vamos Alicante demo', profileId: profile.id });
  credentials.clientKey = client.token;
  if (!credentials.clientKey) throw new Error('Skillbox did not return a client key');
  secretWrite(resolve(state, 'credentials.json'), JSON.stringify(credentials));
}
const envPath = resolve(root, '.env.local');
let env = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
for (const [name, value] of Object.entries({ SKILLBOX_URL: url, SKILLBOX_CLIENT_KEY: credentials.clientKey })) {
  env = env.replace(new RegExp('^' + name + '=.*$', 'gm'), '').trimEnd() + `\n${name}=${value}\n`;
}
secretWrite(envPath, env);
console.log('Skillbox ready at ' + url + '. Two skills; read-only client configured. Restart the talk server to load its environment.');

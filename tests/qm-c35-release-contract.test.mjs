import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('Supabase ESM is pinned and retains the existing PKCE/session configuration', async () => {
  const auth = await readFile(new URL('assets/termo-auth.js', root), 'utf8');
  assert.match(auth, /https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2\.118\.0\/\+esm/);
  assert.doesNotMatch(auth, /supabase-js\/\+esm/);
  for (const setting of ['persistSession: true', 'autoRefreshToken: true', 'detectSessionInUrl: true', 'flowType: "pkce"', 'redirectTo: buildCleanRedirectUrl()']) {
    assert.ok(auth.includes(setting), setting);
  }
});

test('HTML pages and generators all load the C35 shared-loader revision', async () => {
  const files = [];
  async function collect(dir, recursive) {
    for (const entry of await readdir(new URL(dir, root), { withFileTypes: true })) {
      const path = dir + entry.name;
      if (entry.isDirectory() && recursive) await collect(path + '/', true);
      else if (entry.isFile() && /\.(html|mjs)$/.test(path)) files.push(path);
    }
  }
  await collect('', false);
  for (const dir of ['slides/', 'simulators/', 'scripts/']) await collect(dir, true);
  let references = 0;
  for (const path of files) {
    const content = await readFile(new URL(path, root), 'utf8');
    for (const match of content.matchAll(/(?:termo-auth|termo-seo|qm-simulator-catalog)\.js\?v=([\w.-]+)/g)) {
      assert.equal(match[1], '1019.1', path + ': stale loader reference');
      references++;
    }
  }
  assert.ok(references > 100, 'check the full published surface, not only the app shell');
  const index = await readFile(new URL('index.html', root), 'utf8');
  assert.match(index, /if \(url\.href !== previousUrl\) window\.dispatchEvent\(new CustomEvent\("qm-navigation-change"\)\)/);
});

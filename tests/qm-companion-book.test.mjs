import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const header = html.match(/<header class="top-header">([\s\S]*?)<\/header>/)?.[1];

test('companion announcement is in the header after the four primary actions', () => {
  assert.ok(header);
  assert.equal((header.match(/class="header-action\b/g) || []).length, 4);
  assert.equal((header.match(/class="companion-book"/g) || []).length, 1);
  assert.ok(header.indexOf('class="companion-book"') > header.indexOf('data-termo-share-button'));
});

test('TERMO link is native, canonical, safe and explicit about language and new tab', () => {
  const announcement = header.match(/<aside class="companion-book"[\s\S]*?<\/aside>/)?.[0];
  assert.match(announcement, /href="https:\/\/termo\.app\.br\/" target="_blank" rel="noopener noreferrer"/);
  assert.match(announcement, /TERMO — Thermodynamics/);
  assert.match(announcement, /In Portuguese · opens in a new tab/);
  assert.doesNotMatch(announcement, /onclick|iframe|utm_|data-termo-auth|data-role=/);
});

test('companion link keeps a mobile touch target and explicit keyboard focus', () => {
  assert.match(html, /\.companion-book__link\s*\{[^}]*min-height: 44px;[^}]*max-width: 100%;/);
  assert.match(html, /\.companion-book__link:focus-visible\s*\{[^}]*outline: 3px/);
  assert.match(html, /\.companion-book\s*\{[^}]*flex-wrap: wrap;/);
});

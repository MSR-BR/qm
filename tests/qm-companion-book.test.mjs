import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const header = html.match(/<header class="top-header">([\s\S]*?)<\/header>/)?.[1];

test('companion button shares the action row after the four existing actions', () => {
  assert.ok(header);
  assert.equal((header.match(/class="header-action\b/g) || []).length, 5);
  assert.equal((header.match(/class="header-action companion-book__link"/g) || []).length, 1);
  assert.ok(header.indexOf('class="header-action companion-book__link"') > header.indexOf('data-termo-share-button'));
  assert.doesNotMatch(header, /<aside|companion-book__label/);
});

test('TERMO link is native, canonical, safe and explicit about language and new tab', () => {
  const announcement = header.match(/<a class="header-action companion-book__link"[\s\S]*?<\/a>/)?.[0];
  assert.match(announcement, /href="https:\/\/termo\.app\.br\/" target="_blank" rel="noopener noreferrer"/);
  assert.match(announcement, /<span>TERMO<\/span>/);
  assert.match(announcement, /aria-label="TERMO — interactive thermodynamics book in Portuguese \(opens in a new tab\)"/);
  assert.match(announcement, /fa-arrow-up-right-from-square" aria-hidden="true"/);
  assert.doesNotMatch(announcement, /onclick|iframe|utm_|data-termo-auth|data-role=/);
});

test('companion link keeps a mobile touch target and explicit keyboard focus', () => {
  assert.match(html, /\.header-action\s*\{[^}]*min-height: 44px;/);
  assert.match(html, /\.header-action:focus-visible\s*\{[^}]*outline: 3px/);
  assert.match(html, /\.header-tools\s*\{[^}]*flex-wrap: wrap;/);
  assert.match(html, /\.header-tools \.companion-book__link\s*\{[^}]*grid-column: 1 \/ -1;/);
});

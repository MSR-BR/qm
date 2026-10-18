import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const extraSource = html.match(/const extraViews = (\[[\s\S]*?\n    \]);/)[1];
const extras = JSON.parse(JSON.stringify(vm.runInNewContext(extraSource)));

test('Extras exposes the same real destinations before and after initialization', async () => {
  const staticExtras = html.match(/<div class="extras-list" id="extrasList">([\s\S]*?)<\/section>/)[1];
  assert.doesNotMatch(html, /data-drawer-group="extras" hidden/);
  assert.deepEqual(extras.map(item => item.id), ['journey', 'assessments', 'daily-challenge', 'simulators']);
  for (const item of extras) {
    const href = item.href || `/?view=${item.id}`;
    assert.ok(staticExtras.includes(`href="${href}"`), href);
    assert.ok(staticExtras.includes(item.label), item.label);
    if (!href.startsWith('/?')) await access(new URL('../' + href, import.meta.url));
  }
  const renderer = html.match(/function renderExtrasMenu\(\) \{([\s\S]*?)\n    function renderSimulatorsMenu/)[1];
  assert.match(renderer, /createElement\("a"\)/);
  assert.match(renderer, /button.href = view.href \|\|/);
  assert.doesNotMatch(renderer, /activateView\(view.id\)/);
  assert.match(html, /extraViews.filter\(\(view\) => !view.href\)/);
});

test('journey keeps its deep link but is owned by Extras instead of Personal Area', () => {
  const personal = html.match(/const personalViews = ([\s\S]*?)const adminViews/)[1];
  assert.doesNotMatch(personal, /id: "journey"/);
  assert.match(html, /if \(viewId === "journey"\) return "extras"/);
  assert.match(html, /setActiveExtra\("journey"\)/);
  assert.match(html, /if \(viewId === "journey"\) \{\s*await renderStudyJourney\(\)/);
  assert.match(html, /Sign in with Google to save your study journey/);
});

test('Search is persistent outside accordions and methodology help remains available', () => {
  const header = html.match(/<div class="drawer-header">([\s\S]*?)<div class="drawer-scroll">/)[1];
  assert.match(header, /class="drawer-search-link" href="search.html"/);
  assert.doesNotMatch(header, /drawer-group-panel/);
  assert.doesNotMatch(html, /data-drawer-group="(?:search|learning-help)"/);
  assert.equal((html.match(/\.drawer-group-panel\[id\]/g) || []).length, 3);
  assert.match(html, /class="footer-link" href="help.html">Learning guide/);
  assert.match(html, /href="help.html#recommendations"/);
});

test('all inline scripts remain syntactically valid', () => {
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/application\/ld\+json/.test(attributes)) continue;
    if (body.trim()) new vm.Script(body);
  }
});

test('simulator catalogue supports all reviewed chapters without forcing chapter one', () => {
  const render = html.match(/function renderYesulatorCatalog\(\) \{([\s\S]*?)\n    function renderYesulatorDetail/)[1];
  assert.match(render, /Number\(state.chapterId\) \|\| 0/);
  assert.match(render, /!selectedChapterNumber \|\| Number\(simulator.chapter\) === selectedChapterNumber/);
  assert.match(render, /data-simulator-chapter/);
  assert.match(html, /return chapter && !chapter.locked/);
  const screen = html.match(/function renderYesulators\(\) \{([\s\S]*?)\n    async function activateView/)[1];
  assert.doesNotMatch(screen, /simulatorsCatalog\[0\]/);
  assert.match(screen, /renderPanelActions\(\)/);
});

test('session refresh preserves the catalogue return link only on filtered simulator views', async () => {
  const source = html.match(/async function renderPanelActions\(\) \{([\s\S]*?)\n    \}/)[1];
  const panelActions = { innerHTML: '' };
  const state = { view: 'simulators', chapterId: '07' };
  const render = vm.runInNewContext(`(async function () { ${source} })`, { panelActions, state });
  await render();
  assert.match(panelActions.innerHTML, /All simulators/);
  await render();
  assert.match(panelActions.innerHTML, /All simulators/);
  state.chapterId = '';
  await render();
  assert.equal(panelActions.innerHTML, '');
  state.view = 'chapters'; state.chapterId = '07';
  await render();
  assert.equal(panelActions.innerHTML, '');
});

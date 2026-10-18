import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/qm-exercise-export.js', import.meta.url), 'utf8');
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
function load(window = {}) {
  vm.runInNewContext(source, { window, URL });
  return window.QMExerciseExport;
}
test('export uses rendered print view, never the raw-text jsPDF path', () => {
  assert.match(index, /QMExerciseExport\.open\(exercise/);
  assert.match(index, /qm-exercise-export\.js/);
  assert.doesNotMatch(index, /ensureJsPdf|new jsPDF|File exported\./);
  assert.match(source, /await math\.typesetPromise\(\[root\]\)/);
  assert.match(source, /MJX-SVG-global-cache/);
  assert.match(source, /MJX-SVG-styles/);
  assert.match(source, /typesetClear/);
  assert.match(source, /@media print/);
  assert.match(source, /break-inside: avoid/);
});
test('metadata is escaped and only canonical source URLs are exported', () => {
  const exporter = load();
  assert.equal(exporter.safeSource('javascript:alert(1)'), '');
  assert.equal(exporter.safeSource('https://example.com'), '');
  assert.equal(exporter.safeSource('/slides/chapter-01/photoelectric-effect.html'), 'https://quantummechanicsbook.app/slides/chapter-01/photoelectric-effect.html');
  const html = exporter.buildContent({ exercise_title: '<script>bad</script>', statement: 'S', solution: 'A' }, v => `<p>${v}</p>`, '<owner>', 'javascript:bad');
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;owner&gt;/);
  assert.doesNotMatch(html, /href=|<script>/);
  assert.match(html, /Statement<\/h2><section><p>S/);
  assert.match(html, /Solution<\/h2><section><p>A/);
});
test('blocked pop-up fails explicitly before any rendering or data transfer', async () => {
  const exporter = load({ open: () => null });
  await assert.rejects(exporter.open({}, {}), /Allow pop-ups/);
});
test('print view has no analytics or remote exercise upload', () => {
  assert.doesNotMatch(source, /fetch\(|sendBeacon|localStorage|sessionStorage|https?:\/\/.*cdn/);
  assert.match(source, /popup\.opener = null/);
  assert.match(source, /Some equations could not be rendered/);
  assert.match(source, /doc\.fonts\?\.ready/);
});

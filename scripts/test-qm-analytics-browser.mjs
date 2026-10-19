// Isolated Chromium, stubbed config/collection; no real Google or backend events.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.QM_PLAYWRIGHT_MODULE || 'playwright');
const root = new URL('../', import.meta.url);
const js = await readFile(new URL('assets/qm-analytics.js', root), 'utf8');
const css = await readFile(new URL('assets/qm-analytics.css', root), 'utf8');
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const calls = [];
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'quantummechanicsbook.app') {
        calls.push(url.hostname);
        return route.fulfill({ body: '', contentType: 'text/javascript' });
      }
      if (url.pathname === '/api/public-config') return route.fulfill({ json: { analytics: { enabled: true, measurementId: 'G-X5Y1C68QMN' } } });
      if (url.pathname === '/assets/qm-analytics.js') return route.fulfill({ body: js, contentType: 'text/javascript' });
      if (url.pathname === '/assets/qm-analytics.css') return route.fulfill({ body: css, contentType: 'text/css' });
      if (url.pathname === '/api/qm-analytics-event') return route.fulfill({ json: { ok: true } });
      return route.fulfill({ body: '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>QUANTUM test</title><button data-qm-analytics-settings>Preferences</button><script src="/assets/qm-analytics.js"></script>', contentType: 'text/html' });
    });
    const page = await context.newPage();
    await page.goto('https://quantummechanicsbook.app/?utm_source=codex_qa&utm_medium=qa&utm_campaign=quantum_c18_validation');
    await page.locator('[data-qm-analytics-consent-panel]').waitFor();
    assert.equal(calls.length, 0);
    assert.equal(await page.locator('[data-qm-ads-consent]').isChecked(), false);
    await page.getByRole('button', { name: 'Only necessary' }).click();
    assert.equal(calls.length, 0);
    await page.getByRole('button', { name: 'Preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Allow analytics / save choices' }).click();
    await page.waitForFunction(() => window.QMAnalytics.getConsent().decision === 'granted');
    assert.equal(await page.evaluate(() => window.QMAnalytics.getConsent().advertisingMeasurement), false);
    await page.getByRole('button', { name: 'Preferences', exact: true }).click();
    await page.locator('[data-qm-ads-consent]').check();
    const rect = await page.locator('[data-qm-analytics-consent-panel]').boundingBox();
    assert.ok(rect.x >= 0 && rect.x + rect.width <= width);
    assert.ok(rect.y >= 0 && rect.y + rect.height <= 844);
    if (width === 390 && process.env.QM_ANALYTICS_SCREENSHOT) await page.screenshot({ path: process.env.QM_ANALYTICS_SCREENSHOT });
    await page.getByRole('button', { name: 'Allow analytics / save choices' }).click();
    assert.equal(await page.evaluate(() => window.QMAnalytics.getConsent().advertisingMeasurement), true);
    await page.goto('https://quantummechanicsbook.app/?view=chapters&code=private');
    await page.waitForFunction(() => window.QMAnalytics?.isEnabled());
    const config = await page.evaluate(() => Array.from(window.dataLayer).find(c => c[0] === 'config')[2]);
    assert.equal(config.campaign_source, 'codex_qa');
    assert.equal(config.campaign_medium, 'qa');
    assert.equal(config.page_location, 'https://quantummechanicsbook.app/?view=chapters');
    await page.getByRole('button', { name: 'Preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Only necessary' }).click();
    assert.equal(await page.evaluate(() => window['ga-disable-G-X5Y1C68QMN']), true);
    await context.close();
    console.log('PASS consent controls, revocation and attribution at ' + width + 'px (all external requests stubbed)');
  }
} finally { await browser.close(); }

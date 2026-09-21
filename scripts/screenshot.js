#!/usr/bin/env node
// Captures a web UI screenshot with headless Chromium via Playwright.
// Usage: node scripts/screenshot.js [base_url]
//   base_url defaults to http://localhost:8080

const { chromium } = require('playwright');
const path = require('path');

const BASE    = process.argv[2] || 'http://localhost:8080';
const OUT     = path.join(__dirname, '../demo/web-ui.png');
const OUT_KBD = path.join(__dirname, '../demo/web-ui-shortcuts.png');

(async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1400, height: 860 });

    await page.goto(`${BASE}?domain=example.com&type=A`);

    // wait for all resolvers to respond
    await page.waitForFunction(
      () => {
        const s = document.getElementById('status-line');
        return s && s.textContent.startsWith('Done');
      },
      { timeout: 90000 }
    );

    await page.screenshot({ path: OUT });
    console.log(`screenshot saved → ${OUT}`);

    // keyboard shortcuts modal
    await page.keyboard.press('?');
    await page.waitForFunction(
      () => document.getElementById('shortcuts-modal')?.classList.contains('open'),
      { timeout: 3000 }
    );
    await page.screenshot({ path: OUT_KBD });
    console.log(`screenshot saved → ${OUT_KBD}`);
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });

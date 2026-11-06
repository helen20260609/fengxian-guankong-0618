const { chromium } = require('playwright');

const BASE = 'http://localhost:8080';
const PAGES = [
  'pages/inspection-domains.html',
  'pages/inspection-tasks.html?domain=gas',
  'pages/warning-center.html',
  'pages/risk-list.html',
  'pages/inspection-execute.html?id=GAS-2025-001',
  'pages/region-management.html'
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.setItem('risk-role', 'inspector');
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  for (const p of PAGES) {
    try {
      await page.goto(`${BASE}/${p}`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(500);
      const hasHero = await page.evaluate(() => !!document.querySelector('.page-hero'));
      const hasSheet = await page.evaluate(() => !!document.querySelector('.knowledge-body, .content-sheet.page-body-sheet'));
      const hasNav = await page.evaluate(() => !!document.querySelector('.nav-bar'));
      console.log(`${p}: hero=${hasHero}, sheet=${hasSheet}, nav=${hasNav}`);
    } catch (e) {
      console.log(`FAIL ${p}: ${e.message}`);
    }
  }

  if (errors.length) {
    console.log('\nErrors:', errors);
    process.exitCode = 1;
  } else {
    console.log('\nAll pages checked.');
  }
  await browser.close();
})();

const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000");
  console.log("Browser open at localhost:3000 — press Ctrl+C to close");
  // Keep alive
  await new Promise(() => {});
})();

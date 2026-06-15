const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  page.setDefaultTimeout(90000);

  try {
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    const input = page.locator("textarea").first();
    await input.waitFor({ state: "visible" });
    await input.fill("Create a pricing card component");
    console.log("TYPED_MESSAGE");

    await page.keyboard.press("Enter");
    console.log("SUBMITTED");

    // Phase 1: wait for "Generating..." to appear (AI started)
    await page.waitForFunction(() => {
      return [...document.querySelectorAll("*")].some(el =>
        el.childNodes.length === 1 &&
        el.childNodes[0].nodeType === 3 &&
        el.textContent.trim() === "Generating..."
      );
    }, { timeout: 15000 });
    console.log("GENERATION_STARTED");

    // Phase 2: wait for "Generating..." to disappear (AI finished)
    await page.waitForFunction(() => {
      return ![...document.querySelectorAll("*")].some(el =>
        el.childNodes.length === 1 &&
        el.childNodes[0].nodeType === 3 &&
        el.textContent.trim() === "Generating..."
      );
    }, { timeout: 80000 });
    console.log("GENERATION_COMPLETE");

    await page.waitForTimeout(2000);

    // Switch to Preview tab and screenshot
    const previewTab = page.locator("button", { hasText: "Preview" });
    await previewTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "C:/Users/Sabeeha/Desktop/screenshot_preview.png", fullPage: true });
    console.log("PREVIEW_SCREENSHOT_TAKEN");

    // Switch to Code tab and screenshot
    const codeTab = page.locator("button", { hasText: "Code" });
    await codeTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "C:/Users/Sabeeha/Desktop/screenshot_code.png", fullPage: true });
    console.log("CODE_SCREENSHOT_TAKEN");

  } catch (err) {
    console.error("ERROR:", err.message);
    await page.screenshot({ path: "C:/Users/Sabeeha/Desktop/screenshot_error.png", fullPage: true });
  }

  await browser.close();
  console.log("DONE");
})();

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const output = path.resolve(__dirname, "..", "artifacts");
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const errors = [];
  const failed = [];
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => errors.push(`page:${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console:${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    failed.push(`${request.url()} ${request.failure().errorText}`);
  });

  const baseUrl = process.env.DASHBOARD_URL || "http://127.0.0.1:8000/dashboard/";
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
  const before = await page.evaluate(() => ({
    title: document.title,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    height: document.documentElement.scrollHeight,
    svgs: [...document.querySelectorAll("svg")].map((svg) => svg.childElementCount),
    h1: document.querySelector("h1")?.textContent,
    buttons: document.querySelectorAll("button").length,
    sections: document.querySelectorAll("section").length,
  }));

  await page.click("#languageToggle");
  await page.click("#trendMode button[data-mode=transactions]");
  await page.click("#stressMode button[data-mode=rate_dominant]");
  await page.click('#lagMode button[data-mode="hibor_3m_pct->residential_transactions"]');
  const after = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent,
    trendActive: document.querySelector("#trendMode button.active")?.dataset.mode,
    stressActive: document.querySelector("#stressMode button.active")?.dataset.mode,
    lagActive: document.querySelector("#lagMode button.active")?.dataset.mode,
  }));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  const mobile = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    height: document.documentElement.scrollHeight,
    heroWidth: Math.round(document.querySelector(".hero").getBoundingClientRect().width),
    headerHeight: Math.round(document.querySelector(".site-header").getBoundingClientRect().height),
    visibleNav: getComputedStyle(document.querySelector(".site-nav")).display,
  }));
  await page.screenshot({ path: `${output}/mobile.png`, fullPage: true });
  console.log(JSON.stringify({ before, after, mobile, errors, failed }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

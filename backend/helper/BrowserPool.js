let browser = null;
let launchPromise = null;

async function getBrowser() {
  if (browser && browser.isConnected()) {
    return browser;
  }
  if (launchPromise) {
    return await launchPromise;
  }
  launchPromise = (async () => {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    browser.on('disconnected', () => {
      browser = null;
      launchPromise = null;
    });
    return browser;
  })();
  return await launchPromise;
}

async function newPage() {
  const b = await getBrowser();
  return await b.newPage();
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    launchPromise = null;
  }
}

module.exports = { getBrowser, newPage, closeBrowser };

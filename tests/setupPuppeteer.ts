import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const handlePageError = (error: Error) => {
  process.emit('uncaughtException', error);
};

const openPage = async () => {
  if (globalThis.page) {
    throw new Error('Cannot open page before closing previous page.');
  }
  const page = await browser.newPage();
  page.on('pageerror', handlePageError);
  globalThis.page = page;
};

const closePage = async () => {
  if (!globalThis.page) return;
  globalThis.page.off('pageerror', handlePageError);
  await globalThis.page.close({
    runBeforeUnload: true,
  });
  globalThis.page = undefined as any;
};

const resetPage = async () => {
  await closePage();
  await openPage();
};

globalThis.resetPage = resetPage;
globalThis.browser = browser;

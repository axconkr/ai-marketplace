const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    if (msg.text().includes('[fetchAPI]')) {
      console.log('Browser Console:', msg.text());
    }
  });
  
  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('/api/products/me')) {
      console.log('Request URL:', request.url());
      console.log('Request Headers:', request.headers());
    }
  });
  
  // Go to login page
  await page.goto('http://localhost:3001/login');
  
  console.log('Opening login page...');
  
  // Wait for user to login manually
  console.log('Please login and navigate to dashboard/products');
  console.log('Press Ctrl+C when done');
  
  // Keep browser open
  await new Promise(() => {});
})();

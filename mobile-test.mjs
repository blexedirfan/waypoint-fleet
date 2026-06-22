import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--no-sandbox'], headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto('http://localhost:5177', { waitUntil: 'load' });
await page.waitForTimeout(600);
await page.locator('input[type="email"]').fill('test@test.com');
await page.locator('input[type="password"]').fill('password123');
await page.locator('button.w-full').click();
await page.waitForTimeout(2200);

// Light mode screenshot
await page.screenshot({ path: 'c:/Users/capth/OneDrive/Desktop/theme-light.png' });

// Click ThemeToggle to go dark
await page.locator('[role="button"][aria-label]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'c:/Users/capth/OneDrive/Desktop/theme-dark.png' });

await browser.close();
console.log('done');

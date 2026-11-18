import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const chapters = [
  ['cover', 'Cover'],
  ['chapter-about', 'About Me'],
  ['chapter-career', 'Career Journey'],
  ['chapter-selected', 'Selected Work'],
  ['chapter-innovation', 'Innovation & Impact'],
  ['chapter-tools', 'Tools & Technologies'],
  ['chapter-domains', 'Domains & Standards'],
  ['chapter-approach', 'Approach & Strengths'],
  ['chapter-contact', 'Contact'],
];

async function dismissCookies(page) {
  const reject = page.locator('#reject-cookies');
  if (await reject.isVisible().catch(() => false)) await reject.click();
}

async function visitChapter(page, id) {
  const dot = page.locator(`.chapter-progress a[href="#${id}"]`);
  await expect(dot).toBeAttached();
  if (await dot.isVisible()) {
    await dot.click();
    // Wait until the swing transition and its interaction lock have settled.
    await page.waitForTimeout(1050);
  } else {
    // Mobile hides the progress dots; use the built-in deep link for setup.
    await page.goto(`/?jump=${id}#${id}`, { waitUntil: 'domcontentloaded' });
  }
  await expect(page.locator(`#${id}`)).toHaveClass(/swing-current/);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await dismissCookies(page);
});

test('all nine chapters exist, with one active full-screen panel', async ({ page }) => {
  for (const [id] of chapters) await expect(page.locator(`main > #${id}`)).toHaveCount(1);
  await expect(page.locator('main > .swing-current')).toHaveCount(1);
  await expect(page.locator('#cover')).toHaveClass(/swing-current/);
  await expect(page.locator('.chapter-progress a')).toHaveCount(9);
  const metrics = await page.evaluate(() => ({
    viewport: window.innerHeight,
    panel: document.querySelector('main > .swing-current').getBoundingClientRect().height,
  }));
  expect(Math.abs(metrics.panel - metrics.viewport)).toBeLessThan(5);
});

test('page transitions work in both directions without revealing multiple pages', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop-chromium', 'Desktop navigation test');
  await page.mouse.wheel(0, 500);
  await expect(page.locator('#chapter-about')).toHaveClass(/swing-current/);
  await expect(page.locator('main > .swing-current')).toHaveCount(1);
  await page.waitForTimeout(1100);
  await page.keyboard.press('PageDown');
  await expect(page.locator('#chapter-career')).toHaveClass(/swing-current/);
  await page.waitForTimeout(1100);
  await page.keyboard.press('PageUp');
  await expect(page.locator('#chapter-about')).toHaveClass(/swing-current/);
});

test('every chapter can be reached and is visible, with a screenshot', async ({ page }, testInfo) => {
  // Re-enter each page by a fresh URL so this test also verifies deep-link loading.
  const directory = path.join(testInfo.outputDir, 'chapter-screenshots');
  await mkdir(directory, { recursive: true });
  for (let i = 0; i < chapters.length; i++) {
    const [id] = chapters[i];
    await page.goto(`/?chapter-test=${i}#${id}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(`#${id}`)).toHaveClass(/swing-current/);
    await expect(page.locator('main > .swing-current')).toHaveCount(1);
    await page.screenshot({ path: path.join(directory, `${String(i + 1).padStart(2, '0')}-${id}.png`), animations: 'disabled' });
  }
});

test('analog clock runs and light/dark mode changes the clock tile', async ({ page }) => {
  await expect(page.locator('#cover-digital')).toContainText(/\d{2}:\d{2} IST/);
  const secondBefore = await page.locator('#cover-second').evaluate(el => el.style.transform);
  await page.waitForTimeout(1250);
  const secondAfter = await page.locator('#cover-second').evaluate(el => el.style.transform);
  expect(secondAfter).not.toBe(secondBefore);
  const before = await page.locator('.analog-tile').evaluate(el => getComputedStyle(el).backgroundColor);
  await page.locator('#theme').click();
  await expect.poll(() => page.locator('.analog-tile').evaluate(el => getComputedStyle(el).backgroundColor), { message: 'Clock tile background must change with the theme' }).not.toBe(before);
});

test('ID card is hidden until the About page settles, then swings in and flips', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop-chromium', 'Desktop timing and interaction test');
  const card = page.locator('#chapter-about #idcard');
  await expect(card).toHaveCSS('visibility', 'hidden');
  await page.locator('.chapter-progress a[href="#chapter-about"]').click();
  await expect(page.locator('#chapter-about')).toHaveClass(/swing-current/);
  await expect(card).toHaveCSS('visibility', 'hidden');
  await expect(card).toHaveCSS('visibility', 'visible', { timeout: 6000 });
  await page.waitForTimeout(2500); // Allow elastic entrance to settle before interacting.
  await card.click();
  await expect(card).toHaveClass(/flipped/);
});

test('the five-mission documentation game is playable from start to finish', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop-chromium', 'Full interactive game run');
  await visitChapter(page, 'chapter-approach');
  await page.locator('#dd-game-open').click();
  const dialog = page.locator('#dd-game-modal');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('MISSION 1 OF 5');
  const correctChoices = [1, 0, 1, 2, 1];
  for (let i = 0; i < correctChoices.length; i++) {
    await expect(dialog).toContainText(`MISSION ${i + 1} OF 5`);
    await dialog.locator('.dd-game-choice').nth(correctChoices[i]).click();
    await expect(dialog.locator('.dd-game-result')).toBeVisible();
    await expect(dialog.locator('.dd-game-result')).toContainText('Skill:');
    await dialog.locator('[data-action="next"]').click();
  }
  await expect(dialog).toContainText('MISSION COMPLETE');
  await expect(dialog).toContainText('5 / 5');
  await dialog.locator('[data-action="restart"]').click();
  await expect(dialog).toContainText('MISSION 1 OF 5');
  await dialog.locator('#dd-game-close').click();
  await expect(dialog).not.toBeVisible();
});

test('resume link serves a PDF, and contact links are present', async ({ page, request }) => {
  const resume = page.locator('#resume-download');
  await expect(resume).toHaveAttribute('href', /resume\.pdf/);
  const response = await request.get('/resume.pdf');
  expect(response.status(), 'resume.pdf must be deployed alongside index.html').toBe(200);
  expect(response.headers()['content-type'] || '').toMatch(/pdf/);
  await visitChapter(page, 'chapter-contact');
  await expect(page.locator('#chapter-contact a[href*="linkedin.com"]')).toHaveCount(1);
  await expect(page.locator('#chapter-contact a[href*="wa.me"]')).toHaveCount(1);
});

test('feedback thumbs are accessible on the final Contact page', async ({ page }) => {
  await visitChapter(page, 'chapter-contact');
  // This is a regression guard: if a future edit accidentally removes the thumbs,
  // GitHub Actions will flag the problem rather than silently passing.
  await expect(page.locator('#chapter-contact #thumbs-up')).toHaveCount(1);
  await expect(page.locator('#chapter-contact #thumbs-down')).toHaveCount(1);
  await expect(page.locator('#chapter-contact #thumbs-up')).toBeVisible();
  await expect(page.locator('#chapter-contact #thumbs-down')).toBeVisible();
});

test('Ask Debadatta opens and can be closed', async ({ page }) => {
  await page.locator('#botbtn').click();
  await expect(page.locator('#bot')).toBeVisible();
  await page.locator('#botx').click();
  await expect(page.locator('#bot')).toBeHidden();
});

test('no uncaught JavaScript errors during navigation and game launch', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await visitChapter(page, 'chapter-approach');
  await page.locator('#dd-game-open').click();
  await expect(page.locator('#dd-game-modal')).toBeVisible();
  expect(errors, `Uncaught JavaScript errors:\n${errors.join('\n')}`).toEqual([]);
});

test('mobile has readable chapters and supports a touch-swipe transition', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-chromium', 'Mobile-specific interaction');
  await expect(page.locator('#cover')).toHaveClass(/swing-current/);
  await page.evaluate(() => {
    const start = new Touch({ identifier: 1, target: document.body, clientX: 180, clientY: 680 });
    const end = new Touch({ identifier: 1, target: document.body, clientX: 180, clientY: 340 });
    window.dispatchEvent(new TouchEvent('touchstart', { touches: [start], targetTouches: [start], changedTouches: [start], bubbles: true }));
    window.dispatchEvent(new TouchEvent('touchend', { touches: [], targetTouches: [], changedTouches: [end], bubbles: true }));
  });
  await expect(page.locator('#chapter-about')).toHaveClass(/swing-current/);
  await expect(page.locator('main > .swing-current')).toHaveCount(1);
});

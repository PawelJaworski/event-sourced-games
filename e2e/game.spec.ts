import { test, expect } from '@playwright/test';

test.describe('Game tokens with captions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gnome-game');
    await page.waitForTimeout(2000);
  });

  test('first click shows caption, second click on caption opens game', async ({ page }) => {
    const canvas = page.locator('app-map canvas');
    await canvas.waitFor({ state: 'visible', timeout: 10000 });
    
    // First click - show caption (don't change location)
    await canvas.click({ position: { x: 320, y: 340 } });
    await page.waitForTimeout(1500);
    
    const screenshotWithCaption = await canvas.screenshot();
    await expect(screenshotWithCaption).toMatchSnapshot('fruits-of-forest-caption.png', { threshold: 0.1 });
    
    // Second click on caption area - go to location and open game
    await canvas.click({ position: { x: 340, y: 280 } });
    await page.waitForTimeout(1500);
    
    // Check that dialog opened
    const dialogOpened = await page.locator('.dialog-overlay').isVisible();
    expect(dialogOpened).toBe(true);
  });

  test('first click shows caption for Fishery Ground, second click opens game', async ({ page }) => {
    const canvas = page.locator('app-map canvas');
    await canvas.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click on Gnome Hut first to go back home
    await canvas.click({ position: { x: 620, y: 360 } });
    await page.waitForTimeout(1000);
    
    // First click - show caption
    await canvas.click({ position: { x: 410, y: 290 } });
    await page.waitForTimeout(1500);
    
    const screenshotWithCaption = await canvas.screenshot();
    await expect(screenshotWithCaption).toMatchSnapshot('fishery-ground-caption.png', { threshold: 0.1 });
    
    // Second click on caption area - go to location
    await canvas.click({ position: { x: 410, y: 230 } });
    await page.waitForTimeout(1500);
    
    // Check that dialog opened
    const dialogOpened = await page.locator('.dialog-overlay').isVisible();
    expect(dialogOpened).toBe(true);
  });
});

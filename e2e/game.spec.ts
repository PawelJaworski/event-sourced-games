import { test, expect } from '@playwright/test';

test.describe('Game tokens with captions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gnome-game');
    await page.waitForTimeout(2000);
  });

  test('caption should be visible on top of other tokens when at Fruits of the Forest', async ({ page }) => {
    const canvas = page.locator('app-map canvas');
    await canvas.waitFor({ state: 'visible', timeout: 10000 });
    
    await canvas.click({ position: { x: 320, y: 340 } });
    
    await page.waitForTimeout(1500);
    
    const screenshot = await canvas.screenshot();
    await expect(screenshot).toMatchSnapshot('fruits-of-forest-caption.png', { threshold: 0.1 });
  });

  test('caption should be visible on top of other tokens when at Fishery Ground', async ({ page }) => {
    const canvas = page.locator('app-map canvas');
    await canvas.waitFor({ state: 'visible', timeout: 10000 });
    
    // Close any dialogs first
    const closeBtn = page.locator('button.dialog-close, .close-button, button[aria-label="Close"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Click on Gnome Hut first to go back home
    await canvas.click({ position: { x: 620, y: 360 } });
    await page.waitForTimeout(500);
    
    // Close dialog if it opened
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Now click on Fishery Ground
    await canvas.click({ position: { x: 410, y: 290 } });
    
    await page.waitForTimeout(1500);
    
    const screenshot = await canvas.screenshot();
    await expect(screenshot).toMatchSnapshot('fishery-ground-caption.png', { threshold: 0.1 });
  });
});

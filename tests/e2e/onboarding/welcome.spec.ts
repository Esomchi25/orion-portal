/**
 * E2E Tests: Onboarding Welcome Screen
 * @governance COMPONENT-001
 *
 * Tests the complete user flow for the welcome screen.
 * Uses Playwright for browser automation.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Onboarding Welcome Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');
  });

  test('displays welcome message', async ({ page }) => {
    // Check for welcome heading
    const heading = page.getByRole('heading', { name: /welcome/i });
    await expect(heading).toBeVisible();
  });

  test('shows all feature cards', async ({ page }) => {
    // Verify feature cards are visible
    await expect(page.getByText(/p6.*schedule.*data/i)).toBeVisible();
    await expect(page.getByText(/sap.*financial.*data/i)).toBeVisible();
    await expect(page.getByText(/real-time.*sync/i)).toBeVisible();
    await expect(page.getByText(/unified.*dashboard/i)).toBeVisible();
  });

  test('Get Started button navigates to P6 connection', async ({ page }) => {
    // Click Get Started button
    const button = page.getByRole('button', { name: /get started/i });
    await expect(button).toBeVisible();
    await button.click();

    // Should navigate to P6 connection step
    await expect(page).toHaveURL(/\/onboarding\/p6/);
  });

  test('is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Content should still be visible and usable
    await expect(
      page.getByRole('heading', { name: /welcome/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /get started/i })
    ).toBeVisible();
  });

  test('shows loading state when proceeding', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/onboarding/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({ status: 200 });
    });

    const button = page.getByRole('button', { name: /get started/i });
    await button.click();

    // Loading spinner should appear
    await expect(page.getByTestId('loading-spinner')).toBeVisible();
  });
});

test.describe('Onboarding Welcome Screen - Accessibility', () => {
  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/onboarding');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('has proper heading hierarchy', async ({ page }) => {
    await page.goto('/onboarding');

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('all interactive elements are focusable', async ({ page }) => {
    await page.goto('/onboarding');

    // Tab through all interactive elements
    const button = page.getByRole('button', { name: /get started/i });

    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
  });

  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/onboarding');

    // Focus button and press Enter
    const button = page.getByRole('button', { name: /get started/i });
    await button.focus();
    await page.keyboard.press('Enter');

    // Should navigate to next step
    await expect(page).toHaveURL(/\/onboarding\/p6/);
  });
});

test.describe('Onboarding Welcome Screen - Visual Regression', () => {
  test('matches visual snapshot - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/onboarding');

    // Wait for animations to complete
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('welcome-desktop.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('matches visual snapshot - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/onboarding');

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('welcome-mobile.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('matches visual snapshot - dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/onboarding');

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('welcome-dark.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});

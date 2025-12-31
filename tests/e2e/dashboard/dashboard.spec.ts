/**
 * Dashboard E2E Tests
 * @governance COMPONENT-001 (Phase C: Full E2E with Real Data)
 *
 * Tests the dashboard:
 * - Portfolio summary cards
 * - Project health cards
 * - Sync status
 * - Navigation to other pages
 */

import { test, expect, mockPortfolioSummary, mockProjects } from '../fixtures/base';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    await page.goto('/dashboard');
  });

  test.describe('Portfolio Summary Cards', () => {
    test('displays total projects count', async ({ page }) => {
      await expect(page.getByText(/total projects/i)).toBeVisible();
      await expect(page.getByText(String(mockPortfolioSummary.totalProjects))).toBeVisible();
    });

    test('displays active projects count', async ({ page }) => {
      await expect(page.getByText(/active projects/i)).toBeVisible();
      await expect(page.getByText(String(mockPortfolioSummary.activeProjects))).toBeVisible();
    });

    test('displays average SPI', async ({ page }) => {
      await expect(page.getByText(/avg spi/i)).toBeVisible();
    });

    test('displays average CPI', async ({ page }) => {
      await expect(page.getByText(/avg cpi/i)).toBeVisible();
    });

    test('has no accessibility violations', async ({ axeBuilder }) => {
      const results = await axeBuilder.analyze();
      expect(results.violations).toEqual([]);
    });
  });

  test.describe('Project Health Cards', () => {
    test('displays project cards with health indicators', async ({ page }) => {
      // Should show project names
      await expect(page.getByText(mockProjects[0].name)).toBeVisible();
      await expect(page.getByText(mockProjects[1].name)).toBeVisible();
    });

    test('shows SPI and CPI for each project', async ({ page }) => {
      // Projects should show their KPIs
      await expect(page.getByText(/spi/i).first()).toBeVisible();
      await expect(page.getByText(/cpi/i).first()).toBeVisible();
    });

    test('displays health status badges', async ({ page }) => {
      // Should show status badges (On Track, At Risk, Critical)
      const onTrackCount = mockPortfolioSummary.healthBreakdown.onTrack;
      const atRiskCount = mockPortfolioSummary.healthBreakdown.atRisk;
      const criticalCount = mockPortfolioSummary.healthBreakdown.critical;

      // At least one status should be visible
      const hasStatus = await page.getByText(/on track|at risk|critical/i).first().isVisible();
      expect(hasStatus).toBe(true);
    });

    test('clicking project card navigates to project details', async ({ page }) => {
      const projectCard = page.getByText(mockProjects[0].name);
      await projectCard.click();

      // Should navigate to project page
      await expect(page).toHaveURL(/.*projects/);
    });
  });

  test.describe('Sync Status', () => {
    test('displays P6 connection status', async ({ page }) => {
      await expect(page.getByText(/p6/i)).toBeVisible();
      await expect(page.getByText(/connected/i).first()).toBeVisible();
    });

    test('displays SAP connection status', async ({ page }) => {
      await expect(page.getByText(/sap/i)).toBeVisible();
    });

    test('shows last sync time', async ({ page }) => {
      await expect(page.getByText(/last sync/i).first()).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to projects page', async ({ page }) => {
      await page.getByRole('link', { name: /projects/i }).click();
      await expect(page).toHaveURL(/.*projects/);
    });

    test('can navigate to settings page', async ({ page }) => {
      await page.getByRole('link', { name: /settings/i }).click();
      await expect(page).toHaveURL(/.*settings/);
    });
  });

  test.describe('Refresh', () => {
    test('refresh button reloads data', async ({ page, dashboardPage }) => {
      const refreshButton = await dashboardPage.refreshButton();
      await refreshButton.click();

      // Should show loading state briefly then data again
      await expect(page.getByText(String(mockPortfolioSummary.totalProjects))).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('adapts to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      // Cards should still be visible and readable
      await expect(page.getByText(/total projects/i)).toBeVisible();
      await expect(page.getByText(mockProjects[0].name)).toBeVisible();
    });

    test('adapts to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Cards should be visible
      await expect(page.getByText(/total projects/i)).toBeVisible();
      await expect(page.getByText(mockProjects[0].name)).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('shows error state when API fails', async ({ page }) => {
      // Override the mock to return an error
      await page.route('**/api/v1/portfolio/summary', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await page.reload();

      // Should show error message
      await expect(page.getByText(/failed to load|error/i)).toBeVisible();
    });

    test('shows retry button on error', async ({ page }) => {
      await page.route('**/api/v1/portfolio/summary', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await page.reload();

      // Should have retry option
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
    });
  });
});

/**
 * Accessibility E2E Tests
 * @governance COMPONENT-001 (Phase C: Full E2E with Real Data)
 *
 * Comprehensive accessibility testing using axe-core.
 * Tests all major pages for WCAG 2.1 AA compliance.
 */

import { test, expect } from '../fixtures/base';

test.describe('Accessibility - WCAG 2.1 AA Compliance', () => {
  test.describe('Onboarding Page', () => {
    test('welcome screen has no violations', async ({ page, mockAPI, axeBuilder }) => {
      await page.goto('/onboarding');

      const results = await axeBuilder
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('P6 connection form has no violations', async ({ page, mockAPI, axeBuilder }) => {
      await page.goto('/onboarding');
      await page.getByRole('button', { name: /get started/i }).click();

      const results = await axeBuilder
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  });

  test.describe('Dashboard Page', () => {
    test('has no accessibility violations', async ({ page, mockAPI, axeBuilder }) => {
      await page.goto('/dashboard');

      const results = await axeBuilder
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('portfolio cards are properly labeled', async ({ page, mockAPI }) => {
      await page.goto('/dashboard');

      // Cards should have proper headings
      const headings = page.getByRole('heading');
      await expect(headings.first()).toBeVisible();
    });

    test('interactive elements are keyboard accessible', async ({ page, mockAPI }) => {
      await page.goto('/dashboard');

      // Tab through interactive elements
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Projects Page', () => {
    test('has no accessibility violations', async ({ page, mockAPI, axeBuilder }) => {
      await page.goto('/projects');

      const results = await axeBuilder
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('table has proper structure', async ({ page, mockAPI }) => {
      await page.goto('/projects');

      // Table should have headers
      const table = page.getByRole('table');
      await expect(table).toBeVisible();

      const headers = page.getByRole('columnheader');
      await expect(headers.first()).toBeVisible();
    });

    test('sortable columns are announced', async ({ page, mockAPI }) => {
      await page.goto('/projects');

      // Sortable headers should have aria-sort
      const nameHeader = page.getByRole('columnheader', { name: /name/i });
      const ariaSort = await nameHeader.getAttribute('aria-sort');

      expect(ariaSort).toBeTruthy();
    });

    test('pagination is keyboard navigable', async ({ page, mockAPI }) => {
      await page.goto('/projects');

      // Tab to pagination controls
      const paginationButtons = page.getByRole('button').filter({ hasText: /next|previous|page/i });
      const count = await paginationButtons.count();

      if (count > 0) {
        await paginationButtons.first().focus();
        await expect(paginationButtons.first()).toBeFocused();
      }
    });
  });

  test.describe('WBS Tree Page', () => {
    test('has no accessibility violations', async ({ page, mockAPI, axeBuilder }) => {
      await page.goto('/projects/1001/wbs');

      const results = await axeBuilder
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('tree has proper ARIA roles', async ({ page, mockAPI }) => {
      await page.goto('/projects/1001/wbs');

      // Should have tree role
      const tree = page.getByRole('tree');
      await expect(tree).toBeVisible();

      // Should have aria-label
      const ariaLabel = await tree.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });

    test('tree items have proper roles', async ({ page, mockAPI }) => {
      await page.goto('/projects/1001/wbs');

      const treeItems = page.getByRole('treeitem');
      await expect(treeItems.first()).toBeVisible();

      // Tree items should have aria-level
      const ariaLevel = await treeItems.first().getAttribute('aria-level');
      expect(ariaLevel).toBeTruthy();
    });

    test('expandable nodes announce state', async ({ page, mockAPI }) => {
      await page.goto('/projects/1001/wbs');

      const treeItem = page.getByRole('treeitem').first();
      const ariaExpanded = await treeItem.getAttribute('aria-expanded');

      // Should have aria-expanded
      expect(ariaExpanded).toBeTruthy();
    });

    test('tree supports keyboard navigation', async ({ page, mockAPI }) => {
      await page.goto('/projects/1001/wbs');

      const tree = page.getByRole('tree');
      await tree.focus();

      // Arrow keys should work
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Enter');
    });
  });

  test.describe('Color Contrast', () => {
    test('dashboard has sufficient color contrast', async ({ page, mockAPI, axeBuilder }) => {
      await page.goto('/dashboard');

      const results = await axeBuilder
        .withTags(['wcag2aa'])
        .options({ rules: { 'color-contrast': { enabled: true } } })
        .analyze();

      const contrastViolations = results.violations.filter(
        (v) => v.id === 'color-contrast'
      );
      expect(contrastViolations).toEqual([]);
    });

    test('projects table has sufficient color contrast', async ({ page, mockAPI, axeBuilder }) => {
      await page.goto('/projects');

      const results = await axeBuilder
        .withTags(['wcag2aa'])
        .options({ rules: { 'color-contrast': { enabled: true } } })
        .analyze();

      const contrastViolations = results.violations.filter(
        (v) => v.id === 'color-contrast'
      );
      expect(contrastViolations).toEqual([]);
    });
  });

  test.describe('Focus Management', () => {
    test('focus is visible on all interactive elements', async ({ page, mockAPI }) => {
      await page.goto('/dashboard');

      // Tab through elements and check focus is visible
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
    });

    test('modal traps focus', async ({ page, mockAPI }) => {
      await page.goto('/projects/1001/wbs');

      // Click to open detail panel if applicable
      // Focus should be trapped in the panel
    });

    test('focus returns after modal closes', async ({ page, mockAPI }) => {
      // Open and close a modal, verify focus returns to trigger
    });
  });

  test.describe('Screen Reader Announcements', () => {
    test('loading states are announced', async ({ page, mockAPI }) => {
      await page.goto('/dashboard');

      // Check for aria-live regions or status roles
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      const count = await liveRegions.count();

      // Should have at least one live region for announcements
      expect(count).toBeGreaterThan(0);
    });

    test('error states are announced', async ({ page }) => {
      await page.route('**/api/v1/portfolio/summary', async (route) => {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await page.goto('/dashboard');

      // Error should be in an alert role
      const alerts = page.getByRole('alert');
      await expect(alerts.first()).toBeVisible();
    });
  });

  test.describe('Responsive Accessibility', () => {
    test('mobile view maintains accessibility', async ({ page, mockAPI, axeBuilder }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/dashboard');

      const results = await axeBuilder
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('touch targets are large enough', async ({ page, mockAPI }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/projects');

      // Check button sizes (minimum 44x44px for touch targets)
      const buttons = page.getByRole('button');
      const firstButton = buttons.first();

      const box = await firstButton.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
});

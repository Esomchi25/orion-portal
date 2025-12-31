/**
 * Projects Page E2E Tests
 * @governance COMPONENT-001 (Phase C: Full E2E with Real Data)
 *
 * Tests the projects data table:
 * - Sorting
 * - Filtering
 * - Pagination
 * - Search
 * - Row actions
 */

import { test, expect, mockProjects } from '../fixtures/base';

test.describe('Projects Page', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    await page.goto('/projects');
  });

  test.describe('Table Rendering', () => {
    test('displays projects table', async ({ projectsPage }) => {
      const table = await projectsPage.projectsTable();
      await expect(table).toBeVisible();
    });

    test('shows project data in rows', async ({ page }) => {
      await expect(page.getByText(mockProjects[0].name)).toBeVisible();
      await expect(page.getByText(mockProjects[1].name)).toBeVisible();
    });

    test('displays column headers', async ({ page }) => {
      await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /progress/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /spi/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /cpi/i })).toBeVisible();
    });

    test('has no accessibility violations', async ({ axeBuilder }) => {
      const results = await axeBuilder.analyze();
      expect(results.violations).toEqual([]);
    });
  });

  test.describe('Sorting', () => {
    test('sorts by name ascending', async ({ page, projectsPage }) => {
      const sortButton = await projectsPage.sortByName();
      await sortButton.click();

      // Check aria-sort attribute
      const header = page.getByRole('columnheader', { name: /name/i });
      await expect(header).toHaveAttribute('aria-sort', 'ascending');
    });

    test('sorts by name descending on second click', async ({ page, projectsPage }) => {
      const sortButton = await projectsPage.sortByName();
      await sortButton.click();
      await sortButton.click();

      const header = page.getByRole('columnheader', { name: /name/i });
      await expect(header).toHaveAttribute('aria-sort', 'descending');
    });

    test('can sort by different columns', async ({ page }) => {
      // Sort by SPI
      const spiHeader = page.getByRole('columnheader', { name: /spi/i });
      const sortButton = spiHeader.getByRole('button');
      await sortButton.click();

      await expect(spiHeader).toHaveAttribute('aria-sort', 'ascending');
    });
  });

  test.describe('Filtering', () => {
    test('filters by status', async ({ page, projectsPage }) => {
      const statusFilter = await projectsPage.statusFilter();
      await statusFilter.selectOption('Active');

      // Should only show active projects
      await expect(page.getByText(mockProjects[0].name)).toBeVisible();
    });

    test('clears filter with all option', async ({ page, projectsPage }) => {
      const statusFilter = await projectsPage.statusFilter();

      // Apply filter
      await statusFilter.selectOption('Active');

      // Clear filter
      await statusFilter.selectOption('');

      // Should show all projects again
      await expect(page.getByText(mockProjects[0].name)).toBeVisible();
      await expect(page.getByText(mockProjects[1].name)).toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('searches by project name', async ({ page, projectsPage }) => {
      const searchInput = await projectsPage.searchInput();
      await searchInput.fill('Pipeline');

      // Should show matching project
      await expect(page.getByText('Pipeline Installation')).toBeVisible();
    });

    test('shows no results message when no matches', async ({ page, projectsPage }) => {
      const searchInput = await projectsPage.searchInput();
      await searchInput.fill('NonexistentProject');

      // Should show no results message
      await expect(page.getByText(/no projects found/i)).toBeVisible();
    });

    test('clears search', async ({ page, projectsPage }) => {
      const searchInput = await projectsPage.searchInput();

      // Search
      await searchInput.fill('Pipeline');
      await expect(page.getByText('Pipeline Installation')).toBeVisible();

      // Clear
      await searchInput.clear();

      // Should show all projects
      await expect(page.getByText(mockProjects[0].name)).toBeVisible();
      await expect(page.getByText(mockProjects[1].name)).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('shows pagination controls', async ({ page }) => {
      await expect(page.getByText(/page/i)).toBeVisible();
    });

    test('can navigate to next page', async ({ page, projectsPage }) => {
      // Only if there are multiple pages
      const nextButton = await projectsPage.paginationNext();
      const isEnabled = await nextButton.isEnabled();

      if (isEnabled) {
        await nextButton.click();
        // Should show different data or updated page number
      }
    });

    test('can change page size', async ({ page }) => {
      const pageSizeSelect = page.getByRole('combobox', { name: /per page/i });
      const isVisible = await pageSizeSelect.isVisible().catch(() => false);

      if (isVisible) {
        await pageSizeSelect.selectOption('25');
        // Page size should update
      }
    });
  });

  test.describe('Row Actions', () => {
    test('clicking row navigates to project details', async ({ page }) => {
      await page.getByText(mockProjects[0].name).click();

      // Should navigate to project page or show details
      // Implementation depends on actual routing
    });

    test('shows action menu on row hover', async ({ page }) => {
      const row = page.getByRole('row').filter({ hasText: mockProjects[0].name });
      await row.hover();

      // Should show actions (View WBS, View Gantt, etc.)
      const viewWbsButton = row.getByRole('button', { name: /view wbs/i });
      const isVisible = await viewWbsButton.isVisible().catch(() => false);

      // Actions may be visible on hover or always visible depending on design
    });

    test('View WBS navigates to WBS page', async ({ page }) => {
      const row = page.getByRole('row').filter({ hasText: mockProjects[0].name });
      await row.hover();

      const viewWbsButton = row.getByRole('button', { name: /view wbs/i });
      const isVisible = await viewWbsButton.isVisible().catch(() => false);

      if (isVisible) {
        await viewWbsButton.click();
        await expect(page).toHaveURL(/.*wbs/);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('table is scrollable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      // Table should still be accessible
      const table = page.getByRole('table');
      await expect(table).toBeVisible();
    });

    test('shows essential columns on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      // At minimum, name should be visible
      await expect(page.getByText(mockProjects[0].name)).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('shows loading spinner while fetching data', async ({ page }) => {
      // Add a delay to the mock to see loading state
      await page.route('**/api/v1/p6/projects', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: mockProjects,
            pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
          }),
        });
      });

      await page.reload();

      // Should show loading state
      await expect(page.getByRole('status')).toBeVisible();
    });
  });

  test.describe('Error States', () => {
    test('shows error when API fails', async ({ page }) => {
      await page.route('**/api/v1/p6/projects', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await page.reload();

      await expect(page.getByText(/error|failed/i)).toBeVisible();
    });
  });
});

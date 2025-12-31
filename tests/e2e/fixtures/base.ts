/**
 * E2E Test Fixtures
 * @governance COMPONENT-001 (Phase C: Full E2E with Real Data)
 *
 * Provides:
 * - Page objects for each major page
 * - Mock API handlers
 * - Test data factories
 * - Accessibility testing utilities
 */

import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockP6Connection = {
  wsdlUrl: 'https://p6.example.com/p6ws/services/ProjectService?wsdl',
  username: 'admin',
  password: 'password123',
  databaseInstance: 'P6EPPM',
};

export const mockSAPConnection = {
  hostUrl: 'https://sap.example.com:44300',
  client: '100',
  username: 'sapuser',
  password: 'sappass123',
  systemId: 'PRD',
};

export const mockProjects = [
  {
    id: 'proj-1',
    objectId: 1001,
    projectId: 'PRJ-001',
    name: 'Pipeline Installation',
    status: 'Active',
    percentComplete: 65,
    plannedStart: '2024-01-15T00:00:00Z',
    plannedFinish: '2024-12-31T00:00:00Z',
    actualStart: '2024-01-20T00:00:00Z',
    dataDate: '2024-06-15T00:00:00Z',
    budgetAtCompletion: 5000000,
    spi: 0.95,
    cpi: 1.02,
  },
  {
    id: 'proj-2',
    objectId: 1002,
    projectId: 'PRJ-002',
    name: 'Refinery Upgrade',
    status: 'Active',
    percentComplete: 35,
    plannedStart: '2024-03-01T00:00:00Z',
    plannedFinish: '2025-06-30T00:00:00Z',
    actualStart: '2024-03-15T00:00:00Z',
    dataDate: '2024-06-15T00:00:00Z',
    budgetAtCompletion: 12000000,
    spi: 0.88,
    cpi: 0.92,
  },
];

export const mockPortfolioSummary = {
  totalProjects: 15,
  activeProjects: 12,
  totalBudget: 45000000,
  totalActuals: 22500000,
  averageSPI: 0.94,
  averageCPI: 0.98,
  healthBreakdown: {
    onTrack: 8,
    atRisk: 3,
    critical: 1,
  },
};

export const mockWBSTree = {
  nodes: [
    {
      id: 'wbs-1',
      objectId: 1001,
      parentObjectId: null,
      wbsCode: '1',
      name: 'Project Root',
      percentComplete: 45,
      budgetAtCompletion: 1000000,
      plannedTotalCost: 950000,
      actualTotalCost: 425000,
      hierarchyLevel: 0,
      activityCount: 50,
      children: [
        {
          id: 'wbs-2',
          objectId: 1002,
          parentObjectId: 1001,
          wbsCode: '1.1',
          name: 'Engineering',
          percentComplete: 60,
          budgetAtCompletion: 500000,
          plannedTotalCost: 480000,
          actualTotalCost: 300000,
          hierarchyLevel: 1,
          activityCount: 25,
          children: [],
          isExpanded: false,
          sapMapped: true,
        },
        {
          id: 'wbs-3',
          objectId: 1003,
          parentObjectId: 1001,
          wbsCode: '1.2',
          name: 'Procurement',
          percentComplete: 30,
          budgetAtCompletion: 500000,
          plannedTotalCost: 470000,
          actualTotalCost: 125000,
          hierarchyLevel: 1,
          activityCount: 25,
          children: [],
          isExpanded: false,
          sapMapped: true,
        },
      ],
      isExpanded: true,
      sapMapped: true,
    },
  ],
  totalCount: 3,
};

// ============================================================================
// PAGE OBJECTS
// ============================================================================

export class OnboardingPage {
  constructor(private page: import('@playwright/test').Page) {}

  // Welcome Screen
  async getStartedButton() {
    return this.page.getByRole('button', { name: /get started/i });
  }

  async welcomeHeading() {
    return this.page.getByRole('heading', { name: /welcome to orion/i });
  }

  // P6 Connection Form
  async p6WsdlInput() {
    return this.page.getByLabel(/wsdl url/i);
  }

  async p6UsernameInput() {
    return this.page.getByLabel(/username/i);
  }

  async p6PasswordInput() {
    return this.page.getByLabel(/password/i);
  }

  async p6DatabaseInput() {
    return this.page.getByLabel(/database instance/i);
  }

  async p6TestConnectionButton() {
    return this.page.getByRole('button', { name: /test connection/i });
  }

  async p6NextButton() {
    return this.page.getByRole('button', { name: /next/i });
  }

  // SAP Connection Form
  async sapHostInput() {
    return this.page.getByLabel(/host url/i);
  }

  async sapClientInput() {
    return this.page.getByLabel(/client/i);
  }

  async sapUsernameInput() {
    return this.page.getByLabel(/username/i);
  }

  async sapPasswordInput() {
    return this.page.getByLabel(/password/i);
  }

  async sapSystemIdInput() {
    return this.page.getByLabel(/system id/i);
  }

  async sapTestConnectionButton() {
    return this.page.getByRole('button', { name: /test connection/i });
  }

  // Completion Step
  async completionHeading() {
    return this.page.getByRole('heading', { name: /setup complete/i });
  }

  async goToDashboardButton() {
    return this.page.getByRole('button', { name: /go to dashboard/i });
  }
}

export class DashboardPage {
  constructor(private page: import('@playwright/test').Page) {}

  async portfolioCard() {
    return this.page.locator('[data-testid="portfolio-summary"]');
  }

  async projectHealthCard() {
    return this.page.locator('[data-testid="project-health"]');
  }

  async syncStatusCard() {
    return this.page.locator('[data-testid="sync-status"]');
  }

  async totalProjectsValue() {
    return this.page.getByText(/total projects/i).locator('..').getByRole('heading');
  }

  async refreshButton() {
    return this.page.getByRole('button', { name: /refresh/i });
  }
}

export class ProjectsPage {
  constructor(private page: import('@playwright/test').Page) {}

  async projectsTable() {
    return this.page.getByRole('table');
  }

  async searchInput() {
    return this.page.getByRole('textbox', { name: /search/i });
  }

  async statusFilter() {
    return this.page.getByRole('combobox', { name: /status/i });
  }

  async projectRows() {
    return this.page.getByRole('row').filter({ hasNot: this.page.getByRole('columnheader') });
  }

  async sortByName() {
    return this.page.getByRole('columnheader', { name: /name/i }).getByRole('button');
  }

  async paginationNext() {
    return this.page.getByRole('button', { name: /next/i });
  }
}

export class WBSPage {
  constructor(private page: import('@playwright/test').Page) {}

  async wbsTree() {
    return this.page.getByRole('tree', { name: /wbs tree/i });
  }

  async wbsNodes() {
    return this.page.getByRole('treeitem');
  }

  async expandButton(nodeName: string) {
    return this.page
      .getByRole('treeitem')
      .filter({ hasText: nodeName })
      .getByRole('button', { name: /expand/i });
  }

  async collapseButton(nodeName: string) {
    return this.page
      .getByRole('treeitem')
      .filter({ hasText: nodeName })
      .getByRole('button', { name: /collapse/i });
  }

  async detailPanel() {
    return this.page.getByRole('dialog', { name: /wbs details/i });
  }

  async detailPanelClose() {
    return this.page.getByRole('button', { name: /close/i });
  }
}

// ============================================================================
// FIXTURES
// ============================================================================

type Fixtures = {
  onboardingPage: OnboardingPage;
  dashboardPage: DashboardPage;
  projectsPage: ProjectsPage;
  wbsPage: WBSPage;
  mockAPI: void;
  axeBuilder: AxeBuilder;
};

export const test = base.extend<Fixtures>({
  onboardingPage: async ({ page }, use) => {
    await use(new OnboardingPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },

  wbsPage: async ({ page }, use) => {
    await use(new WBSPage(page));
  },

  mockAPI: async ({ page }, use) => {
    // Mock all API endpoints
    await page.route('**/api/v1/p6/connection/test', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Connection successful' }),
      });
    });

    await page.route('**/api/v1/sap/connection/test', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Connection successful' }),
      });
    });

    await page.route('**/api/v1/portfolio/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPortfolioSummary),
      });
    });

    await page.route('**/api/v1/projects/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ projects: mockProjects }),
      });
    });

    await page.route('**/api/v1/p6/projects', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockProjects,
          pagination: {
            page: 1,
            pageSize: 10,
            total: mockProjects.length,
            totalPages: 1,
          },
        }),
      });
    });

    await page.route('**/api/v1/sync/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          p6: { connected: true, lastSync: new Date().toISOString() },
          sap: { connected: true, lastSync: new Date().toISOString() },
        }),
      });
    });

    await page.route('**/api/v1/p6/projects/*/wbs', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWBSTree),
      });
    });

    await use();
  },

  axeBuilder: async ({ page }, use) => {
    await use(new AxeBuilder({ page }));
  },
});

export { expect };

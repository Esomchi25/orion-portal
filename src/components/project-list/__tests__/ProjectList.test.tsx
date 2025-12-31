/**
 * Project List Component Tests
 * @governance COMPONENT-001
 *
 * Test Types:
 * 1. Unit Tests - Rendering, data display, interactions
 * 2. Integration Tests - API interactions
 * 3. Accessibility Tests - WCAG 2.1 AA compliance
 * 4. Performance Tests - Render time < 100ms
 * 5. Snapshot Tests - Visual regression
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProjectsDataTable } from '../ProjectList';
import type {
  P6Project,
  StatusOption,
  EPSOption,
  ProjectsDataTableProps,
} from '../types';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockProjects: P6Project[] = [
  {
    id: 'uuid-001',
    objectId: 1001,
    projectId: 'PROJ-001',
    name: 'ACME Refinery Expansion',
    status: 'Active',
    percentComplete: 35,
    plannedStart: '2024-01-15',
    plannedFinish: '2026-06-30',
    actualStart: '2024-01-20',
    dataDate: '2024-12-01',
    budgetAtCompletion: 15000000,
    spi: 0.92,
    cpi: 0.88,
  },
  {
    id: 'uuid-002',
    objectId: 1002,
    projectId: 'PROJ-002',
    name: 'Offshore Platform Alpha',
    status: 'Active',
    percentComplete: 68,
    plannedStart: '2023-06-01',
    plannedFinish: '2025-12-31',
    actualStart: '2023-06-15',
    dataDate: '2024-12-01',
    budgetAtCompletion: 45000000,
    spi: 1.05,
    cpi: 0.98,
  },
  {
    id: 'uuid-003',
    objectId: 1003,
    projectId: 'PROJ-003',
    name: 'Pipeline Network Beta',
    status: 'Inactive',
    percentComplete: 12,
    plannedStart: '2024-09-01',
    plannedFinish: '2027-03-15',
    actualStart: null,
    dataDate: '2024-12-01',
    budgetAtCompletion: 8500000,
    spi: 0.72,
    cpi: 0.75,
  },
  {
    id: 'uuid-004',
    objectId: 1004,
    projectId: 'PROJ-004',
    name: 'Gas Processing Facility',
    status: 'Active',
    percentComplete: 89,
    plannedStart: '2022-03-01',
    plannedFinish: '2025-03-31',
    actualStart: '2022-03-10',
    dataDate: '2024-12-01',
    budgetAtCompletion: 28000000,
    spi: 1.12,
    cpi: 1.05,
  },
  {
    id: 'uuid-005',
    objectId: 1005,
    projectId: 'PROJ-005',
    name: 'Terminal Upgrade Project',
    status: 'Active',
    percentComplete: 50,
    plannedStart: '2024-03-01',
    plannedFinish: '2025-09-30',
    actualStart: '2024-03-15',
    dataDate: '2024-12-01',
    budgetAtCompletion: 12000000,
    spi: 0.95,
    cpi: 0.92,
  },
];

const mockStatuses: StatusOption[] = [
  { value: 'Active', label: 'Active', count: 4 },
  { value: 'Inactive', label: 'Inactive', count: 1 },
];

const mockEPS: EPSOption[] = [
  { objectId: 101, name: 'Oil & Gas', projectCount: 3 },
  { objectId: 102, name: 'Petrochemical', projectCount: 2 },
];

const defaultProps: ProjectsDataTableProps = {
  tenantId: 'tenant-001',
  onProjectClick: vi.fn(),
  onViewWBS: vi.fn(),
  onViewGantt: vi.fn(),
};

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to mock successful API responses
function mockSuccessfulAPIs() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/v1/p6/projects/statuses')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStatuses),
      });
    }
    if (url.includes('/api/v1/p6/eps')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEPS),
      });
    }
    if (url.includes('/api/v1/p6/projects')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockProjects,
            pagination: {
              page: 1,
              pageSize: 20,
              total: 5,
              totalPages: 1,
            },
          }),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
}

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('ProjectsDataTable - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockSuccessfulAPIs();
  });

  describe('Rendering', () => {
    it('displays table title', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/projects/i);
      });
    });

    it('shows loading skeleton initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<ProjectsDataTable {...defaultProps} />);

      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
    });

    it('displays table with data after loading', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });

    it('displays all projects in the table', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
        expect(screen.getByText('Offshore Platform Alpha')).toBeInTheDocument();
        expect(screen.getByText('Pipeline Network Beta')).toBeInTheDocument();
        expect(screen.getByText('Gas Processing Facility')).toBeInTheDocument();
        expect(screen.getByText('Terminal Upgrade Project')).toBeInTheDocument();
      });
    });

    it('displays project ID column', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('PROJ-001')).toBeInTheDocument();
        expect(screen.getByText('PROJ-002')).toBeInTheDocument();
      });
    });

    it('displays status badges', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        // Multiple Active statuses in the table
        const activeElements = screen.getAllByText(/active/i);
        expect(activeElements.length).toBeGreaterThan(0);
      });
    });

    it('displays percent complete with progress indicator', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('35%')).toBeInTheDocument();
        expect(screen.getByText('68%')).toBeInTheDocument();
      });
    });

    it('displays SPI values with color coding', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        // SPI values may appear multiple times (in filter dropdown counts too)
        expect(within(table).getAllByText('0.92').length).toBeGreaterThan(0);
        expect(within(table).getAllByText('1.05').length).toBeGreaterThan(0);
      });
    });

    it('displays CPI values with color coding', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        // CPI values may appear multiple times
        expect(within(table).getAllByText('0.88').length).toBeGreaterThan(0);
        expect(within(table).getAllByText('0.98').length).toBeGreaterThan(0);
      });
    });

    it('shows N/A for null SPI/CPI values', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/v1/p6/projects') && !url.includes('statuses')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [{ ...mockProjects[0], spi: null, cpi: null }],
                pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
              }),
          });
        }
        return mockSuccessfulAPIs()(url);
      });

      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        const naElements = screen.getAllByText(/n\/a/i);
        expect(naElements.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Table Headers', () => {
    it('displays all column headers', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: /project id/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /progress/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /spi/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /cpi/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /planned finish/i })).toBeInTheDocument();
      });
    });

    it('indicates sortable columns', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        const nameHeader = screen.getByRole('columnheader', { name: /name/i });
        expect(nameHeader).toHaveAttribute('aria-sort');
      });
    });
  });

  describe('Sorting', () => {
    it('sorts by name when name header is clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      // Click the button inside the Name header, not the header itself
      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      const sortButton = within(nameHeader).getByRole('button');
      await user.click(sortButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('sortBy=name'),
          expect.any(Object)
        );
      });
    });

    it('toggles sort direction on subsequent clicks', async () => {
      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      // Click the button inside the header twice to toggle direction
      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      const sortButton = within(nameHeader).getByRole('button');
      await user.click(sortButton);
      await user.click(sortButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('sortDir=desc'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Filtering', () => {
    it('displays status filter dropdown', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
      });
    });

    it('filters by status when option is selected', async () => {
      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      // Use selectOptions for native select elements
      await user.selectOptions(statusSelect, 'Active');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('status=Active'),
          expect.any(Object)
        );
      });
    });

    it('displays search input', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('searchbox')).toBeInTheDocument();
      });
    });

    it('searches when text is entered', async () => {
      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('searchbox')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'refinery');

      // Wait for debounce
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('search=refinery'),
            expect.any(Object)
          );
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Pagination', () => {
    it('displays pagination controls', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        // Pagination has previous/next buttons
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      });
    });

    it('shows current page and total', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/1.*of.*1/i)).toBeInTheDocument();
      });
    });

    it('navigates to next page when next is clicked', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/v1/p6/projects') && !url.includes('statuses')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: mockProjects,
                pagination: { page: 1, pageSize: 20, total: 45, totalPages: 3 },
              }),
          });
        }
        if (url.includes('/api/v1/p6/projects/statuses')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStatuses),
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });
    });

    it('disables previous button on first page', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      });
    });

    it('allows changing page size', async () => {
      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /rows per page/i })).toBeInTheDocument();
      });

      const pageSizeSelect = screen.getByRole('combobox', { name: /rows per page/i });
      await user.selectOptions(pageSizeSelect, '50');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('pageSize=50'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Row Actions', () => {
    it('calls onProjectClick when row is clicked', async () => {
      const onProjectClick = vi.fn();
      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} onProjectClick={onProjectClick} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const row = screen.getByText('ACME Refinery Expansion').closest('tr');
      if (row) {
        await user.click(row);
        expect(onProjectClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'ACME Refinery Expansion' }));
      }
    });

    it('displays action buttons for each row', async () => {
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        const wbsButtons = screen.getAllByRole('button', { name: /wbs/i });
        expect(wbsButtons.length).toBe(5);
      });
    });

    it('calls onViewWBS when WBS button is clicked', async () => {
      const onViewWBS = vi.fn();
      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} onViewWBS={onViewWBS} />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /wbs/i })[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole('button', { name: /wbs/i })[0]);
      expect(onViewWBS).toHaveBeenCalledWith(expect.objectContaining({ name: 'ACME Refinery Expansion' }));
    });

    it('calls onViewGantt when Gantt button is clicked', async () => {
      const onViewGantt = vi.fn();
      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} onViewGantt={onViewGantt} />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /gantt/i })[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByRole('button', { name: /gantt/i })[0]);
      expect(onViewGantt).toHaveBeenCalledWith(expect.objectContaining({ name: 'ACME Refinery Expansion' }));
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load projects/i)).toBeInTheDocument();
      });
    });

    it('provides retry button on error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('retries API call when retry is clicked', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return mockSuccessfulAPIs()('/api/v1/p6/projects');
      });

      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /retry/i }));

      await waitFor(() => {
        expect(callCount).toBeGreaterThan(1);
      });
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no projects', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/v1/p6/projects') && !url.includes('statuses')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [],
                pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
              }),
          });
        }
        if (url.includes('/api/v1/p6/projects/statuses')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
      });
    });

    it('suggests clearing filters when filtered empty', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/v1/p6/projects') && !url.includes('statuses')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [],
                pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
              }),
          });
        }
        if (url.includes('/api/v1/p6/projects/statuses')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStatuses),
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const user = userEvent.setup();
      render(<ProjectsDataTable {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
      });

      // Apply a filter using selectOptions for native select
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.selectOptions(statusSelect, 'Inactive');

      await waitFor(() => {
        expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('ProjectsDataTable - Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockSuccessfulAPIs();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper heading hierarchy', async () => {
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });
  });

  it('table has proper ARIA attributes', async () => {
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label');
    });
  });

  it('sort buttons are keyboard accessible', async () => {
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      const sortableHeaders = screen.getAllByRole('columnheader');
      sortableHeaders.forEach((header) => {
        const sortButton = within(header).queryByRole('button');
        if (sortButton) {
          expect(sortButton).toHaveAttribute('tabindex', '0');
        }
      });
    });
  });

  it('pagination controls are keyboard accessible', async () => {
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(prevButton).toHaveAttribute('tabindex');
      expect(nextButton).toHaveAttribute('tabindex');
    });
  });

  it('filter dropdowns have accessible labels', async () => {
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      expect(statusSelect).toHaveAccessibleName();
    });
  });

  it('search input has accessible label', async () => {
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAccessibleName();
    });
  });

  it('announces loading state to screen readers', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<ProjectsDataTable {...defaultProps} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('ProjectsDataTable - Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches projects on mount', async () => {
    mockSuccessfulAPIs();
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/p6/projects'),
        expect.any(Object)
      );
    });
  });

  it('fetches statuses for filter on mount', async () => {
    mockSuccessfulAPIs();
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/p6/projects/statuses'),
        expect.any(Object)
      );
    });
  });

  it('passes tenant ID in API requests', async () => {
    mockSuccessfulAPIs();
    render(<ProjectsDataTable {...defaultProps} tenantId="custom-tenant" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('tenant=custom-tenant'),
        expect.any(Object)
      );
    });
  });

  it('refetches when filters change', async () => {
    mockSuccessfulAPIs();
    const user = userEvent.setup();
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
    });

    const initialCallCount = mockFetch.mock.calls.length;

    // Use selectOptions for native select elements
    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    await user.selectOptions(statusSelect, 'Active');

    await waitFor(() => {
      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('refetches when sorting changes', async () => {
    mockSuccessfulAPIs();
    const user = userEvent.setup();
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const initialCallCount = mockFetch.mock.calls.length;

    // Click the sort button inside the header
    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    const sortButton = within(nameHeader).getByRole('button');
    await user.click(sortButton);

    await waitFor(() => {
      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('ProjectsDataTable - Performance Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockSuccessfulAPIs();
  });

  it('renders under 100ms', () => {
    const start = performance.now();
    render(<ProjectsDataTable {...defaultProps} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(100);
  });

  it('handles large datasets efficiently', async () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      ...mockProjects[0],
      id: `uuid-${i}`,
      objectId: 1000 + i,
      projectId: `PROJ-${String(i).padStart(3, '0')}`,
      name: `Project ${i}`,
    }));

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/v1/p6/projects') && !url.includes('statuses')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: largeDataset,
              pagination: { page: 1, pageSize: 100, total: 100, totalPages: 1 },
            }),
        });
      }
      return mockSuccessfulAPIs()(url);
    });

    const start = performance.now();
    render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const end = performance.now();
    expect(end - start).toBeLessThan(500);
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('ProjectsDataTable - Snapshot Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('matches loading state snapshot', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<ProjectsDataTable {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('matches loaded state snapshot', async () => {
    mockSuccessfulAPIs();
    const { container } = render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('matches error state snapshot', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const { container } = render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('matches empty state snapshot', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/v1/p6/projects') && !url.includes('statuses')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [],
              pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
            }),
        });
      }
      if (url.includes('/api/v1/p6/projects/statuses')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = render(<ProjectsDataTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});

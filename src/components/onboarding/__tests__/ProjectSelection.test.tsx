/**
 * ProjectSelection Component Tests
 * @governance COMPONENT-001
 *
 * Test Types:
 * 1. Unit Tests - List rendering, selection, search
 * 2. Integration Tests - API interactions
 * 3. Accessibility Tests - WCAG 2.1 AA compliance
 * 4. Performance Tests - Render time < 100ms
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProjectSelection } from '../ProjectSelection';
import type { ProjectSelectionProps, P6Project } from '../types';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockProjects: P6Project[] = [
  {
    projectId: 1,
    projectName: 'ACME Refinery Expansion',
    projectCode: 'ACME-REF-001',
    startDate: '2024-01-15',
    finishDate: '2026-06-30',
    status: 'Active',
    percentComplete: 35,
  },
  {
    projectId: 2,
    projectName: 'Offshore Platform Alpha',
    projectCode: 'OFF-PLT-A',
    startDate: '2023-06-01',
    finishDate: '2025-12-31',
    status: 'Active',
    percentComplete: 68,
  },
  {
    projectId: 3,
    projectName: 'Pipeline Network Phase 2',
    projectCode: 'PIPE-NET-2',
    startDate: '2024-03-01',
    finishDate: '2025-09-30',
    status: 'Planned',
    percentComplete: 0,
  },
  {
    projectId: 4,
    projectName: 'Legacy Terminal Upgrade',
    projectCode: 'LEG-TERM',
    startDate: '2022-01-01',
    finishDate: '2024-01-31',
    status: 'Complete',
    percentComplete: 100,
  },
];

const defaultProps: ProjectSelectionProps = {
  onNext: vi.fn(),
  onBack: vi.fn(),
  p6Config: {
    wsdlBaseUrl: 'https://p6.acme-epc.com/p6ws/services/',
    databaseInstance: 'PMDB',
    username: 'admin',
    password: 'secret123',
  },
};

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('ProjectSelection - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    // Default: successful project fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    });
  });

  describe('Rendering', () => {
    it('displays step indicator showing step 4 of 5', async () => {
      render(<ProjectSelection {...defaultProps} />);

      // The ProgressIndicator renders "STEP X OF Y" in a badge
      // Use getAllByText since step number appears in multiple places (badge + step circle)
      await waitFor(() => {
        expect(screen.getByText('STEP')).toBeInTheDocument();
        expect(screen.getAllByText('4').length).toBeGreaterThan(0);
        expect(screen.getByText('OF 5')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching projects', () => {
      mockFetch.mockReset();
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ProjectSelection {...defaultProps} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText(/loading projects/i)).toBeInTheDocument();
    });

    it('displays projects list after loading', async () => {
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
        expect(screen.getByText('Offshore Platform Alpha')).toBeInTheDocument();
      });
    });

    it('shows project details for each project', async () => {
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME-REF-001')).toBeInTheDocument();
        expect(screen.getByText(/35%/)).toBeInTheDocument();
        // Multiple projects have Active status
        const activeStatuses = screen.getAllByText('Active');
        expect(activeStatuses.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('renders Back and Continue buttons', async () => {
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
    });

    it('displays search input', async () => {
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });
    });

    it('shows project count', async () => {
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/4 projects/i)).toBeInTheDocument();
      });
    });
  });

  describe('Project Selection', () => {
    it('allows selecting a project by clicking', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
      await user.click(projectCard!);

      expect(projectCard).toHaveAttribute('data-selected', 'true');
    });

    it('allows selecting multiple projects', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const project1 = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
      const project2 = screen.getByText('Offshore Platform Alpha').closest('[data-testid]');

      await user.click(project1!);
      await user.click(project2!);

      expect(project1).toHaveAttribute('data-selected', 'true');
      expect(project2).toHaveAttribute('data-selected', 'true');
    });

    it('allows deselecting a project by clicking again', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
      await user.click(projectCard!);
      expect(projectCard).toHaveAttribute('data-selected', 'true');

      await user.click(projectCard!);
      expect(projectCard).toHaveAttribute('data-selected', 'false');
    });

    it('shows selection count', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const project1 = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
      const project2 = screen.getByText('Offshore Platform Alpha').closest('[data-testid]');

      await user.click(project1!);
      await user.click(project2!);

      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });

    it('provides select all functionality', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const selectAllButton = screen.getByRole('button', { name: /select all/i });
      await user.click(selectAllButton);

      expect(screen.getByText(/4 selected/i)).toBeInTheDocument();
    });

    it('provides clear selection functionality', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      // Select all first
      await user.click(screen.getByRole('button', { name: /select all/i }));
      expect(screen.getByText(/4 selected/i)).toBeInTheDocument();

      // Then clear
      await user.click(screen.getByRole('button', { name: /clear/i }));
      expect(screen.getByText(/0 selected/i)).toBeInTheDocument();
    });
  });

  describe('Search/Filter', () => {
    it('filters projects by name', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Offshore');

      expect(screen.getByText('Offshore Platform Alpha')).toBeInTheDocument();
      expect(screen.queryByText('ACME Refinery Expansion')).not.toBeInTheDocument();
    });

    it('filters projects by code', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'PIPE-NET');

      expect(screen.getByText('Pipeline Network Phase 2')).toBeInTheDocument();
      expect(screen.queryByText('ACME Refinery Expansion')).not.toBeInTheDocument();
    });

    it('shows "no results" message when search has no matches', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'xyznonexistent');

      expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
    });

    it('clears search when X button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Offshore');

      expect(screen.queryByText('ACME Refinery Expansion')).not.toBeInTheDocument();

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('calls onBack when Back button is clicked', async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} onBack={onBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('disables Continue button when no projects selected', async () => {
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continue/i });
        expect(continueButton).toBeDisabled();
      });
    });

    it('enables Continue button when at least one project is selected', async () => {
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
      await user.click(projectCard!);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).not.toBeDisabled();
    });

    it('calls onNext with selected projects when Continue is clicked', async () => {
      const onNext = vi.fn();
      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} onNext={onNext} />);

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
      await user.click(projectCard!);
      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(onNext).toHaveBeenCalledTimes(1);
      expect(onNext).toHaveBeenCalledWith({
        selectedProjects: [{
          id: mockProjects[0].projectId,
          name: mockProjects[0].projectName,
          code: mockProjects[0].projectCode,
        }],
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on fetch failure', async () => {
      mockFetch.mockReset();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load projects/i)).toBeInTheDocument();
      });
    });

    it('provides retry button on error', async () => {
      mockFetch.mockReset();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<ProjectSelection {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      // Mock successful retry
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ projects: mockProjects }),
      });

      await user.click(screen.getByRole('button', { name: /retry/i }));

      await waitFor(() => {
        expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('ProjectSelection - Accessibility Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('project cards are keyboard accessible', async () => {
    render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
    });

    const projectCard = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
    expect(projectCard).toHaveAttribute('tabindex', '0');
  });

  it('supports keyboard selection with Enter', async () => {
    const user = userEvent.setup();
    render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
    });

    const projectCard = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
    projectCard?.focus();
    await user.keyboard('{Enter}');

    expect(projectCard).toHaveAttribute('data-selected', 'true');
  });

  it('supports keyboard selection with Space', async () => {
    const user = userEvent.setup();
    render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
    });

    const projectCard = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
    projectCard?.focus();
    await user.keyboard(' ');

    expect(projectCard).toHaveAttribute('data-selected', 'true');
  });

  it('announces selection changes to screen readers', async () => {
    const user = userEvent.setup();
    render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
    });

    const projectCard = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
    await user.click(projectCard!);

    expect(projectCard).toHaveAttribute('aria-selected', 'true');
  });

  it('has proper search input label', async () => {
    render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/search projects/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('ProjectSelection - Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('calls the correct API endpoint with P6 config', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    });

    render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/p6/projects',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        })
      );
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody).toEqual({
      wsdlBaseUrl: defaultProps.p6Config.wsdlBaseUrl,
      databaseInstance: defaultProps.p6Config.databaseInstance,
      username: defaultProps.p6Config.username,
      password: defaultProps.p6Config.password,
    });
  });

  it('handles empty project list', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: [] }),
    });

    render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('ProjectSelection - Performance Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    });
  });

  it('renders under 100ms', async () => {
    const start = performance.now();
    render(<ProjectSelection {...defaultProps} />);
    const end = performance.now();

    const renderTime = end - start;
    expect(renderTime).toBeLessThan(100);
  });

  it('handles large project lists efficiently', async () => {
    const largeProjectList: P6Project[] = Array.from({ length: 100 }, (_, i) => ({
      projectId: i + 1,
      projectName: `Project ${i}`,
      projectCode: `PROJ-${i}`,
      startDate: '2024-01-01',
      finishDate: '2025-12-31',
      status: 'Active',
      percentComplete: Math.floor(Math.random() * 100),
    }));

    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: largeProjectList }),
    });

    const start = performance.now();
    render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Project 0')).toBeInTheDocument();
    });

    const end = performance.now();
    expect(end - start).toBeLessThan(1000);
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('ProjectSelection - Snapshot Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('matches snapshot for loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { container } = render(<ProjectSelection {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with projects loaded', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    });

    const { container } = render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with projects selected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    });

    const user = userEvent.setup();
    const { container } = render(<ProjectSelection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
    });

    const projectCard = screen.getByText('ACME Refinery Expansion').closest('[data-testid]');
    await user.click(projectCard!);

    expect(container).toMatchSnapshot();
  });
});

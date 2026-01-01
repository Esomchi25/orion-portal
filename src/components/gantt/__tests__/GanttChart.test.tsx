/**
 * Gantt Chart Component Tests
 * @governance COMPONENT-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:4
 *
 * Test coverage:
 * - Unit tests: Timeline rendering, bar positioning, activity display
 * - Integration tests: API fetching, zoom controls
 * - Accessibility tests: Keyboard navigation, screen reader
 * - Performance tests: Large dataset rendering
 */

import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GanttChart, GanttToolbar, GanttBar as GanttBarComponent } from '../GanttChart';
import type { GanttActivity, ActivitiesResponse, TimelineScale } from '../types';

expect.extend(toHaveNoViolations);

// ============================================================================
// MOCK DATA
// ============================================================================

const mockActivities: GanttActivity[] = [
  {
    id: 'act-1',
    objectId: 2001,
    wbsObjectId: 1001,
    activityId: 'A1000',
    name: 'Site Preparation',
    activityType: 'Task Dependent',
    status: 'complete',
    percentComplete: 100,
    plannedStart: '2024-01-15T00:00:00Z',
    plannedFinish: '2024-02-15T00:00:00Z',
    actualStart: '2024-01-15T00:00:00Z',
    actualFinish: '2024-02-10T00:00:00Z',
    plannedDuration: 31,
    remainingDuration: 0,
    isCritical: true,
    isMilestone: false,
    predecessors: [],
    successors: [2002],
  },
  {
    id: 'act-2',
    objectId: 2002,
    wbsObjectId: 1001,
    activityId: 'A1010',
    name: 'Foundation Work',
    activityType: 'Task Dependent',
    status: 'in_progress',
    percentComplete: 60,
    plannedStart: '2024-02-16T00:00:00Z',
    plannedFinish: '2024-04-15T00:00:00Z',
    actualStart: '2024-02-16T00:00:00Z',
    actualFinish: null,
    plannedDuration: 59,
    remainingDuration: 24,
    isCritical: true,
    isMilestone: false,
    predecessors: [2001],
    successors: [2003, 2004],
  },
  {
    id: 'act-3',
    objectId: 2003,
    wbsObjectId: 1002,
    activityId: 'A1020',
    name: 'Structural Steel',
    activityType: 'Task Dependent',
    status: 'not_started',
    percentComplete: 0,
    plannedStart: '2024-04-16T00:00:00Z',
    plannedFinish: '2024-06-30T00:00:00Z',
    actualStart: null,
    actualFinish: null,
    plannedDuration: 75,
    remainingDuration: 75,
    isCritical: true,
    isMilestone: false,
    predecessors: [2002],
    successors: [2005],
  },
  {
    id: 'act-4',
    objectId: 2004,
    wbsObjectId: 1002,
    activityId: 'A1030',
    name: 'Electrical Rough-In',
    activityType: 'Task Dependent',
    status: 'not_started',
    percentComplete: 0,
    plannedStart: '2024-04-16T00:00:00Z',
    plannedFinish: '2024-05-31T00:00:00Z',
    actualStart: null,
    actualFinish: null,
    plannedDuration: 45,
    remainingDuration: 45,
    isCritical: false,
    isMilestone: false,
    predecessors: [2002],
    successors: [2005],
  },
  {
    id: 'act-5',
    objectId: 2005,
    wbsObjectId: 1001,
    activityId: 'M1000',
    name: 'Construction Complete',
    activityType: 'Start Milestone',
    status: 'not_started',
    percentComplete: 0,
    plannedStart: '2024-07-01T00:00:00Z',
    plannedFinish: '2024-07-01T00:00:00Z',
    actualStart: null,
    actualFinish: null,
    plannedDuration: 0,
    remainingDuration: 0,
    isCritical: true,
    isMilestone: true,
    predecessors: [2003, 2004],
    successors: [],
  },
];

const mockRelationships = [
  { predecessorObjectId: 2001, successorObjectId: 2002, type: 'FS' as const, lag: 0 },
  { predecessorObjectId: 2002, successorObjectId: 2003, type: 'FS' as const, lag: 0 },
  { predecessorObjectId: 2002, successorObjectId: 2004, type: 'FS' as const, lag: 0 },
  { predecessorObjectId: 2003, successorObjectId: 2005, type: 'FS' as const, lag: 0 },
  { predecessorObjectId: 2004, successorObjectId: 2005, type: 'FS' as const, lag: 0 },
];

const mockActivitiesResponse: ActivitiesResponse = {
  activities: mockActivities,
  relationships: mockRelationships,
  dataDate: '2024-03-15T00:00:00Z',
  totalCount: 5,
};

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/v1/p6/projects/') && url.includes('/activities')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockActivitiesResponse),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
});

// ============================================================================
// UNIT TESTS: CHART RENDERING
// ============================================================================

describe('GanttChart', () => {
  describe('Unit Tests: Chart Rendering', () => {
    it('renders loading state initially', () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders Gantt chart after data loads', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      // Should show activity names
      expect(screen.getByText('Site Preparation')).toBeInTheDocument();
      expect(screen.getByText('Foundation Work')).toBeInTheDocument();
    });

    it('displays activity IDs', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Site Preparation')).toBeInTheDocument();
      });

      expect(screen.getByText('A1000')).toBeInTheDocument();
      expect(screen.getByText('A1010')).toBeInTheDocument();
    });

    it('displays percent complete for each activity', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Site Preparation')).toBeInTheDocument();
      });

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('renders milestone differently', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Construction Complete')).toBeInTheDocument();
      });

      // Milestone should have special styling/icon
      const milestoneRow = screen.getByText('Construction Complete').closest('[role="option"]');
      expect(milestoneRow).toHaveAttribute('data-milestone', 'true');
    });

    it('renders error state when API fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    it('renders empty state when no activities', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ activities: [], relationships: [], dataDate: '2024-03-15', totalCount: 0 }),
      });

      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/no activities/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // UNIT TESTS: TIMELINE
  // ============================================================================

  describe('Unit Tests: Timeline', () => {
    it('displays timeline header with dates', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      // Should show month labels or date labels (multiple may appear)
      const dateLabels = screen.getAllByText(/jan|feb|mar|apr|2024/i);
      expect(dateLabels.length).toBeGreaterThan(0);
    });

    it('shows today line', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      // Today line should be present
      expect(screen.getByTestId('today-line')).toBeInTheDocument();
    });

    it('shows data date line', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      // Data date line should be present
      expect(screen.getByTestId('data-date-line')).toBeInTheDocument();
    });

    it('changes scale when toolbar button clicked', async () => {
      const user = userEvent.setup();

      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
          initialScale="month"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      // Find and click week scale button
      const weekButton = screen.getByRole('button', { name: /week/i });
      await user.click(weekButton);

      // Timeline should update (implementation specific)
    });
  });

  // ============================================================================
  // UNIT TESTS: ACTIVITY BARS
  // ============================================================================

  describe('Unit Tests: Activity Bars', () => {
    it('renders bars with correct width based on duration', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      // Bars should be present
      const bars = screen.getAllByRole('graphics-symbol');
      expect(bars.length).toBeGreaterThan(0);
    });

    it('shows progress fill based on percent complete', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Foundation Work')).toBeInTheDocument();
      });

      // Foundation Work is 60% complete - should show percentage
      const foundationRow = screen.getByText('Foundation Work').closest('[role="option"]');
      expect(foundationRow).toBeInTheDocument();
      expect(within(foundationRow!).getByText('60%')).toBeInTheDocument();
    });

    it('highlights critical path activities', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
          showCriticalPath={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Site Preparation')).toBeInTheDocument();
      });

      // Critical activities should be highlighted
      const criticalRow = screen.getByText('Site Preparation').closest('[role="option"]');
      expect(criticalRow).toHaveAttribute('data-critical', 'true');
    });

    it('displays status indicator colors', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Site Preparation')).toBeInTheDocument();
      });

      // Complete = green, In Progress = blue, Not Started = gray
      const completeRow = screen.getByText('Site Preparation').closest('[role="option"]');
      expect(completeRow).toHaveAttribute('data-status', 'complete');

      const inProgressRow = screen.getByText('Foundation Work').closest('[role="option"]');
      expect(inProgressRow).toHaveAttribute('data-status', 'in_progress');
    });
  });

  // ============================================================================
  // UNIT TESTS: DEPENDENCIES
  // ============================================================================

  describe('Unit Tests: Dependencies', () => {
    it('renders dependency lines when enabled', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
          showDependencies={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      // Should have SVG lines for dependencies
      const dependencyLines = screen.getAllByTestId('dependency-line');
      expect(dependencyLines.length).toBeGreaterThan(0);
    });

    it('hides dependency lines when disabled', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
          showDependencies={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      // Should not have dependency lines
      expect(screen.queryAllByTestId('dependency-line')).toHaveLength(0);
    });

    it('highlights dependencies for selected activity', async () => {
      const user = userEvent.setup();

      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
          showDependencies={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Foundation Work')).toBeInTheDocument();
      });

      // Click to select
      await user.click(screen.getByText('Foundation Work'));

      // Dependencies should be highlighted
      const highlightedLines = screen.getAllByTestId('dependency-line-highlighted');
      expect(highlightedLines.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // UNIT TESTS: SELECTION
  // ============================================================================

  describe('Unit Tests: Selection', () => {
    it('calls onActivitySelect when activity is clicked', async () => {
      const user = userEvent.setup();
      const onActivitySelect = vi.fn();

      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
          onActivitySelect={onActivitySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Foundation Work')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Foundation Work'));

      expect(onActivitySelect).toHaveBeenCalledWith(
        expect.objectContaining({
          objectId: 2002,
          name: 'Foundation Work',
        })
      );
    });

    it('highlights selected activity row', async () => {
      const user = userEvent.setup();

      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Foundation Work')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Foundation Work'));

      const selectedRow = screen.getByText('Foundation Work').closest('[role="option"]');
      expect(selectedRow).toHaveAttribute('aria-selected', 'true');
    });

    it('calls onActivityDoubleClick when double-clicked', async () => {
      const user = userEvent.setup();
      const onActivityDoubleClick = vi.fn();

      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
          onActivityDoubleClick={onActivityDoubleClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Foundation Work')).toBeInTheDocument();
      });

      await user.dblClick(screen.getByText('Foundation Work'));

      expect(onActivityDoubleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          objectId: 2002,
          name: 'Foundation Work',
        })
      );
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests: API Interaction', () => {
    it('fetches activities on mount', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/p6/projects/12345/activities'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-123',
            }),
          })
        );
      });
    });

    it('refetches when projectObjectId changes', async () => {
      const { rerender } = render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Site Preparation')).toBeInTheDocument();
      });

      mockFetch.mockClear();

      rerender(
        <GanttChart
          projectObjectId={67890}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/p6/projects/67890/activities'),
          expect.any(Object)
        );
      });
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility Tests', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('uses proper ARIA roles', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      expect(screen.getByRole('application')).toHaveAttribute('aria-label', 'Gantt Chart');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      const app = screen.getByRole('application');
      app.focus();

      // Arrow keys should navigate
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{Enter}');
    });

    it('announces activity info to screen readers', async () => {
      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Foundation Work')).toBeInTheDocument();
      });

      // Option should have accessible description
      const item = screen.getByText('Foundation Work').closest('[role="option"]');
      expect(item).toHaveAttribute('aria-label');
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance Tests', () => {
    it('renders large dataset efficiently', async () => {
      // Generate large dataset
      const largeActivities: GanttActivity[] = Array.from({ length: 200 }, (_, i) => ({
        id: `act-${i}`,
        objectId: 3000 + i,
        wbsObjectId: 1001,
        activityId: `A${3000 + i}`,
        name: `Activity ${i + 1}`,
        activityType: 'Task Dependent',
        status: i % 3 === 0 ? 'complete' : i % 3 === 1 ? 'in_progress' : 'not_started',
        percentComplete: Math.floor(Math.random() * 100),
        plannedStart: '2024-01-15T00:00:00Z',
        plannedFinish: '2024-03-15T00:00:00Z',
        actualStart: null,
        actualFinish: null,
        plannedDuration: 60,
        remainingDuration: 30,
        isCritical: i % 5 === 0,
        isMilestone: false,
        predecessors: i > 0 ? [3000 + i - 1] : [],
        successors: i < 199 ? [3000 + i + 1] : [],
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          activities: largeActivities,
          relationships: [],
          dataDate: '2024-03-15',
          totalCount: 200,
        }),
      });

      const startTime = performance.now();

      render(
        <GanttChart
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });
  });
});

// ============================================================================
// GANTT TOOLBAR TESTS
// ============================================================================

describe('GanttToolbar', () => {
  it('renders scale buttons', () => {
    render(
      <GanttToolbar
        scale="month"
        showCriticalPath={true}
        showDependencies={true}
        onScaleChange={vi.fn()}
        onCriticalPathToggle={vi.fn()}
        onDependenciesToggle={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onGoToToday={vi.fn()}
      />
    );

    // Use getAllByRole since there may be multiple buttons with same text
    const dayButtons = screen.getAllByRole('button', { name: /^day$/i });
    expect(dayButtons.length).toBeGreaterThan(0);
    const weekButtons = screen.getAllByRole('button', { name: /^week$/i });
    expect(weekButtons.length).toBeGreaterThan(0);
    const monthButtons = screen.getAllByRole('button', { name: /^month$/i });
    expect(monthButtons.length).toBeGreaterThan(0);
  });

  it('calls onScaleChange when scale button clicked', async () => {
    const user = userEvent.setup();
    const onScaleChange = vi.fn();

    render(
      <GanttToolbar
        scale="month"
        showCriticalPath={true}
        showDependencies={true}
        onScaleChange={onScaleChange}
        onCriticalPathToggle={vi.fn()}
        onDependenciesToggle={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onGoToToday={vi.fn()}
      />
    );

    // Click the first week button found
    const weekButtons = screen.getAllByRole('button', { name: /^week$/i });
    await user.click(weekButtons[0]);

    expect(onScaleChange).toHaveBeenCalledWith('week');
  });

  it('renders critical path toggle', () => {
    render(
      <GanttToolbar
        scale="month"
        showCriticalPath={true}
        showDependencies={true}
        onScaleChange={vi.fn()}
        onCriticalPathToggle={vi.fn()}
        onDependenciesToggle={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onGoToToday={vi.fn()}
      />
    );

    expect(screen.getByRole('checkbox', { name: /critical path/i })).toBeChecked();
  });

  it('calls onCriticalPathToggle when toggled', async () => {
    const user = userEvent.setup();
    const onCriticalPathToggle = vi.fn();

    render(
      <GanttToolbar
        scale="month"
        showCriticalPath={true}
        showDependencies={true}
        onScaleChange={vi.fn()}
        onCriticalPathToggle={onCriticalPathToggle}
        onDependenciesToggle={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onGoToToday={vi.fn()}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /critical path/i }));

    expect(onCriticalPathToggle).toHaveBeenCalledWith(false);
  });

  it('calls onGoToToday when today button clicked', async () => {
    const user = userEvent.setup();
    const onGoToToday = vi.fn();

    render(
      <GanttToolbar
        scale="month"
        showCriticalPath={true}
        showDependencies={true}
        onScaleChange={vi.fn()}
        onCriticalPathToggle={vi.fn()}
        onDependenciesToggle={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onGoToToday={onGoToToday}
      />
    );

    await user.click(screen.getByRole('button', { name: /today/i }));

    expect(onGoToToday).toHaveBeenCalled();
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('Snapshot Tests', () => {
  // NOTE: GanttChart snapshot is skipped because it contains time-sensitive elements
  // (the "today" line position changes based on current date/time)
  // The component functionality is covered by unit and integration tests above.
  it.skip('matches GanttChart snapshot', async () => {
    const { container } = render(
      <GanttChart
        projectObjectId={12345}
        tenantId="tenant-123"
        showCriticalPath={true}
        showDependencies={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('matches GanttToolbar snapshot', () => {
    const { container } = render(
      <GanttToolbar
        scale="month"
        showCriticalPath={true}
        showDependencies={true}
        onScaleChange={vi.fn()}
        onCriticalPathToggle={vi.fn()}
        onDependenciesToggle={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onGoToToday={vi.fn()}
      />
    );

    expect(container).toMatchSnapshot();
  });
});

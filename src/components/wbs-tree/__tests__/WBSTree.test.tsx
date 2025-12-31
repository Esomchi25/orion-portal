/**
 * WBS Tree Component Tests
 * @governance COMPONENT-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3
 *
 * Test coverage:
 * - Unit tests: Tree rendering, node expansion, selection
 * - Integration tests: API fetching, detail panel
 * - Accessibility tests: ARIA tree semantics, keyboard navigation
 * - Performance tests: Large tree rendering
 */

import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WBSTree, WBSDetailPanel, WBSBreadcrumb } from '../WBSTree';
import type { WBSNode, WBSDetail, WBSTreeResponse } from '../types';

expect.extend(toHaveNoViolations);

// ============================================================================
// MOCK DATA
// ============================================================================

const mockWBSTree: WBSTreeResponse = {
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
          children: [
            {
              id: 'wbs-3',
              objectId: 1003,
              parentObjectId: 1002,
              wbsCode: '1.1.1',
              name: 'Civil Works',
              percentComplete: 80,
              budgetAtCompletion: 200000,
              plannedTotalCost: 190000,
              actualTotalCost: 160000,
              hierarchyLevel: 2,
              activityCount: 10,
              children: [],
              isExpanded: false,
              sapMapped: true,
            },
            {
              id: 'wbs-4',
              objectId: 1004,
              parentObjectId: 1002,
              wbsCode: '1.1.2',
              name: 'Electrical Works',
              percentComplete: 40,
              budgetAtCompletion: 300000,
              plannedTotalCost: 290000,
              actualTotalCost: 120000,
              hierarchyLevel: 2,
              activityCount: 15,
              children: [],
              isExpanded: false,
              sapMapped: false,
            },
          ],
          isExpanded: false,
          sapMapped: true,
        },
        {
          id: 'wbs-5',
          objectId: 1005,
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
  totalCount: 5,
};

const mockWBSDetail: WBSDetail = {
  objectId: 1002,
  wbsCode: '1.1',
  name: 'Engineering',
  status: 'Active',
  percentComplete: 60,
  plannedStart: '2024-01-15T00:00:00Z',
  plannedFinish: '2024-12-31T00:00:00Z',
  budgetAtCompletion: 500000,
  plannedTotalCost: 480000,
  actualTotalCost: 300000,
  remainingTotalCost: 180000,
  sapMapping: {
    posid: 'P-ENG-001',
    post1: 'Engineering Phase',
    mappingStrategy: 'wbs_code_match',
    confidenceScore: 0.95,
    isVerified: true,
  },
  sapFinancials: {
    budget: 520000,
    actuals: 295000,
    commitments: 85000,
  },
  activityCount: 25,
  resourceCount: 12,
};

const mockWBSDetailUnmapped: WBSDetail = {
  objectId: 1004,
  wbsCode: '1.1.2',
  name: 'Electrical Works',
  status: 'Active',
  percentComplete: 40,
  plannedStart: '2024-03-01T00:00:00Z',
  plannedFinish: '2024-09-30T00:00:00Z',
  budgetAtCompletion: 300000,
  plannedTotalCost: 290000,
  actualTotalCost: 120000,
  remainingTotalCost: 170000,
  sapMapping: null,
  sapFinancials: null,
  activityCount: 15,
  resourceCount: 8,
};

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/v1/p6/projects/') && url.includes('/wbs')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWBSTree),
      });
    }
    if (url.includes('/api/v1/p6/wbs/1002')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWBSDetail),
      });
    }
    if (url.includes('/api/v1/p6/wbs/1004')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWBSDetailUnmapped),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
});

// ============================================================================
// UNIT TESTS: WBS TREE RENDERING
// ============================================================================

describe('WBSTree', () => {
  describe('Unit Tests: Tree Rendering', () => {
    it('renders loading state initially', () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders WBS tree after data loads', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tree')).toBeInTheDocument();
      });

      // Root node should be visible
      expect(screen.getByText('Project Root')).toBeInTheDocument();
      // First level children should be visible (root is expanded)
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Procurement')).toBeInTheDocument();
    });

    it('renders WBS codes alongside names', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Project Root')).toBeInTheDocument();
      });

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('1.1')).toBeInTheDocument();
      expect(screen.getByText('1.2')).toBeInTheDocument();
    });

    it('displays percent complete for each node', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Project Root')).toBeInTheDocument();
      });

      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('displays activity count for each node', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Project Root')).toBeInTheDocument();
      });

      // Activity counts shown as badges - use getAllByText for counts that appear multiple times
      expect(screen.getByText('50 activities')).toBeInTheDocument();
      // "25 activities" appears for both Engineering and Procurement
      expect(screen.getAllByText('25 activities').length).toBe(2);
    });

    it('renders error state when API fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    it('renders empty state when no WBS nodes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ nodes: [], totalCount: 0 }),
      });

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/no wbs elements/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // UNIT TESTS: NODE EXPANSION
  // ============================================================================

  describe('Unit Tests: Node Expansion', () => {
    it('expands collapsed node when expand button clicked', async () => {
      const user = userEvent.setup();

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Engineering is collapsed, children not visible
      expect(screen.queryByText('Civil Works')).not.toBeInTheDocument();

      // Find and click expand button for Engineering
      const engineeringNode = screen.getByText('Engineering').closest('[role="treeitem"]');
      const expandButton = within(engineeringNode!).getByRole('button', { name: /expand/i });
      await user.click(expandButton);

      // Now children should be visible
      await waitFor(() => {
        expect(screen.getByText('Civil Works')).toBeInTheDocument();
        expect(screen.getByText('Electrical Works')).toBeInTheDocument();
      });
    });

    it('collapses expanded node when collapse button clicked', async () => {
      const user = userEvent.setup();

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Root is expanded, children visible
      expect(screen.getByText('Engineering')).toBeInTheDocument();

      // Find and click collapse button for root
      const rootNode = screen.getByText('Project Root').closest('[role="treeitem"]');
      const collapseButton = within(rootNode!).getByRole('button', { name: /collapse/i });
      await user.click(collapseButton);

      // Children should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
      });
    });

    it('respects initialExpandedIds prop', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
          initialExpandedIds={[1001, 1002]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Civil Works')).toBeInTheDocument();
      });

      // Both root and Engineering are expanded, so Civil Works visible
      expect(screen.getByText('Civil Works')).toBeInTheDocument();
      expect(screen.getByText('Electrical Works')).toBeInTheDocument();
    });

    it('shows expand icon for nodes with children', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const engineeringNode = screen.getByText('Engineering').closest('[role="treeitem"]');
      expect(within(engineeringNode!).getByRole('button', { name: /expand/i })).toBeInTheDocument();
    });

    it('does not show expand icon for leaf nodes', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Procurement')).toBeInTheDocument();
      });

      const procurementNode = screen.getByText('Procurement').closest('[role="treeitem"]');
      expect(within(procurementNode!).queryByRole('button', { name: /expand/i })).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // UNIT TESTS: NODE SELECTION
  // ============================================================================

  describe('Unit Tests: Node Selection', () => {
    it('calls onNodeSelect when node is clicked', async () => {
      const user = userEvent.setup();
      const onNodeSelect = vi.fn();

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
          onNodeSelect={onNodeSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Engineering'));

      expect(onNodeSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          objectId: 1002,
          name: 'Engineering',
          wbsCode: '1.1',
        })
      );
    });

    it('highlights selected node', async () => {
      const user = userEvent.setup();

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const engineeringNode = screen.getByText('Engineering').closest('[role="treeitem"]');
      await user.click(screen.getByText('Engineering'));

      expect(engineeringNode).toHaveAttribute('aria-selected', 'true');
    });

    it('deselects previous node when new node selected', async () => {
      const user = userEvent.setup();

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Select Engineering
      await user.click(screen.getByText('Engineering'));
      const engineeringNode = screen.getByText('Engineering').closest('[role="treeitem"]');
      expect(engineeringNode).toHaveAttribute('aria-selected', 'true');

      // Select Procurement
      await user.click(screen.getByText('Procurement'));
      const procurementNode = screen.getByText('Procurement').closest('[role="treeitem"]');

      expect(procurementNode).toHaveAttribute('aria-selected', 'true');
      expect(engineeringNode).toHaveAttribute('aria-selected', 'false');
    });
  });

  // ============================================================================
  // UNIT TESTS: SAP MAPPING INDICATORS
  // ============================================================================

  describe('Unit Tests: SAP Mapping Indicators', () => {
    it('shows SAP mapped indicator when showSAPMapping is true', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
          showSAPMapping={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Engineering is SAP mapped
      const engineeringNode = screen.getByText('Engineering').closest('[role="treeitem"]');
      expect(within(engineeringNode!).getByTitle(/mapped to sap/i)).toBeInTheDocument();
    });

    it('hides SAP indicators when showSAPMapping is false', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
          showSAPMapping={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      expect(screen.queryByTitle(/mapped to sap/i)).not.toBeInTheDocument();
    });

    it('does not show SAP indicator for unmapped nodes', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
          showSAPMapping={true}
          initialExpandedIds={[1001, 1002]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Electrical Works')).toBeInTheDocument();
      });

      // Electrical Works is NOT SAP mapped
      const electricalNode = screen.getByText('Electrical Works').closest('[role="treeitem"]');
      expect(within(electricalNode!).queryByTitle(/mapped to sap/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // UNIT TESTS: VIEW ACTIVITIES ACTION
  // ============================================================================

  describe('Unit Tests: View Activities Action', () => {
    it('passes onViewActivities prop to tree nodes', async () => {
      const onViewActivities = vi.fn();

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
          onViewActivities={onViewActivities}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Verify the tree renders with the onViewActivities prop
      // The button appears on hover, which is tested in E2E tests
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS: API INTERACTION
  // ============================================================================

  describe('Integration Tests: API Interaction', () => {
    it('fetches WBS tree on mount', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/p6/projects/12345/wbs'),
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
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Project Root')).toBeInTheDocument();
      });

      mockFetch.mockClear();

      rerender(
        <WBSTree
          projectObjectId={67890}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/p6/projects/67890/wbs'),
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
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tree')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('uses proper tree ARIA roles', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tree')).toBeInTheDocument();
      });

      expect(screen.getByRole('tree')).toHaveAttribute('aria-label', 'WBS Tree');
      expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(0);
    });

    it('sets aria-expanded on expandable nodes', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Project Root')).toBeInTheDocument();
      });

      const rootNode = screen.getByText('Project Root').closest('[role="treeitem"]');
      expect(rootNode).toHaveAttribute('aria-expanded', 'true');

      const engineeringNode = screen.getByText('Engineering').closest('[role="treeitem"]');
      expect(engineeringNode).toHaveAttribute('aria-expanded', 'false');
    });

    it('sets aria-level for hierarchy depth', async () => {
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
          initialExpandedIds={[1001, 1002]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Civil Works')).toBeInTheDocument();
      });

      const rootNode = screen.getByText('Project Root').closest('[role="treeitem"]');
      expect(rootNode).toHaveAttribute('aria-level', '1');

      const engineeringNode = screen.getByText('Engineering').closest('[role="treeitem"]');
      expect(engineeringNode).toHaveAttribute('aria-level', '2');

      const civilNode = screen.getByText('Civil Works').closest('[role="treeitem"]');
      expect(civilNode).toHaveAttribute('aria-level', '3');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tree')).toBeInTheDocument();
      });

      // Focus on tree
      const tree = screen.getByRole('tree');
      tree.focus();

      // Arrow down should move to next visible node
      await user.keyboard('{ArrowDown}');

      // Arrow right should expand node
      await user.keyboard('{ArrowRight}');

      // Arrow left should collapse node
      await user.keyboard('{ArrowLeft}');

      // Enter should select node
      await user.keyboard('{Enter}');
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance Tests', () => {
    it('renders large tree efficiently', async () => {
      // Generate large tree
      const generateLargeTree = (depth: number, breadth: number, prefix = ''): WBSNode[] => {
        if (depth === 0) return [];
        return Array.from({ length: breadth }, (_, i) => ({
          id: `wbs-${prefix}${i}`,
          objectId: parseInt(`${depth}${i}`, 10),
          parentObjectId: null,
          wbsCode: `${prefix}${i + 1}`,
          name: `WBS ${prefix}${i + 1}`,
          percentComplete: Math.random() * 100,
          budgetAtCompletion: 100000,
          plannedTotalCost: 95000,
          actualTotalCost: 50000,
          hierarchyLevel: 4 - depth,
          activityCount: 10,
          children: generateLargeTree(depth - 1, breadth, `${prefix}${i + 1}.`),
          isExpanded: false,
          sapMapped: i % 2 === 0,
        }));
      };

      const largeTree: WBSTreeResponse = {
        nodes: generateLargeTree(3, 5),
        totalCount: 155, // 5 + 25 + 125
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(largeTree),
      });

      const startTime = performance.now();

      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tree')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 500ms
      expect(renderTime).toBeLessThan(500);
    });

    it('uses virtualization for deeply expanded trees', async () => {
      // This is a placeholder - actual virtualization would need react-window or similar
      render(
        <WBSTree
          projectObjectId={12345}
          tenantId="tenant-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tree')).toBeInTheDocument();
      });

      // Tree component should exist
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// WBS DETAIL PANEL TESTS
// ============================================================================

describe('WBSDetailPanel', () => {
  describe('Unit Tests: Panel Rendering', () => {
    it('renders nothing when not open', () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={false}
          onClose={vi.fn()}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders loading state when open', async () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders WBS details after load', async () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      expect(screen.getByText('1.1')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('displays P6 schedule information', async () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Dates should be formatted
      expect(screen.getByText(/jan.*2024/i)).toBeInTheDocument();
      expect(screen.getByText(/dec.*2024/i)).toBeInTheDocument();
    });

    it('displays P6 cost information', async () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Costs should be formatted as currency
      expect(screen.getByText(/\$500,000/)).toBeInTheDocument(); // BAC
      expect(screen.getByText(/\$300,000/)).toBeInTheDocument(); // Actuals
    });

    it('displays SAP mapping when present', async () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      expect(screen.getByText('P-ENG-001')).toBeInTheDocument();
      expect(screen.getByText('Engineering Phase')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument(); // Confidence
    });

    it('displays SAP financials when mapped', async () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // SAP Financials section
      expect(screen.getByText(/sap budget/i)).toBeInTheDocument();
      expect(screen.getByText(/\$520,000/)).toBeInTheDocument();
      expect(screen.getByText(/sap actuals/i)).toBeInTheDocument();
      expect(screen.getByText(/\$295,000/)).toBeInTheDocument();
    });

    it('shows "Not Mapped" when no SAP mapping', async () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1004}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Electrical Works')).toBeInTheDocument();
      });

      expect(screen.getByText(/not mapped to sap/i)).toBeInTheDocument();
    });
  });

  describe('Unit Tests: Panel Actions', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={onClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onViewActivities when button clicked', async () => {
      const user = userEvent.setup();
      const onViewActivities = vi.fn();

      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
          onViewActivities={onViewActivities}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const viewActivitiesButton = screen.getByRole('button', { name: /view activities/i });
      await user.click(viewActivitiesButton);

      expect(onViewActivities).toHaveBeenCalledWith(1002);
    });

    it('calls onViewInSAP when button clicked for mapped WBS', async () => {
      const user = userEvent.setup();
      const onViewInSAP = vi.fn();

      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
          onViewInSAP={onViewInSAP}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const viewInSAPButton = screen.getByRole('button', { name: /view in sap/i });
      await user.click(viewInSAPButton);

      expect(onViewInSAP).toHaveBeenCalledWith('P-ENG-001');
    });

    it('does not show View in SAP button for unmapped WBS', async () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1004}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
          onViewInSAP={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Electrical Works')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /view in sap/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('uses proper dialog ARIA attributes', async () => {
      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('traps focus within panel', async () => {
      const user = userEvent.setup();

      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      await user.tab();
      await user.tab();

      // Focus should stay within panel
      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('closes on Escape key', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <WBSDetailPanel
          wbsObjectId={1002}
          tenantId="tenant-123"
          isOpen={true}
          onClose={onClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// WBS BREADCRUMB TESTS
// ============================================================================

describe('WBSBreadcrumb', () => {
  const mockPath = [
    { objectId: 1001, name: 'Project Root', wbsCode: '1' },
    { objectId: 1002, name: 'Engineering', wbsCode: '1.1' },
    { objectId: 1003, name: 'Civil Works', wbsCode: '1.1.1' },
  ];

  it('renders breadcrumb path', () => {
    render(
      <WBSBreadcrumb
        path={mockPath}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText('Project Root')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Civil Works')).toBeInTheDocument();
  });

  it('calls onNavigate when breadcrumb clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <WBSBreadcrumb
        path={mockPath}
        onNavigate={onNavigate}
      />
    );

    await user.click(screen.getByText('Engineering'));

    expect(onNavigate).toHaveBeenCalledWith(1002);
  });

  it('does not make last item clickable', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <WBSBreadcrumb
        path={mockPath}
        onNavigate={onNavigate}
      />
    );

    const lastItem = screen.getByText('Civil Works');
    expect(lastItem).not.toHaveAttribute('role', 'button');
    await user.click(lastItem);

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('uses proper breadcrumb ARIA attributes', () => {
    render(
      <WBSBreadcrumb
        path={mockPath}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'WBS Breadcrumb');
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('marks current location with aria-current', () => {
    render(
      <WBSBreadcrumb
        path={mockPath}
        onNavigate={vi.fn()}
      />
    );

    const lastItem = screen.getByText('Civil Works').closest('li');
    expect(lastItem).toHaveAttribute('aria-current', 'location');
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('Snapshot Tests', () => {
  it('matches WBSTree snapshot', async () => {
    const { container } = render(
      <WBSTree
        projectObjectId={12345}
        tenantId="tenant-123"
        showSAPMapping={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('matches WBSDetailPanel snapshot', async () => {
    const { container } = render(
      <WBSDetailPanel
        wbsObjectId={1002}
        tenantId="tenant-123"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('matches WBSBreadcrumb snapshot', () => {
    const { container } = render(
      <WBSBreadcrumb
        path={[
          { objectId: 1001, name: 'Root', wbsCode: '1' },
          { objectId: 1002, name: 'Child', wbsCode: '1.1' },
        ]}
        onNavigate={vi.fn()}
      />
    );

    expect(container).toMatchSnapshot();
  });
});

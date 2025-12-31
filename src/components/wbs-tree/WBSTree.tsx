/**
 * WBS Tree Components
 * @governance COMPONENT-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3
 *
 * Components:
 * - WBSTree: Hierarchical tree view of WBS elements
 * - WBSTreeNode: Individual tree node
 * - WBSDetailPanel: Slide-out panel with WBS details
 * - WBSBreadcrumb: Navigation breadcrumb
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import type {
  WBSNode,
  WBSDetail,
  WBSTreeProps,
  WBSTreeNodeProps,
  WBSDetailPanelProps,
  WBSBreadcrumbProps,
  WBSTreeState,
  WBSTreeResponse,
  WBSDetailResponse,
} from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency value
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format date string
 */
const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format percentage
 */
const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

// ============================================================================
// WBS TREE NODE COMPONENT
// ============================================================================

interface InternalWBSTreeNodeProps extends WBSTreeNodeProps {
  onViewActivities?: (wbsObjectId: number) => void;
  selectedId: number | null;
  expandedIds: Set<number>;
}

const WBSTreeNode = memo(function WBSTreeNode({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  showSAPMapping,
  onViewActivities,
  selectedId,
  expandedIds,
}: InternalWBSTreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(node.objectId);
  };

  const handleSelect = () => {
    onSelect(node);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(node);
    }
    if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
      e.preventDefault();
      onToggle(node.objectId);
    }
    if (e.key === 'ArrowLeft' && isExpanded) {
      e.preventDefault();
      onToggle(node.objectId);
    }
  };

  return (
    <li
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={level + 1}
      tabIndex={isSelected ? 0 : -1}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex flex-col
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
      `}
    >
      <div
        className={`
          flex items-center gap-2 py-2 px-3 cursor-pointer
          hover:bg-gray-50 dark:hover:bg-gray-800
          ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        `}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* WBS Code */}
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 min-w-[60px]">
          {node.wbsCode}
        </span>

        {/* Name */}
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {node.name}
        </span>

        {/* Percent Complete */}
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[40px] text-right">
          {formatPercent(node.percentComplete)}
        </span>

        {/* Activity Count Badge */}
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          {node.activityCount} activities
        </span>

        {/* SAP Mapping Indicator */}
        {showSAPMapping && node.sapMapped && (
          <span
            title="Mapped to SAP"
            className="w-4 h-4 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}

        {/* Hover Actions */}
        {isHovered && onViewActivities && (
          <button
            type="button"
            aria-label="View Activities"
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              onViewActivities(node.objectId);
            }}
          >
            View Activities
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <ul role="group" className="list-none">
          {node.children.map((child) => (
            <WBSTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={expandedIds.has(child.objectId)}
              isSelected={selectedId === child.objectId}
              onToggle={onToggle}
              onSelect={onSelect}
              showSAPMapping={showSAPMapping}
              onViewActivities={onViewActivities}
              selectedId={selectedId}
              expandedIds={expandedIds}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

// ============================================================================
// WBS TREE COMPONENT
// ============================================================================

export const WBSTree = memo(function WBSTree({
  projectObjectId,
  tenantId,
  onNodeSelect,
  onViewActivities,
  initialExpandedIds = [],
  showSAPMapping = true,
}: WBSTreeProps) {
  const [state, setState] = useState<WBSTreeState>({
    nodes: [],
    expandedIds: new Set(initialExpandedIds),
    selectedId: null,
    isLoading: true,
    error: null,
  });

  // Fetch WBS tree data
  useEffect(() => {
    const fetchWBSTree = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(
          `/api/v1/p6/projects/${projectObjectId}/wbs`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Tenant-ID': tenantId,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load WBS tree');
        }

        const data: WBSTreeResponse = await response.json();

        // Collect all initially expanded node IDs from API data
        const collectExpandedIds = (nodes: WBSNode[], ids: Set<number>): void => {
          nodes.forEach((node) => {
            if (node.isExpanded) {
              ids.add(node.objectId);
            }
            collectExpandedIds(node.children, ids);
          });
        };

        // Start with initialExpandedIds and add any from API
        const allExpandedIds = new Set(initialExpandedIds);
        collectExpandedIds(data.nodes, allExpandedIds);

        setState((prev) => ({
          ...prev,
          nodes: data.nodes,
          expandedIds: allExpandedIds,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load WBS tree',
        }));
      }
    };

    fetchWBSTree();
  }, [projectObjectId, tenantId]);

  // Toggle node expansion
  const handleToggle = useCallback((objectId: number) => {
    setState((prev) => {
      const newExpandedIds = new Set(prev.expandedIds);
      if (newExpandedIds.has(objectId)) {
        newExpandedIds.delete(objectId);
      } else {
        newExpandedIds.add(objectId);
      }

      return {
        ...prev,
        expandedIds: newExpandedIds,
      };
    });
  }, []);

  // Select node
  const handleSelect = useCallback(
    (node: WBSNode) => {
      setState((prev) => ({ ...prev, selectedId: node.objectId }));
      onNodeSelect?.(node);
    },
    [onNodeSelect]
  );

  // Loading state
  if (state.isLoading) {
    return (
      <div role="status" className="flex items-center justify-center p-8">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading WBS tree...</span>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">Failed to load WBS tree: {state.error}</p>
      </div>
    );
  }

  // Empty state
  if (state.nodes.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <p>No WBS elements found for this project.</p>
      </div>
    );
  }

  return (
    <ul
      role="tree"
      aria-label="WBS Tree"
      className="list-none"
    >
      {state.nodes.map((node) => (
        <WBSTreeNode
          key={node.id}
          node={node}
          level={0}
          isExpanded={state.expandedIds.has(node.objectId)}
          isSelected={state.selectedId === node.objectId}
          onToggle={handleToggle}
          onSelect={handleSelect}
          showSAPMapping={showSAPMapping}
          onViewActivities={onViewActivities}
          selectedId={state.selectedId}
          expandedIds={state.expandedIds}
        />
      ))}
    </ul>
  );
});

// ============================================================================
// WBS DETAIL PANEL COMPONENT
// ============================================================================

export const WBSDetailPanel = memo(function WBSDetailPanel({
  wbsObjectId,
  tenantId,
  isOpen,
  onClose,
  onViewActivities,
  onViewInSAP,
}: WBSDetailPanelProps) {
  const [detail, setDetail] = useState<WBSDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `wbs-detail-title-${wbsObjectId}`;

  // Fetch WBS detail
  useEffect(() => {
    if (!isOpen || !wbsObjectId) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/p6/wbs/${wbsObjectId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Tenant-ID': tenantId,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load WBS details');
        }

        const data: WBSDetailResponse = await response.json();
        setDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, wbsObjectId, tenantId]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;
    const focusableElements = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    panel.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => panel.removeEventListener('keydown', handleTabKey);
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            WBS Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading && (
          <div role="status" className="flex items-center justify-center p-8">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {error && (
          <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {detail && !isLoading && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {detail.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{detail.wbsCode}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">{formatPercent(detail.percentComplete)}</span>
                <span className="text-sm text-gray-500">complete</span>
              </div>
            </div>

            {/* Schedule Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Planned Start</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(detail.plannedStart)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Planned Finish</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(detail.plannedFinish)}
                  </p>
                </div>
              </div>
            </div>

            {/* P6 Cost Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">P6 Costs</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Budget at Completion</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(detail.budgetAtCompletion)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Actual Total Cost</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(detail.actualTotalCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Remaining Total Cost</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(detail.remainingTotalCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* SAP Mapping Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SAP Mapping</h4>
              {detail.sapMapping ? (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">POSID</span>
                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                      {detail.sapMapping.posid}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Description</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {detail.sapMapping.post1}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatPercent((detail.sapMapping.confidenceScore || 0) * 100)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Not mapped to SAP</p>
                </div>
              )}
            </div>

            {/* SAP Financials Section (only if mapped) */}
            {detail.sapFinancials && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SAP Financials</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">SAP Budget</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(detail.sapFinancials.budget)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">SAP Actuals</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(detail.sapFinancials.actuals)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">SAP Commitments</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(detail.sapFinancials.commitments)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{detail.activityCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Activities</p>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{detail.resourceCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Resources</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onViewActivities?.(detail.objectId)}
                aria-label="View Activities"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                View Activities
              </button>
              {detail.sapMapping?.posid && (
                <button
                  type="button"
                  onClick={() => onViewInSAP?.(detail.sapMapping!.posid!)}
                  aria-label="View in SAP"
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
                >
                  View in SAP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// WBS BREADCRUMB COMPONENT
// ============================================================================

export const WBSBreadcrumb = memo(function WBSBreadcrumb({
  path,
  onNavigate,
}: WBSBreadcrumbProps) {
  return (
    <nav aria-label="WBS Breadcrumb" className="flex">
      <ol role="list" className="flex items-center gap-2">
        {path.map((item, index) => {
          const isLast = index === path.length - 1;

          return (
            <li
              key={item.objectId}
              aria-current={isLast ? 'location' : undefined}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {isLast ? (
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.name}
                </span>
              ) : (
                <button
                  type="button"
                  role="button"
                  onClick={() => onNavigate(item.objectId)}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {item.name}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default WBSTree;

/**
 * Project List Component
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:2
 *
 * Data table displaying P6 projects with filtering, sorting, and pagination.
 */

'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import type {
  ProjectsDataTableProps,
  ProjectsTableState,
  P6Project,
  StatusOption,
  SortableColumn,
  SortDirection,
} from './types';

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

const TableSkeleton = memo(function TableSkeleton() {
  return (
    <div data-testid="table-skeleton" className="animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
      ))}
    </div>
  );
});

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
      case 'complete':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
});

// ============================================================================
// METRIC CELL (SPI/CPI)
// ============================================================================

const MetricCell = memo(function MetricCell({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-slate-400 dark:text-slate-500">N/A</span>;
  }

  const getColor = (v: number): string => {
    if (v >= 0.95) return 'text-green-600 dark:text-green-400';
    if (v >= 0.85) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return <span className={`font-medium ${getColor(value)}`}>{value.toFixed(2)}</span>;
});

// ============================================================================
// PROGRESS CELL
// ============================================================================

const ProgressCell = memo(function ProgressCell({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[3ch]">{percent}%</span>
    </div>
  );
});

// ============================================================================
// COLUMN HEADER
// ============================================================================

const ColumnHeader = memo(function ColumnHeader({
  label,
  column,
  sortable,
  currentSort,
  currentDirection,
  onSort,
}: {
  label: string;
  column: SortableColumn;
  sortable: boolean;
  currentSort: SortableColumn;
  currentDirection: SortDirection;
  onSort: (column: SortableColumn) => void;
}) {
  const isActive = currentSort === column;

  if (!sortable) {
    return (
      <th
        role="columnheader"
        className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white"
      >
        {label}
      </th>
    );
  }

  // aria-sort must use 'ascending'/'descending' not 'asc'/'desc'
  const ariaSort = isActive
    ? currentDirection === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';

  return (
    <th
      role="columnheader"
      aria-sort={ariaSort}
      className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white"
    >
      <button
        tabIndex={0}
        onClick={() => onSort(column)}
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${isActive ? 'opacity-100' : 'opacity-40'} ${
            isActive && currentDirection === 'desc' ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </th>
  );
});

// ============================================================================
// SEARCH INPUT
// ============================================================================

const SearchInput = memo(function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [localValue, value, onChange]);

  return (
    <div className="relative">
      <input
        type="search"
        role="searchbox"
        aria-label="Search projects"
        placeholder="Search projects..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
});

// ============================================================================
// STATUS FILTER
// ============================================================================

const StatusFilter = memo(function StatusFilter({
  options,
  value,
  onChange,
}: {
  options: StatusOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <select
      aria-label="Filter by status"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Statuses</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label} ({opt.count})
        </option>
      ))}
    </select>
  );
});

// ============================================================================
// PAGINATION
// ============================================================================

const PaginationControls = memo(function PaginationControls({
  page,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Rows per page:</span>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Showing {Math.min((page - 1) * pageSize + 1, total)} - {Math.min(page * pageSize, total)} of {total}
        </span>
      </div>

      <div className="flex items-center gap-2" aria-label="Pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          tabIndex={0}
          aria-label="Previous page"
          className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Previous
        </button>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          tabIndex={0}
          aria-label="Next page"
          className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Next
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// TABLE ROW
// ============================================================================

const ProjectRow = memo(function ProjectRow({
  project,
  onClick,
  onViewWBS,
  onViewGantt,
}: {
  project: P6Project;
  onClick?: () => void;
  onViewWBS?: () => void;
  onViewGantt?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
    >
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{project.projectId}</td>
      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{project.name}</td>
      <td className="px-4 py-3">
        <StatusBadge status={project.status} />
      </td>
      <td className="px-4 py-3">
        <ProgressCell percent={project.percentComplete} />
      </td>
      <td className="px-4 py-3 text-sm">
        <MetricCell value={project.spi} />
      </td>
      <td className="px-4 py-3 text-sm">
        <MetricCell value={project.cpi} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {new Date(project.plannedFinish).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewWBS?.();
            }}
            aria-label="View WBS"
            className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
          >
            WBS
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewGantt?.();
            }}
            aria-label="View Gantt"
            className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
          >
            Gantt
          </button>
        </div>
      </td>
    </tr>
  );
});

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyState = memo(function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg
        className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">No projects found</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        {hasFilters
          ? 'Try adjusting your filters or search terms'
          : 'Projects will appear here once synced from P6'}
      </p>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
        >
          Clear filters
        </button>
      )}
    </div>
  );
});

// ============================================================================
// ERROR STATE
// ============================================================================

const ErrorState = memo(function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg
        className="w-16 h-16 text-red-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">Failed to load projects</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        There was an error loading the project data. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Retry
      </button>
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ProjectsDataTable = memo(function ProjectsDataTable({
  tenantId,
  initialPageSize = 20,
  onProjectClick,
  onViewWBS,
  onViewGantt,
}: ProjectsDataTableProps) {
  const [state, setState] = useState<ProjectsTableState>({
    data: [],
    pagination: {
      page: 1,
      pageSize: initialPageSize,
      total: 0,
      totalPages: 0,
    },
    filters: {
      status: null,
      epsId: null,
      search: '',
    },
    sorting: {
      column: 'name',
      direction: 'asc',
    },
    isLoading: true,
    error: null,
  });

  const [statuses, setStatuses] = useState<StatusOption[]>([]);

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('tenant', tenantId);
    params.set('page', String(state.pagination.page));
    params.set('pageSize', String(state.pagination.pageSize));
    params.set('sortBy', state.sorting.column);
    params.set('sortDir', state.sorting.direction);

    if (state.filters.status) {
      params.set('status', state.filters.status);
    }
    if (state.filters.epsId) {
      params.set('epsId', String(state.filters.epsId));
    }
    if (state.filters.search) {
      params.set('search', state.filters.search);
    }

    return params.toString();
  }, [tenantId, state.pagination, state.sorting, state.filters]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/v1/p6/projects?${queryString}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();

      setState((prev) => ({
        ...prev,
        data: result.data,
        pagination: result.pagination,
        isLoading: false,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load projects',
      }));
    }
  }, [queryString]);

  // Fetch statuses for filter
  const fetchStatuses = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/p6/projects/statuses?tenant=${tenantId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      setStatuses(result);
    } catch {
      // Silently fail - filter will just be empty
    }
  }, [tenantId]);

  // Initial data fetch
  useEffect(() => {
    fetchProjects();
    fetchStatuses();
  }, [fetchProjects, fetchStatuses]);

  // Handlers
  const handleSort = useCallback((column: SortableColumn) => {
    setState((prev) => ({
      ...prev,
      sorting: {
        column,
        direction: prev.sorting.column === column && prev.sorting.direction === 'asc' ? 'desc' : 'asc',
      },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const handleStatusChange = useCallback((status: string | null) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, status },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, search },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, page: 1 },
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: { status: null, epsId: null, search: '' },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  // Check if any filters are active
  const hasFilters = state.filters.status !== null || state.filters.search !== '';

  // Render
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            View and manage all P6 projects
          </p>
        </div>

        {/* Loading indicator for screen readers */}
        {state.isLoading && (
          <div role="status" className="sr-only">
            Loading projects...
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[200px] max-w-md">
            <SearchInput value={state.filters.search} onChange={handleSearchChange} />
          </div>
          <StatusFilter
            options={statuses}
            value={state.filters.status}
            onChange={handleStatusChange}
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {state.isLoading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : state.error ? (
            <ErrorState onRetry={fetchProjects} />
          ) : state.data.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table
                  role="table"
                  aria-label="Projects data table"
                  className="w-full"
                >
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <ColumnHeader
                        label="Project ID"
                        column="name"
                        sortable={false}
                        currentSort={state.sorting.column}
                        currentDirection={state.sorting.direction}
                        onSort={handleSort}
                      />
                      <ColumnHeader
                        label="Name"
                        column="name"
                        sortable={true}
                        currentSort={state.sorting.column}
                        currentDirection={state.sorting.direction}
                        onSort={handleSort}
                      />
                      <ColumnHeader
                        label="Status"
                        column="status"
                        sortable={true}
                        currentSort={state.sorting.column}
                        currentDirection={state.sorting.direction}
                        onSort={handleSort}
                      />
                      <ColumnHeader
                        label="Progress"
                        column="percentComplete"
                        sortable={true}
                        currentSort={state.sorting.column}
                        currentDirection={state.sorting.direction}
                        onSort={handleSort}
                      />
                      <ColumnHeader
                        label="SPI"
                        column="spi"
                        sortable={true}
                        currentSort={state.sorting.column}
                        currentDirection={state.sorting.direction}
                        onSort={handleSort}
                      />
                      <ColumnHeader
                        label="CPI"
                        column="cpi"
                        sortable={true}
                        currentSort={state.sorting.column}
                        currentDirection={state.sorting.direction}
                        onSort={handleSort}
                      />
                      <ColumnHeader
                        label="Planned Finish"
                        column="plannedFinish"
                        sortable={true}
                        currentSort={state.sorting.column}
                        currentDirection={state.sorting.direction}
                        onSort={handleSort}
                      />
                      <th
                        role="columnheader"
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.data.map((project) => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        onClick={() => onProjectClick?.(project)}
                        onViewWBS={() => onViewWBS?.(project)}
                        onViewGantt={() => onViewGantt?.(project)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                page={state.pagination.page}
                totalPages={state.pagination.totalPages}
                pageSize={state.pagination.pageSize}
                total={state.pagination.total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// Default export for dynamic imports
export default ProjectsDataTable;

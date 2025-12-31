/**
 * Project List Component Types (DATA HOLDERS)
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:2
 *
 * These interfaces define the data shape for all project list components.
 */

// ============================================================================
// P6 PROJECT DATA
// ============================================================================

/**
 * P6 Project data from the database
 * @component ProjectsDataTable
 * @schema p6_raw.projects + orion_core.projects
 * @api GET /api/v1/p6/projects
 */
export interface P6Project {
  /** Internal UUID */
  id: string;
  /** P6 Object ID (unique) */
  objectId: number;
  /** P6 Project ID (user-facing) */
  projectId: string;
  /** Project name */
  name: string;
  /** Project status (Active, Inactive, etc.) */
  status: string;
  /** Percent complete (0-100) */
  percentComplete: number;
  /** Planned start date (ISO 8601) */
  plannedStart: string;
  /** Planned finish date (ISO 8601) */
  plannedFinish: string;
  /** Actual start date (ISO 8601) or null */
  actualStart: string | null;
  /** Data date (ISO 8601) */
  dataDate: string;
  /** Budget at Completion (BAC) */
  budgetAtCompletion: number;
  /** Schedule Performance Index */
  spi: number | null;
  /** Cost Performance Index */
  cpi: number | null;
}

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Pagination state
 */
export interface PaginationState {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total items */
  total: number;
  /** Total pages */
  totalPages: number;
}

// ============================================================================
// FILTERS
// ============================================================================

/**
 * Filter state
 */
export interface FilterState {
  /** Filter by status */
  status: string | null;
  /** Filter by EPS ID */
  epsId: number | null;
  /** Search query */
  search: string;
}

/**
 * Status filter option
 * @component StatusFilter
 * @api GET /api/v1/p6/projects/statuses
 */
export interface StatusOption {
  /** Status value */
  value: string;
  /** Display label */
  label: string;
  /** Count of projects with this status */
  count: number;
}

/**
 * EPS filter option
 * @component EPSFilter
 * @api GET /api/v1/p6/eps
 */
export interface EPSOption {
  /** EPS Object ID */
  objectId: number;
  /** EPS name */
  name: string;
  /** Count of projects in this EPS */
  projectCount: number;
}

// ============================================================================
// SORTING
// ============================================================================

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sortable columns
 */
export type SortableColumn =
  | 'name'
  | 'status'
  | 'percentComplete'
  | 'plannedStart'
  | 'plannedFinish'
  | 'spi'
  | 'cpi'
  | 'budgetAtCompletion';

/**
 * Sorting state
 */
export interface SortingState {
  /** Column to sort by */
  column: SortableColumn;
  /** Sort direction */
  direction: SortDirection;
}

// ============================================================================
// TABLE STATE
// ============================================================================

/**
 * Complete table state
 * @component ProjectsDataTable
 */
export interface ProjectsTableState {
  /** Project data */
  data: P6Project[];
  /** Pagination state */
  pagination: PaginationState;
  /** Filter state */
  filters: FilterState;
  /** Sorting state */
  sorting: SortingState;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Projects data table props
 * @component ProjectsDataTable
 */
export interface ProjectsDataTableProps {
  /** Tenant ID for data fetching */
  tenantId: string;
  /** Initial page size */
  initialPageSize?: number;
  /** Callback when project row is clicked */
  onProjectClick?: (project: P6Project) => void;
  /** Callback when "View WBS" is clicked */
  onViewWBS?: (project: P6Project) => void;
  /** Callback when "View Gantt" is clicked */
  onViewGantt?: (project: P6Project) => void;
}

/**
 * Status filter props
 * @component StatusFilter
 */
export interface StatusFilterProps {
  /** Available status options */
  options: StatusOption[];
  /** Currently selected status */
  value: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Callback when status changes */
  onChange: (status: string | null) => void;
}

/**
 * EPS filter props
 * @component EPSFilter
 */
export interface EPSFilterProps {
  /** Available EPS options */
  options: EPSOption[];
  /** Currently selected EPS ID */
  value: number | null;
  /** Loading state */
  isLoading: boolean;
  /** Callback when EPS changes */
  onChange: (epsId: number | null) => void;
}

/**
 * Pagination controls props
 * @component PaginationControls
 */
export interface PaginationControlsProps {
  /** Current pagination state */
  pagination: PaginationState;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Search input props
 * @component SearchInput
 */
export interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when search changes (debounced) */
  onChange: (value: string) => void;
}

/**
 * Column header props for sortable columns
 * @component ColumnHeader
 */
export interface ColumnHeaderProps {
  /** Column label */
  label: string;
  /** Column key for sorting */
  column: SortableColumn;
  /** Current sorting state */
  sorting: SortingState;
  /** Callback when header is clicked */
  onSort: (column: SortableColumn) => void;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Projects API response
 */
export interface ProjectsResponse {
  /** Project data */
  data: P6Project[];
  /** Pagination info */
  pagination: PaginationState;
}

/**
 * Statuses API response
 */
export type StatusesResponse = StatusOption[];

/**
 * EPS API response
 */
export type EPSResponse = EPSOption[];

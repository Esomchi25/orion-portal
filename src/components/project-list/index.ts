/**
 * Project List Components Index
 * @governance COMPONENT-001
 *
 * Export all project list components and types.
 */

// Main Component
export { ProjectsDataTable, default } from './ProjectList';

// Types
export type {
  // Project Data
  P6Project,
  // Pagination
  PaginationState,
  // Filters
  FilterState,
  StatusOption,
  EPSOption,
  // Sorting
  SortDirection,
  SortableColumn,
  SortingState,
  // Table State
  ProjectsTableState,
  // Props
  ProjectsDataTableProps,
  StatusFilterProps,
  EPSFilterProps,
  PaginationControlsProps,
  SearchInputProps,
  ColumnHeaderProps,
  // API Responses
  ProjectsResponse,
  StatusesResponse,
  EPSResponse,
} from './types';

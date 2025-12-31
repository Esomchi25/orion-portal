/**
 * Gantt Chart Component Types (DATA HOLDERS)
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:4
 *
 * These interfaces define the data shape for Gantt chart components.
 */

// ============================================================================
// ACTIVITY DATA
// ============================================================================

/**
 * P6 Activity for Gantt chart
 * @component GanttChart
 * @schema p6_raw.activities + p6_raw.activity_relationships
 * @api GET /api/v1/p6/projects/{projectObjectId}/activities
 */
export interface GanttActivity {
  /** Internal UUID */
  id: string;
  /** P6 Activity Object ID (unique) */
  objectId: number;
  /** Parent WBS Object ID */
  wbsObjectId: number;
  /** Activity ID (user-facing code) */
  activityId: string;
  /** Activity name */
  name: string;
  /** Activity type (Task Dependent, Resource Dependent, etc.) */
  activityType: string;
  /** Status (Not Started, In Progress, Complete) */
  status: 'not_started' | 'in_progress' | 'complete';
  /** Percent complete (0-100) */
  percentComplete: number;
  /** Planned start date (ISO 8601) */
  plannedStart: string;
  /** Planned finish date (ISO 8601) */
  plannedFinish: string;
  /** Actual start date (ISO 8601) or null */
  actualStart: string | null;
  /** Actual finish date (ISO 8601) or null */
  actualFinish: string | null;
  /** Planned duration in days */
  plannedDuration: number;
  /** Remaining duration in days */
  remainingDuration: number;
  /** Is this activity on critical path? */
  isCritical: boolean;
  /** Is this a milestone? */
  isMilestone: boolean;
  /** Predecessor activity IDs */
  predecessors: number[];
  /** Successor activity IDs */
  successors: number[];
}

/**
 * Activity relationship (predecessor/successor)
 */
export interface ActivityRelationship {
  /** Predecessor activity Object ID */
  predecessorObjectId: number;
  /** Successor activity Object ID */
  successorObjectId: number;
  /** Relationship type (FS, SS, FF, SF) */
  type: 'FS' | 'SS' | 'FF' | 'SF';
  /** Lag in days (can be negative) */
  lag: number;
}

// ============================================================================
// GANTT TIMELINE
// ============================================================================

/**
 * Timeline scale options
 */
export type TimelineScale = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Timeline period for header display
 */
export interface TimelinePeriod {
  /** Start date of period */
  start: Date;
  /** End date of period */
  end: Date;
  /** Display label */
  label: string;
  /** Width in pixels */
  width: number;
}

/**
 * Gantt timeline configuration
 */
export interface TimelineConfig {
  /** Start date of visible range */
  startDate: Date;
  /** End date of visible range */
  endDate: Date;
  /** Current scale */
  scale: TimelineScale;
  /** Pixels per day at current scale */
  pixelsPerDay: number;
  /** Today's date for reference line */
  today: Date;
  /** Data date from P6 */
  dataDate: Date;
}

// ============================================================================
// GANTT BAR
// ============================================================================

/**
 * Gantt bar visual representation
 */
export interface GanttBar {
  /** Activity ID */
  activityId: string;
  /** X position (pixels from left) */
  x: number;
  /** Width in pixels */
  width: number;
  /** Y position (row index * row height) */
  y: number;
  /** Bar color based on status/criticality */
  color: string;
  /** Progress bar width (percent complete) */
  progressWidth: number;
  /** Is milestone (diamond shape) */
  isMilestone: boolean;
  /** Is on critical path */
  isCritical: boolean;
}

// ============================================================================
// GANTT STATE
// ============================================================================

/**
 * Gantt chart component state
 * @component GanttChart
 */
export interface GanttState {
  /** Activities data */
  activities: GanttActivity[];
  /** Relationships data */
  relationships: ActivityRelationship[];
  /** Timeline configuration */
  timeline: TimelineConfig;
  /** Selected activity ID */
  selectedActivityId: string | null;
  /** Expanded WBS IDs (for grouping) */
  expandedWbsIds: Set<number>;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Show critical path only */
  showCriticalOnly: boolean;
  /** Show dependencies */
  showDependencies: boolean;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Gantt chart main component props
 * @component GanttChart
 */
export interface GanttChartProps {
  /** Project Object ID to load activities for */
  projectObjectId: number;
  /** Tenant ID for data fetching */
  tenantId: string;
  /** Initial timeline scale */
  initialScale?: TimelineScale;
  /** Show critical path highlighting */
  showCriticalPath?: boolean;
  /** Show dependency lines */
  showDependencies?: boolean;
  /** Callback when activity is selected */
  onActivitySelect?: (activity: GanttActivity) => void;
  /** Callback when activity is double-clicked */
  onActivityDoubleClick?: (activity: GanttActivity) => void;
  /** Row height in pixels */
  rowHeight?: number;
  /** Header height in pixels */
  headerHeight?: number;
}

/**
 * Gantt timeline header props
 * @component GanttTimelineHeader
 */
export interface GanttTimelineHeaderProps {
  /** Timeline configuration */
  timeline: TimelineConfig;
  /** Header height */
  height: number;
  /** Callback when scale changes */
  onScaleChange: (scale: TimelineScale) => void;
  /** Callback when date range changes */
  onDateRangeChange: (start: Date, end: Date) => void;
}

/**
 * Gantt bar props
 * @component GanttBar
 */
export interface GanttBarProps {
  /** Activity data */
  activity: GanttActivity;
  /** Bar visual data */
  bar: GanttBar;
  /** Is selected */
  isSelected: boolean;
  /** Callback when clicked */
  onClick: (activity: GanttActivity) => void;
  /** Callback when double-clicked */
  onDoubleClick: (activity: GanttActivity) => void;
  /** Show tooltip on hover */
  showTooltip?: boolean;
}

/**
 * Gantt dependency line props
 * @component GanttDependencyLine
 */
export interface GanttDependencyLineProps {
  /** Relationship data */
  relationship: ActivityRelationship;
  /** From bar position */
  fromBar: GanttBar;
  /** To bar position */
  toBar: GanttBar;
  /** Is on critical path */
  isCritical: boolean;
}

/**
 * Gantt row label props (activity name column)
 * @component GanttRowLabel
 */
export interface GanttRowLabelProps {
  /** Activity data */
  activity: GanttActivity;
  /** Indent level based on WBS hierarchy */
  indentLevel: number;
  /** Is selected */
  isSelected: boolean;
  /** Callback when clicked */
  onClick: (activity: GanttActivity) => void;
}

/**
 * Gantt toolbar props
 * @component GanttToolbar
 */
export interface GanttToolbarProps {
  /** Current scale */
  scale: TimelineScale;
  /** Show critical path toggle state */
  showCriticalPath: boolean;
  /** Show dependencies toggle state */
  showDependencies: boolean;
  /** Callback when scale changes */
  onScaleChange: (scale: TimelineScale) => void;
  /** Callback when critical path toggle changes */
  onCriticalPathToggle: (show: boolean) => void;
  /** Callback when dependencies toggle changes */
  onDependenciesToggle: (show: boolean) => void;
  /** Callback when zoom in is clicked */
  onZoomIn: () => void;
  /** Callback when zoom out is clicked */
  onZoomOut: () => void;
  /** Callback when today is clicked */
  onGoToToday: () => void;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Activities API response
 */
export interface ActivitiesResponse {
  /** Activity data */
  activities: GanttActivity[];
  /** Relationships data */
  relationships: ActivityRelationship[];
  /** Project data date */
  dataDate: string;
  /** Total activity count */
  totalCount: number;
}

/**
 * Activity detail API response
 */
export interface ActivityDetailResponse {
  /** Activity data */
  activity: GanttActivity;
  /** Assigned resources */
  resources: Array<{
    name: string;
    role: string;
    units: number;
  }>;
  /** Cost data */
  costs: {
    plannedCost: number;
    actualCost: number;
    remainingCost: number;
  };
}

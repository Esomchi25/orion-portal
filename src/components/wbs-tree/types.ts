/**
 * WBS Tree Component Types (DATA HOLDERS)
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3
 *
 * These interfaces define the data shape for WBS tree components.
 */

// ============================================================================
// WBS NODE DATA
// ============================================================================

/**
 * WBS Node representing a Work Breakdown Structure element
 * @component WBSTree
 * @schema p6_raw.wbs + p6_raw.activities + orion_xconf.wbs_mapping
 * @api GET /api/v1/p6/projects/{projectObjectId}/wbs
 */
export interface WBSNode {
  /** Internal UUID */
  id: string;
  /** P6 Object ID (unique) */
  objectId: number;
  /** Parent WBS Object ID (null for root) */
  parentObjectId: number | null;
  /** WBS Code (e.g., "1.1.2") */
  wbsCode: string;
  /** WBS Name */
  name: string;
  /** Percent complete (0-100) */
  percentComplete: number;
  /** Budget at Completion */
  budgetAtCompletion: number;
  /** Planned Total Cost */
  plannedTotalCost: number;
  /** Actual Total Cost */
  actualTotalCost: number;
  /** Hierarchy level (0 = root) */
  hierarchyLevel: number;
  /** Number of activities under this WBS */
  activityCount: number;
  /** Child WBS nodes */
  children: WBSNode[];
  /** Whether node is expanded in tree */
  isExpanded: boolean;
  /** Whether WBS is mapped to SAP */
  sapMapped: boolean;
}

// ============================================================================
// WBS DETAIL (SLIDE-OUT PANEL)
// ============================================================================

/**
 * SAP Mapping information for a WBS
 */
export interface WBSSAPMapping {
  /** SAP Project Structure Element ID */
  posid: string | null;
  /** SAP Description */
  post1: string | null;
  /** Mapping strategy used */
  mappingStrategy: string | null;
  /** Confidence score (0-1) */
  confidenceScore: number | null;
  /** Whether mapping is verified */
  isVerified: boolean;
}

/**
 * SAP Financial data for a WBS
 */
export interface WBSSAPFinancials {
  /** SAP Budget amount (HSL - CURRENCY-001 compliant) */
  budget: number;
  /** SAP Actuals amount (HSL - CURRENCY-001 compliant) */
  actuals: number;
  /** SAP Commitments amount (HSL - CURRENCY-001 compliant) */
  commitments: number;
}

/**
 * Detailed WBS information for slide-out panel
 * @component WBSDetailPanel
 * @schema p6_raw.wbs + orion_xconf.wbs_mapping + sap_raw.acdoca + sap_raw.bpge
 * @api GET /api/v1/p6/wbs/{wbsObjectId}
 */
export interface WBSDetail {
  /** P6 Object ID */
  objectId: number;
  /** WBS Code */
  wbsCode: string;
  /** WBS Name */
  name: string;
  /** Status */
  status: string;
  /** Percent complete (0-100) */
  percentComplete: number;
  /** Planned start date (ISO 8601) */
  plannedStart: string;
  /** Planned finish date (ISO 8601) */
  plannedFinish: string;
  /** Budget at Completion */
  budgetAtCompletion: number;
  /** Planned Total Cost */
  plannedTotalCost: number;
  /** Actual Total Cost */
  actualTotalCost: number;
  /** Remaining Total Cost */
  remainingTotalCost: number;
  /** SAP Mapping (null if not mapped) */
  sapMapping: WBSSAPMapping | null;
  /** SAP Financials (null if not mapped) */
  sapFinancials: WBSSAPFinancials | null;
  /** Number of activities */
  activityCount: number;
  /** Number of resources assigned */
  resourceCount: number;
}

// ============================================================================
// TREE STATE
// ============================================================================

/**
 * WBS Tree component state
 * @component WBSTree
 */
export interface WBSTreeState {
  /** Root nodes (nested tree structure) */
  nodes: WBSNode[];
  /** Set of expanded node IDs */
  expandedIds: Set<number>;
  /** Currently selected node ID */
  selectedId: number | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * WBS Tree main component props
 * @component WBSTree
 */
export interface WBSTreeProps {
  /** Project Object ID to load WBS for */
  projectObjectId: number;
  /** Tenant ID for data fetching */
  tenantId: string;
  /** Callback when a WBS node is selected */
  onNodeSelect?: (node: WBSNode) => void;
  /** Callback when "View Activities" is clicked */
  onViewActivities?: (wbsObjectId: number) => void;
  /** Initially expanded node IDs */
  initialExpandedIds?: number[];
  /** Show SAP mapping indicators */
  showSAPMapping?: boolean;
}

/**
 * Individual WBS tree node props
 * @component WBSTreeNode
 */
export interface WBSTreeNodeProps {
  /** The WBS node data */
  node: WBSNode;
  /** Current hierarchy level (for indentation) */
  level: number;
  /** Whether node is expanded */
  isExpanded: boolean;
  /** Whether node is selected */
  isSelected: boolean;
  /** Callback when node expand/collapse is toggled */
  onToggle: (objectId: number) => void;
  /** Callback when node is selected */
  onSelect: (node: WBSNode) => void;
  /** Show SAP mapping indicator */
  showSAPMapping: boolean;
}

/**
 * WBS Detail panel props
 * @component WBSDetailPanel
 */
export interface WBSDetailPanelProps {
  /** WBS Object ID to show details for */
  wbsObjectId: number | null;
  /** Tenant ID for data fetching */
  tenantId: string;
  /** Whether panel is open */
  isOpen: boolean;
  /** Callback when panel is closed */
  onClose: () => void;
  /** Callback when "View Activities" is clicked */
  onViewActivities?: (wbsObjectId: number) => void;
  /** Callback when "View in SAP" is clicked */
  onViewInSAP?: (posid: string) => void;
}

/**
 * WBS Breadcrumb props
 * @component WBSBreadcrumb
 */
export interface WBSBreadcrumbProps {
  /** Path of WBS nodes from root to current */
  path: Array<{ objectId: number; name: string; wbsCode: string }>;
  /** Callback when a breadcrumb is clicked */
  onNavigate: (objectId: number) => void;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * WBS Tree API response
 */
export interface WBSTreeResponse {
  /** Tree nodes (nested structure) */
  nodes: WBSNode[];
  /** Total count of WBS elements */
  totalCount: number;
}

/**
 * WBS Detail API response
 */
export type WBSDetailResponse = WBSDetail;

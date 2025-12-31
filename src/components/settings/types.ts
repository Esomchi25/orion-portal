/**
 * Settings Page Component Types (DATA HOLDERS)
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:9
 *
 * These interfaces define the data shape for Settings page components.
 */

// ============================================================================
// P6 CONNECTION SETTINGS
// ============================================================================

/**
 * P6 Connection configuration
 * @component P6ConnectionSettings
 * @schema orion_sync.connection_configs (P6)
 * @api GET/PUT /api/v1/settings/connections/p6
 */
export interface P6ConnectionConfig {
  /** Connection ID (UUID) */
  id: string;
  /** WSDL URL for P6 Web Services */
  wsdlUrl: string;
  /** P6 Username */
  username: string;
  /** P6 Password (masked in UI) */
  password?: string;
  /** P6 Database Instance */
  databaseInstance: string;
  /** Connection status */
  status: 'connected' | 'disconnected' | 'error';
  /** Last connection test timestamp */
  lastTestedAt: string | null;
  /** Last error message if any */
  lastError: string | null;
  /** Is connection enabled */
  isEnabled: boolean;
}

// ============================================================================
// SAP CONNECTION SETTINGS
// ============================================================================

/**
 * SAP Connection configuration
 * @component SAPConnectionSettings
 * @schema orion_sync.connection_configs (SAP)
 * @api GET/PUT /api/v1/settings/connections/sap
 */
export interface SAPConnectionConfig {
  /** Connection ID (UUID) */
  id: string;
  /** SAP Host URL */
  hostUrl: string;
  /** SAP Client */
  client: string;
  /** SAP Username */
  username: string;
  /** SAP Password (masked in UI) */
  password?: string;
  /** SAP System Number */
  systemNumber: string;
  /** SAP Instance Number */
  instanceNumber: string;
  /** Connection type (HANA/RFC) */
  connectionType: 'hana' | 'rfc';
  /** Connection status */
  status: 'connected' | 'disconnected' | 'error';
  /** Last connection test timestamp */
  lastTestedAt: string | null;
  /** Last error message if any */
  lastError: string | null;
  /** Is connection enabled */
  isEnabled: boolean;
}

// ============================================================================
// SYNC CONFIGURATION
// ============================================================================

/**
 * Sync schedule configuration
 * @component SyncSettings
 * @schema orion_sync.sync_schedules
 * @api GET/PUT /api/v1/settings/sync
 */
export interface SyncConfig {
  /** Sync schedule ID */
  id: string;
  /** Sync frequency */
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
  /** Cron expression for custom schedules */
  cronExpression: string | null;
  /** Sync enabled */
  isEnabled: boolean;
  /** Last sync timestamp */
  lastSyncAt: string | null;
  /** Last sync status */
  lastSyncStatus: 'success' | 'partial' | 'failed' | null;
  /** Last sync duration in seconds */
  lastSyncDurationSeconds: number | null;
  /** Records synced in last run */
  lastSyncRecordCount: number | null;
  /** Next scheduled sync */
  nextScheduledAt: string | null;
  /** P6 entities to sync */
  p6Entities: P6SyncEntity[];
  /** SAP entities to sync */
  sapEntities: SAPSyncEntity[];
}

/**
 * P6 entity sync configuration
 */
export interface P6SyncEntity {
  /** Entity name */
  name: 'projects' | 'wbs' | 'activities' | 'relationships' | 'resources' | 'assignments';
  /** Is enabled for sync */
  isEnabled: boolean;
  /** Last sync count */
  lastSyncCount: number | null;
  /** Last sync timestamp */
  lastSyncAt: string | null;
}

/**
 * SAP entity sync configuration
 */
export interface SAPSyncEntity {
  /** Entity name */
  name: 'acdoca' | 'prps' | 'bseg' | 'ekko' | 'ekpo' | 'tcurr';
  /** Is enabled for sync */
  isEnabled: boolean;
  /** Last sync count */
  lastSyncCount: number | null;
  /** Last sync timestamp */
  lastSyncAt: string | null;
  /** Filter: WRTTP for ACDOCA (04 = actuals) */
  wrttpFilter?: string;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * User preferences
 * @component UserPreferences
 * @schema orion_core.user_preferences
 * @api GET/PUT /api/v1/settings/preferences
 */
export interface UserPreferences {
  /** User ID */
  userId: string;
  /** Theme preference */
  theme: 'light' | 'dark' | 'system';
  /** Default date format */
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  /** Default number format */
  numberFormat: 'en-US' | 'en-GB' | 'de-DE';
  /** Default currency */
  currency: string;
  /** Default timezone */
  timezone: string;
  /** Show notifications */
  showNotifications: boolean;
  /** Email notifications */
  emailNotifications: boolean;
  /** Default Gantt scale */
  defaultGanttScale: 'day' | 'week' | 'month' | 'quarter' | 'year';
  /** Default dashboard view */
  defaultDashboardView: 'portfolio' | 'project' | 'sync';
}

// ============================================================================
// TENANT SETTINGS
// ============================================================================

/**
 * Tenant configuration
 * @component TenantSettings
 * @schema orion_core.tenants
 * @api GET/PUT /api/v1/settings/tenant
 */
export interface TenantConfig {
  /** Tenant ID */
  id: string;
  /** Tenant name */
  name: string;
  /** Subscription tier */
  tier: 'starter' | 'professional' | 'enterprise';
  /** Max projects allowed */
  maxProjects: number;
  /** Max users allowed */
  maxUsers: number;
  /** Current project count */
  currentProjectCount: number;
  /** Current user count */
  currentUserCount: number;
  /** Features enabled */
  features: TenantFeatures;
  /** Subscription status */
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  /** Trial end date if applicable */
  trialEndsAt: string | null;
  /** Billing email */
  billingEmail: string;
}

/**
 * Tenant feature flags
 */
export interface TenantFeatures {
  /** AI chat enabled */
  aiChat: boolean;
  /** Advanced EVM calculations */
  advancedEvm: boolean;
  /** Custom reports */
  customReports: boolean;
  /** API access */
  apiAccess: boolean;
  /** SSO enabled */
  sso: boolean;
  /** Audit logging */
  auditLogging: boolean;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Settings page props
 * @component SettingsPage
 */
export interface SettingsPageProps {
  /** Current tenant ID */
  tenantId: string;
  /** Current user ID */
  userId: string;
  /** Initial tab to show */
  initialTab?: SettingsTab;
  /** Callback when settings are saved */
  onSettingsSaved?: () => void;
}

/**
 * Settings tabs
 */
export type SettingsTab = 'connections' | 'sync' | 'preferences' | 'tenant';

/**
 * P6 Connection settings props
 * @component P6ConnectionSettings
 */
export interface P6ConnectionSettingsProps {
  /** Current config */
  config: P6ConnectionConfig;
  /** Loading state */
  isLoading: boolean;
  /** Test connection callback */
  onTestConnection: () => Promise<void>;
  /** Save callback */
  onSave: (config: Partial<P6ConnectionConfig>) => Promise<void>;
  /** Error message */
  error: string | null;
}

/**
 * SAP Connection settings props
 * @component SAPConnectionSettings
 */
export interface SAPConnectionSettingsProps {
  /** Current config */
  config: SAPConnectionConfig;
  /** Loading state */
  isLoading: boolean;
  /** Test connection callback */
  onTestConnection: () => Promise<void>;
  /** Save callback */
  onSave: (config: Partial<SAPConnectionConfig>) => Promise<void>;
  /** Error message */
  error: string | null;
}

/**
 * Sync settings props
 * @component SyncSettings
 */
export interface SyncSettingsProps {
  /** Current config */
  config: SyncConfig;
  /** Loading state */
  isLoading: boolean;
  /** Trigger manual sync */
  onTriggerSync: () => Promise<void>;
  /** Save callback */
  onSave: (config: Partial<SyncConfig>) => Promise<void>;
  /** Error message */
  error: string | null;
}

/**
 * User preferences props
 * @component UserPreferencesSettings
 */
export interface UserPreferencesProps {
  /** Current preferences */
  preferences: UserPreferences;
  /** Loading state */
  isLoading: boolean;
  /** Save callback */
  onSave: (preferences: Partial<UserPreferences>) => Promise<void>;
  /** Error message */
  error: string | null;
}

/**
 * Tenant settings props
 * @component TenantSettings
 */
export interface TenantSettingsProps {
  /** Current tenant config */
  config: TenantConfig;
  /** Loading state */
  isLoading: boolean;
  /** Is admin user */
  isAdmin: boolean;
  /** Error message */
  error: string | null;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Settings API response
 */
export interface SettingsResponse {
  /** P6 connection config */
  p6Connection: P6ConnectionConfig | null;
  /** SAP connection config */
  sapConnection: SAPConnectionConfig | null;
  /** Sync config */
  syncConfig: SyncConfig;
  /** User preferences */
  preferences: UserPreferences;
  /** Tenant config */
  tenant: TenantConfig;
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  /** Was successful */
  success: boolean;
  /** Message */
  message: string;
  /** Response time in ms */
  responseTimeMs: number;
  /** Details if available */
  details?: Record<string, unknown>;
}

/**
 * Save settings result
 */
export interface SaveSettingsResult {
  /** Was successful */
  success: boolean;
  /** Message */
  message: string;
  /** Updated config */
  config?: unknown;
}

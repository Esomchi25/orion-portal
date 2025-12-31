/**
 * Settings Component Public Exports
 * @governance COMPONENT-001
 */

export {
  SettingsPage,
  P6ConnectionSettings,
  SAPConnectionSettings,
  SyncSettings,
  UserPreferencesSettings,
} from './Settings';

export type {
  // P6 Connection
  P6ConnectionConfig,
  P6ConnectionSettingsProps,

  // SAP Connection
  SAPConnectionConfig,
  SAPConnectionSettingsProps,

  // Sync Configuration
  SyncConfig,
  SyncSettingsProps,
  P6SyncEntity,
  SAPSyncEntity,

  // User Preferences
  UserPreferences,
  UserPreferencesProps,

  // Tenant Settings
  TenantConfig,
  TenantFeatures,
  TenantSettingsProps,

  // Page Props
  SettingsPageProps,
  SettingsTab,

  // API Response Types
  SettingsResponse,
  ConnectionTestResult,
  SaveSettingsResult,
} from './types';

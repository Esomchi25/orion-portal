/**
 * Settings Page Components
 * @governance COMPONENT-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:9
 *
 * Components:
 * - SettingsPage: Main settings container with tabs
 * - P6ConnectionSettings: P6 connection configuration
 * - SAPConnectionSettings: SAP connection configuration
 * - SyncSettings: Sync schedule and entity configuration
 * - UserPreferencesSettings: User preferences
 */

'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import type {
  P6ConnectionConfig,
  SAPConnectionConfig,
  SyncConfig,
  UserPreferences,
  TenantConfig,
  SettingsPageProps,
  SettingsTab,
  P6ConnectionSettingsProps,
  SAPConnectionSettingsProps,
  SyncSettingsProps,
  UserPreferencesProps,
  TenantSettingsProps,
  SettingsResponse,
} from './types';

// ============================================================================
// P6 CONNECTION SETTINGS
// ============================================================================

export const P6ConnectionSettings = memo(function P6ConnectionSettings({
  config,
  isLoading,
  onTestConnection,
  onSave,
  error,
}: P6ConnectionSettingsProps) {
  const [formData, setFormData] = useState<Partial<P6ConnectionConfig>>(config);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await onTestConnection();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">P6 Connection</h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              config.status === 'connected'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : config.status === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {config.status.charAt(0).toUpperCase() + config.status.slice(1)}
          </span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              role="switch"
              aria-label="Enable P6 connection"
              checked={formData.isEnabled ?? config.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="p6-wsdl" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            WSDL URL
          </label>
          <input
            id="p6-wsdl"
            type="url"
            value={formData.wsdlUrl ?? config.wsdlUrl}
            onChange={(e) => setFormData({ ...formData, wsdlUrl: e.target.value })}
            placeholder="https://p6.example.com/p6ws/services"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="p6-database" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Database Instance
          </label>
          <input
            id="p6-database"
            type="text"
            value={formData.databaseInstance ?? config.databaseInstance}
            onChange={(e) => setFormData({ ...formData, databaseInstance: e.target.value })}
            placeholder="PRIMAVERA"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="p6-username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Username
          </label>
          <input
            id="p6-username"
            type="text"
            value={formData.username ?? config.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="p6-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Password
          </label>
          <input
            id="p6-password"
            type="password"
            value={formData.password ?? ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {config.lastTestedAt && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last tested: {new Date(config.lastTestedAt).toLocaleString()}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isLoading || isTesting}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// SAP CONNECTION SETTINGS
// ============================================================================

export const SAPConnectionSettings = memo(function SAPConnectionSettings({
  config,
  isLoading,
  onTestConnection,
  onSave,
  error,
}: SAPConnectionSettingsProps) {
  const [formData, setFormData] = useState<Partial<SAPConnectionConfig>>(config);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await onTestConnection();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">SAP Connection</h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              config.status === 'connected'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : config.status === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {config.status.charAt(0).toUpperCase() + config.status.slice(1)}
          </span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              role="switch"
              aria-label="Enable SAP connection"
              checked={formData.isEnabled ?? config.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sap-host" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Host URL
          </label>
          <input
            id="sap-host"
            type="url"
            value={formData.hostUrl ?? config.hostUrl}
            onChange={(e) => setFormData({ ...formData, hostUrl: e.target.value })}
            placeholder="https://sap.example.com:8443"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sap-connection-type" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Connection Type
          </label>
          <select
            id="sap-connection-type"
            aria-label="Connection Type"
            value={formData.connectionType ?? config.connectionType}
            onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as 'hana' | 'rfc' })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="hana">HANA Direct</option>
            <option value="rfc">RFC (SAP PyRFC)</option>
          </select>
        </div>

        <div>
          <label htmlFor="sap-client" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Client
          </label>
          <input
            id="sap-client"
            type="text"
            value={formData.client ?? config.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            placeholder="100"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sap-system" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            System Number
          </label>
          <input
            id="sap-system"
            type="text"
            value={formData.systemNumber ?? config.systemNumber}
            onChange={(e) => setFormData({ ...formData, systemNumber: e.target.value })}
            placeholder="00"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sap-username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Username
          </label>
          <input
            id="sap-username"
            type="text"
            value={formData.username ?? config.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sap-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Password
          </label>
          <input
            id="sap-password"
            type="password"
            value={formData.password ?? ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {config.lastTestedAt && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last tested: {new Date(config.lastTestedAt).toLocaleString()}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isLoading || isTesting}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// SYNC SETTINGS
// ============================================================================

export const SyncSettings = memo(function SyncSettings({
  config,
  isLoading,
  onTriggerSync,
  onSave,
  error,
}: SyncSettingsProps) {
  const [formData, setFormData] = useState<Partial<SyncConfig>>(config);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      await onTriggerSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleP6Entity = (name: string, enabled: boolean) => {
    const entities = (formData.p6Entities ?? config.p6Entities).map((e) =>
      e.name === name ? { ...e, isEnabled: enabled } : e
    );
    setFormData({ ...formData, p6Entities: entities });
  };

  const toggleSAPEntity = (name: string, enabled: boolean) => {
    const entities = (formData.sapEntities ?? config.sapEntities).map((e) =>
      e.name === name ? { ...e, isEnabled: enabled } : e
    );
    setFormData({ ...formData, sapEntities: entities });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sync Configuration</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              role="switch"
              aria-label="Enable sync"
              checked={formData.isEnabled ?? config.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
            <span className="text-sm text-gray-700 dark:text-gray-200">Enable Sync</span>
          </label>
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isLoading || isSyncing}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Last Sync Status */}
      {config.lastSyncAt && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Last Sync: {config.lastSyncStatus === 'success' ? 'Success' : config.lastSyncStatus}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(config.lastSyncAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {config.lastSyncRecordCount?.toLocaleString() ?? 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                records in {config.lastSyncDurationSeconds ?? 0}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Frequency */}
      <div>
        <label htmlFor="sync-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Frequency
        </label>
        <select
          id="sync-frequency"
          aria-label="Frequency"
          value={formData.frequency ?? config.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value as SyncConfig['frequency'] })}
          className="mt-1 block w-full max-w-xs rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="manual">Manual Only</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {/* P6 Entities */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">P6 Entities</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(formData.p6Entities ?? config.p6Entities).map((entity) => (
            <label key={entity.name} className="flex items-center gap-2">
              <input
                type="checkbox"
                role="switch"
                aria-label={entity.name}
                checked={entity.isEnabled}
                onChange={(e) => toggleP6Entity(entity.name, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 capitalize">
                {entity.name}
              </span>
              {entity.lastSyncCount !== null && (
                <span className="text-xs text-gray-500">({entity.lastSyncCount})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* SAP Entities */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">SAP Entities</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(formData.sapEntities ?? config.sapEntities).map((entity) => (
            <label key={entity.name} className="flex items-center gap-2">
              <input
                type="checkbox"
                role="switch"
                aria-label={entity.name}
                checked={entity.isEnabled}
                onChange={(e) => toggleSAPEntity(entity.name, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 uppercase">
                {entity.name}
              </span>
              {entity.lastSyncCount !== null && (
                <span className="text-xs text-gray-500">({entity.lastSyncCount})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onSave(formData)}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// USER PREFERENCES SETTINGS
// ============================================================================

export const UserPreferencesSettings = memo(function UserPreferencesSettings({
  preferences,
  isLoading,
  onSave,
  error,
}: UserPreferencesProps) {
  const [formData, setFormData] = useState<Partial<UserPreferences>>(preferences);

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">User Preferences</h2>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme */}
        <div>
          <label htmlFor="pref-theme" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Theme
          </label>
          <select
            id="pref-theme"
            aria-label="Theme"
            value={formData.theme ?? preferences.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value as UserPreferences['theme'] })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Date Format */}
        <div>
          <label htmlFor="pref-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Date Format
          </label>
          <select
            id="pref-date"
            aria-label="Date Format"
            value={formData.dateFormat ?? preferences.dateFormat}
            onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value as UserPreferences['dateFormat'] })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="pref-timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Timezone
          </label>
          <select
            id="pref-timezone"
            aria-label="Timezone"
            value={formData.timezone ?? preferences.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT/BST)</option>
            <option value="Europe/Paris">Central European (CET)</option>
            <option value="Asia/Dubai">Gulf Standard (GST)</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="pref-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Currency
          </label>
          <select
            id="pref-currency"
            aria-label="Currency"
            value={formData.currency ?? preferences.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="AED">AED - UAE Dirham</option>
            <option value="NGN">NGN - Nigerian Naira</option>
          </select>
        </div>
      </div>

      {/* Notification Toggles */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Notifications</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              role="switch"
              aria-label="Show notifications"
              checked={formData.showNotifications ?? preferences.showNotifications}
              onChange={(e) => setFormData({ ...formData, showNotifications: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">Show in-app notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              role="switch"
              aria-label="Email notifications"
              checked={formData.emailNotifications ?? preferences.emailNotifications}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">Email notifications</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// TENANT SETTINGS
// ============================================================================

const TenantSettings = memo(function TenantSettings({
  config,
  isLoading,
  isAdmin,
  error,
}: TenantSettingsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tenant Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Organization</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{config.name}</p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Subscription</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {config.tier} - {config.subscriptionStatus}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Projects</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {config.currentProjectCount} / {config.maxProjects}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Users</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {config.currentUserCount} / {config.maxUsers}
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(config.features).map(([feature, enabled]) => (
            <div
              key={feature}
              className={`px-3 py-2 rounded-md text-sm ${
                enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {feature.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// SETTINGS PAGE
// ============================================================================

export const SettingsPage = memo(function SettingsPage({
  tenantId,
  userId,
  initialTab = 'connections',
  onSettingsSaved,
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/settings?tenantId=${tenantId}&userId=${userId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to load settings');
        }

        const data: SettingsResponse = await response.json();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [tenantId, userId]);

  // Tab keyboard navigation
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const tabs: SettingsTab[] = ['connections', 'sync', 'preferences', 'tenant'];
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
      (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIndex]);
      (e.currentTarget.parentElement?.children[prevIndex] as HTMLElement)?.focus();
    }
  };

  // Save handlers
  const handleSaveP6 = async (config: Partial<P6ConnectionConfig>) => {
    setSaveError(null);
    try {
      const response = await fetch(`/api/v1/settings/connections/p6`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to save');
      onSettingsSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleTestP6 = async () => {
    const response = await fetch(`/api/v1/settings/connections/p6/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Connection test failed');
  };

  const handleSaveSAP = async (config: Partial<SAPConnectionConfig>) => {
    setSaveError(null);
    try {
      const response = await fetch(`/api/v1/settings/connections/sap`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to save');
      onSettingsSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleTestSAP = async () => {
    const response = await fetch(`/api/v1/settings/connections/sap/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Connection test failed');
  };

  const handleSaveSync = async (config: Partial<SyncConfig>) => {
    setSaveError(null);
    try {
      const response = await fetch(`/api/v1/settings/sync`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to save');
      onSettingsSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleTriggerSync = async () => {
    await fetch(`/api/v1/sync/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const handleSavePreferences = async (prefs: Partial<UserPreferences>) => {
    setSaveError(null);
    try {
      const response = await fetch(`/api/v1/settings/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      if (!response.ok) throw new Error('Failed to save');
      onSettingsSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div role="status" className="flex items-center justify-center p-8">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading settings...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">Failed to load settings: {error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 text-sm font-medium text-red-800 dark:text-red-200 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!settings) return null;

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'connections', label: 'Connections' },
    { key: 'sync', label: 'Sync' },
    { key: 'preferences', label: 'Preferences' },
    { key: 'tenant', label: 'Tenant' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex border-b border-gray-200 dark:border-gray-700 mb-6"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            onClick={() => setActiveTab(tab.key)}
            onKeyDown={(e) => handleTabKeyDown(e, index)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        {activeTab === 'connections' && (
          <div className="space-y-8">
            {settings.p6Connection && (
              <P6ConnectionSettings
                config={settings.p6Connection}
                isLoading={false}
                onTestConnection={handleTestP6}
                onSave={handleSaveP6}
                error={saveError}
              />
            )}
            <hr className="border-gray-200 dark:border-gray-700" />
            {settings.sapConnection && (
              <SAPConnectionSettings
                config={settings.sapConnection}
                isLoading={false}
                onTestConnection={handleTestSAP}
                onSave={handleSaveSAP}
                error={saveError}
              />
            )}
          </div>
        )}

        {activeTab === 'sync' && (
          <SyncSettings
            config={settings.syncConfig}
            isLoading={false}
            onTriggerSync={handleTriggerSync}
            onSave={handleSaveSync}
            error={saveError}
          />
        )}

        {activeTab === 'preferences' && (
          <UserPreferencesSettings
            preferences={settings.preferences}
            isLoading={false}
            onSave={handleSavePreferences}
            error={saveError}
          />
        )}

        {activeTab === 'tenant' && (
          <TenantSettings
            config={settings.tenant}
            isLoading={false}
            isAdmin={true}
            error={null}
          />
        )}
      </div>
    </div>
  );
});

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default SettingsPage;

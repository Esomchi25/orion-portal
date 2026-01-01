/**
 * Data Mode Utilities
 * @governance DOC-002
 *
 * Utilities for determining which schema to query based on data mode.
 * Used by all API routes to support Mock/Live toggle.
 */

import { NextRequest } from 'next/server';

export type DataMode = 'mock' | 'live';

/**
 * Get data mode from request headers or query params
 */
export function getDataModeFromRequest(request: NextRequest): DataMode {
  // Check X-Data-Mode header first (set by frontend)
  const headerMode = request.headers.get('X-Data-Mode');
  if (headerMode === 'mock' || headerMode === 'live') {
    return headerMode;
  }

  // Check query parameter
  const { searchParams } = new URL(request.url);
  const queryMode = searchParams.get('dataMode');
  if (queryMode === 'mock' || queryMode === 'live') {
    return queryMode;
  }

  // Default to mock for safety
  return 'mock';
}

/**
 * Schema mapping for Mock vs Live data
 */
export const SCHEMA_MAP = {
  mock: {
    core: 'client_demo',
    evm: 'client_demo',
    p6: 'client_demo',
    sap: 'client_demo',
    sync: 'client_demo',
  },
  live: {
    core: 'orion_core',
    evm: 'orion_evm',
    p6: 'p6_raw',
    sap: 'sap_raw',
    sync: 'orion_sync',
  },
} as const;

/**
 * Get the schema for a given type based on data mode
 */
export function getSchema(
  mode: DataMode,
  type: 'core' | 'evm' | 'p6' | 'sap' | 'sync'
): string {
  return SCHEMA_MAP[mode][type];
}

/**
 * Get the full table name with schema prefix
 */
export function getTable(
  mode: DataMode,
  schemaType: 'core' | 'evm' | 'p6' | 'sap' | 'sync',
  tableName: string
): string {
  const schema = getSchema(mode, schemaType);
  return `${schema}.${tableName}`;
}

/**
 * Table name mappings between mock and live schemas
 * Some tables have different names in client_demo vs production
 */
export const TABLE_MAP = {
  mock: {
    projects: 'client_demo.projects',
    project_snapshots: 'client_demo.project_snapshots',
    domain_metrics: 'client_demo.domain_metrics',
    activities: 'client_demo.activities',
    wbs: 'client_demo.wbs',
    sync_status: 'client_demo.sync_status',
    portfolio_financials: 'client_demo.portfolio_financials',
  },
  live: {
    projects: 'orion_core.projects',
    project_snapshots: 'orion_evm.project_snapshots',
    domain_metrics: 'orion_evm.wbs_metrics',
    activities: 'p6_raw.activities',
    wbs: 'p6_raw.wbs',
    sync_status: 'orion_sync.batches',
    portfolio_financials: 'sap_raw.acdoca', // Aggregated from SAP
  },
} as const;

/**
 * Get the appropriate table for a data type
 */
export function getMappedTable(
  mode: DataMode,
  tableType: keyof typeof TABLE_MAP.mock
): string {
  return TABLE_MAP[mode][tableType];
}

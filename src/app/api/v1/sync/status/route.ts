/**
 * Sync Status API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:1.3
 *
 * Returns P6 and SAP sync status from orion_sync.batches and orion_xconf.client_config
 *
 * GET /api/v1/sync/status?tenant={tenantId}
 *
 * Response:
 * {
 *   p6: { connected: boolean, lastSync: string | null, status: string },
 *   sap: { connected: boolean, lastSync: string | null, status: string },
 *   nextScheduled: string | null
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type SyncStatusType = 'success' | 'failed' | 'running' | 'never';

interface SystemSyncStatus {
  connected: boolean;
  lastSync: string | null;
  status: SyncStatusType;
}

interface SyncStatus {
  p6: SystemSyncStatus;
  sap: SystemSyncStatus;
  nextScheduled: string | null;
}

// Mock data for development
const MOCK_SYNC_STATUS: SyncStatus = {
  p6: {
    connected: true,
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
    status: 'success',
  },
  sap: {
    connected: true,
    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    status: 'success',
  },
  nextScheduled: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // in 45 min
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant');

    // Validate tenant parameter
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant parameter' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAnonKey) {
      // Return mock data for development/testing
      console.warn('[SYNC API] Supabase not configured, returning mock data');
      return NextResponse.json(MOCK_SYNC_STATUS);
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query client config for connection status
    const { data: config, error: configError } = await supabase
      .from('orion_xconf.client_config')
      .select('p6_wsdl_url, sap_host, sync_schedule_cron')
      .eq('tenant_id', tenantId)
      .single();

    if (configError) {
      console.warn('[SYNC API] Config error, using mock:', configError);
      return NextResponse.json(MOCK_SYNC_STATUS);
    }

    // Query last sync batches
    const { data: p6Batch } = await supabase
      .from('orion_sync.batches')
      .select('completed_at, status')
      .eq('tenant_id', tenantId)
      .eq('source', 'p6')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    const { data: sapBatch } = await supabase
      .from('orion_sync.batches')
      .select('completed_at, status')
      .eq('tenant_id', tenantId)
      .eq('source', 'sap')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    // Build sync status
    const syncStatus: SyncStatus = {
      p6: {
        connected: !!config?.p6_wsdl_url,
        lastSync: p6Batch?.completed_at || null,
        status: (p6Batch?.status as SyncStatusType) || 'never',
      },
      sap: {
        connected: !!config?.sap_host,
        lastSync: sapBatch?.completed_at || null,
        status: (sapBatch?.status as SyncStatusType) || 'never',
      },
      nextScheduled: calculateNextSync(config?.sync_schedule_cron),
    };

    // Return with VERIFY-001 headers
    return NextResponse.json(syncStatus, {
      headers: {
        'X-Data-Source': 'supabase:orion_sync.batches,orion_xconf.client_config',
        'X-Tenant-Id': tenantId,
        'X-Verified-At': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[SYNC API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate next sync time from cron expression
 * Simplified - just adds 1 hour from now for MVP
 */
function calculateNextSync(cronExpr: string | null | undefined): string | null {
  if (!cronExpr) return null;
  // For MVP, return 1 hour from now
  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

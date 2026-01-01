/**
 * Project Budget API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3.4
 *
 * Returns project budget analytics (BAC, EV, AC, EAC, VAC, etc.)
 *
 * GET /api/v1/project/{projectId}/budget?tenant={tenantId}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDataModeFromRequest, getMappedTable } from '@/lib/dataMode';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface BudgetAnalytics {
  bac: number;
  ev: number;
  ac: number;
  pv: number;
  eac: number;
  etc: number;
  vac: number;
  currency: 'USD' | 'NGN';
}

// Mock data for development
const MOCK_BUDGET: BudgetAnalytics = {
  bac: 250_000_000,
  ev: 192_500_000,
  ac: 80_000_000,
  pv: 235_000_000,
  eac: 104_166_667,
  etc: 24_166_667,
  vac: 145_833_333,
  currency: 'USD',
};

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const params = await props.params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant');
    const { projectId } = params;

    // Get data mode from request
    const dataMode = getDataModeFromRequest(request);
    const snapshotsTable = getMappedTable(dataMode, 'project_snapshots');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant parameter' },
        { status: 400 }
      );
    }

    if (!supabaseAnonKey) {
      console.warn('[BUDGET API] Supabase not configured, returning mock data');
      return NextResponse.json(MOCK_BUDGET, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query latest EVM snapshot for budget data based on data mode
    const { data: snapshot, error } = await supabase
      .from(snapshotsTable)
      .select('bac, ev, ac, pv, eac, etc, vac')
      .eq('tenant_id', tenantId)
      .eq('project_id', projectId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !snapshot) {
      console.warn('[BUDGET API] Snapshot not found, returning mock');
      return NextResponse.json(MOCK_BUDGET, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    const budget: BudgetAnalytics = {
      bac: snapshot.bac || 0,
      ev: snapshot.ev || 0,
      ac: snapshot.ac || 0,
      pv: snapshot.pv || 0,
      eac: snapshot.eac || 0,
      etc: snapshot.etc || 0,
      vac: snapshot.vac || 0,
      currency: 'USD',
    };

    return NextResponse.json(budget, {
      headers: {
        'X-Data-Source': `supabase:${snapshotsTable}`,
        'X-Data-Mode': dataMode,
        'X-Tenant-Id': tenantId,
        'X-Project-Id': projectId,
        'X-Verified-At': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[BUDGET API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

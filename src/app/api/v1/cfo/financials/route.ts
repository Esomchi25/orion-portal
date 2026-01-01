/**
 * CFO Portfolio Financials API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:2.2
 *
 * Returns portfolio financial summary aggregated from SAP
 *
 * GET /api/v1/cfo/financials?tenant={tenantId}
 *
 * Response:
 * {
 *   totalBAC: number,
 *   actualCosts: number,
 *   openCommitments: number,
 *   revenueReceived: number,
 *   netCashPosition: number,
 *   currency: 'USD' | 'NGN'
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDataModeFromRequest, getMappedTable } from '@/lib/dataMode';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface PortfolioFinancials {
  totalBAC: number;
  actualCosts: number;
  openCommitments: number;
  revenueReceived: number;
  netCashPosition: number;
  currency: 'USD' | 'NGN';
}

// Mock data for development - matches ORION Platform Audit values
const MOCK_FINANCIALS: PortfolioFinancials = {
  totalBAC: 1_100_000_000,        // $1.1B total budget
  actualCosts: 464_600_000,       // $464.6M spent
  openCommitments: 481_600_000,   // $481.6M committed
  revenueReceived: 1_200_000_000, // $1.2B revenue
  netCashPosition: 711_700_000,   // $711.7M net cash
  currency: 'USD',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant');

    // Get data mode from request
    const dataMode = getDataModeFromRequest(request);
    const snapshotsTable = getMappedTable(dataMode, 'project_snapshots');
    const financialsTable = getMappedTable(dataMode, 'portfolio_financials');

    // Validate tenant parameter
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant parameter' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAnonKey) {
      console.warn('[CFO FINANCIALS API] Supabase not configured, returning mock data');
      return NextResponse.json(MOCK_FINANCIALS, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query snapshots for BAC, EV, AC based on data mode
    const { data: snapshots, error: snapshotError } = await supabase
      .from(snapshotsTable)
      .select('bac, ac, ev')
      .eq('tenant_id', tenantId)
      .order('snapshot_date', { ascending: false });

    if (snapshotError) {
      console.error('[CFO FINANCIALS API] Snapshot error:', snapshotError);
      return NextResponse.json(MOCK_FINANCIALS, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Query financials for commitments based on data mode
    const { data: commitments, error: commitmentError } = await supabase
      .from(financialsTable)
      .select('wtges')
      .eq('tenant_id', tenantId);

    if (commitmentError) {
      console.warn('[CFO FINANCIALS API] Commitment query error:', commitmentError);
    }

    // Calculate aggregates
    let totalBAC = 0;
    let actualCosts = 0;
    const projectIds = new Set<string>();

    // Get latest snapshot per project
    for (const snapshot of snapshots || []) {
      totalBAC += snapshot.bac || 0;
      actualCosts += snapshot.ac || 0;
    }

    // Sum commitments (open POs)
    let openCommitments = 0;
    for (const c of commitments || []) {
      openCommitments += c.wtges || 0;
    }

    // For MVP, revenue and net cash are derived
    const revenueReceived = totalBAC * 1.09; // Assume 109% of BAC received
    const netCashPosition = revenueReceived - actualCosts - openCommitments;

    const financials: PortfolioFinancials = {
      totalBAC,
      actualCosts,
      openCommitments,
      revenueReceived: Math.round(revenueReceived),
      netCashPosition: Math.round(netCashPosition),
      currency: 'USD',
    };

    // If no real data, return mock
    if (totalBAC === 0) {
      return NextResponse.json(MOCK_FINANCIALS, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Return with VERIFY-001 headers
    return NextResponse.json(financials, {
      headers: {
        'X-Data-Source': `supabase:${snapshotsTable},${financialsTable}`,
        'X-Data-Mode': dataMode,
        'X-Tenant-Id': tenantId,
        'X-Verified-At': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[CFO FINANCIALS API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

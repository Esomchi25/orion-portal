/**
 * Project Performance API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3.2
 *
 * Returns project EVM performance metrics for gauges
 *
 * GET /api/v1/project/{projectId}/performance?tenant={tenantId}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface PerformanceMetrics {
  spi: number;
  cpi: number;
  healthScore: number;
  sv: number;
  cv: number;
  tcpi: number;
}

/**
 * Calculate health score (0-100) based on SPI and CPI
 */
function calculateHealthScore(spi: number, cpi: number): number {
  const spiScore = Math.min(100, Math.max(0, spi * 50));
  const cpiScore = Math.min(100, Math.max(0, cpi * 50));
  return Math.round((spiScore + cpiScore) / 2);
}

/**
 * Calculate TCPI (To-Complete Performance Index)
 */
function calculateTCPI(bac: number, ev: number, ac: number): number {
  const denominator = bac - ac;
  if (denominator <= 0) return 1.0;
  return (bac - ev) / denominator;
}

// Mock data for development
const MOCK_PERFORMANCE: PerformanceMetrics = {
  spi: 0.83,
  cpi: 2.40,
  healthScore: 72,
  sv: -42_500_000,
  cv: 112_500_000,
  tcpi: 0.65,
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

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant parameter' },
        { status: 400 }
      );
    }

    if (!supabaseAnonKey) {
      console.warn('[PERFORMANCE API] Supabase not configured, returning mock data');
      return NextResponse.json(MOCK_PERFORMANCE);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: snapshot, error } = await supabase
      .from('orion_evm.project_snapshots')
      .select('spi, cpi, bac, ev, ac, pv')
      .eq('tenant_id', tenantId)
      .eq('project_id', projectId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !snapshot) {
      console.warn('[PERFORMANCE API] Snapshot not found, returning mock');
      return NextResponse.json(MOCK_PERFORMANCE);
    }

    const spi = snapshot.spi || 1.0;
    const cpi = snapshot.cpi || 1.0;
    const bac = snapshot.bac || 0;
    const ev = snapshot.ev || 0;
    const ac = snapshot.ac || 0;
    const pv = snapshot.pv || 0;

    const performance: PerformanceMetrics = {
      spi,
      cpi,
      healthScore: calculateHealthScore(spi, cpi),
      sv: ev - pv,
      cv: ev - ac,
      tcpi: Math.round(calculateTCPI(bac, ev, ac) * 100) / 100,
    };

    return NextResponse.json(performance, {
      headers: {
        'X-Data-Source': 'supabase:orion_evm.project_snapshots',
        'X-Tenant-Id': tenantId,
        'X-Project-Id': projectId,
        'X-Verified-At': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[PERFORMANCE API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

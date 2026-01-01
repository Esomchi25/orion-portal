/**
 * CFO Project Comparison API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:2.3
 *
 * Returns project comparison data for portfolio table
 *
 * GET /api/v1/cfo/comparison?tenant={tenantId}
 *
 * Response:
 * {
 *   projects: ProjectComparison[]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDataModeFromRequest, getMappedTable } from '@/lib/dataMode';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type HealthStatus = 'on_track' | 'at_risk' | 'critical';

interface ProjectComparison {
  projectId: string;
  projectName: string;
  percentComplete: number;
  spi: number;
  cpi: number;
  bac: number;
  ac: number;
  ev: number;
  eac: number;
  vac: number;
  status: HealthStatus;
}

/**
 * Calculate EAC = BAC / CPI (Estimate at Completion)
 */
function calculateEAC(bac: number, cpi: number): number {
  if (cpi <= 0) return bac;
  return Math.round(bac / cpi);
}

/**
 * Calculate VAC = BAC - EAC (Variance at Completion)
 */
function calculateVAC(bac: number, eac: number): number {
  return bac - eac;
}

/**
 * Calculate health status based on SPI and CPI
 */
function getHealthStatus(spi: number, cpi: number): HealthStatus {
  if (spi >= 0.95 && cpi >= 0.95) return 'on_track';
  if (spi < 0.85 || cpi < 0.85) return 'critical';
  return 'at_risk';
}

// Mock data for development - matches OILSERV project portfolio
const MOCK_COMPARISON: ProjectComparison[] = [
  {
    projectId: '10481',
    projectName: 'AKK SEG-1 Gas Pipeline Project',
    percentComplete: 77,
    spi: 0.83,
    cpi: 2.40,
    bac: 250_000_000,
    ac: 80_000_000,
    ev: 192_500_000,
    eac: 104_166_667,
    vac: 145_833_333,
    status: 'at_risk',
  },
  {
    projectId: 'OSLNNPC',
    projectName: 'NNPC - NLNG Project',
    percentComplete: 92,
    spi: 1.05,
    cpi: 0.98,
    bac: 400_000_000,
    ac: 375_510_204,
    ev: 368_000_000,
    eac: 408_163_265,
    vac: -8_163_265,
    status: 'on_track',
  },
  {
    projectId: 'OSLSDPC',
    projectName: 'SDPC Project',
    percentComplete: 45,
    spi: 0.72,
    cpi: 0.88,
    bac: 180_000_000,
    ac: 91_800_000,
    ev: 81_000_000,
    eac: 204_545_455,
    vac: -24_545_455,
    status: 'critical',
  },
  {
    projectId: 'OSLUBET',
    projectName: 'UBET Project',
    percentComplete: 68,
    spi: 0.91,
    cpi: 0.94,
    bac: 150_000_000,
    ac: 108_510_638,
    ev: 102_000_000,
    eac: 159_574_468,
    vac: -9_574_468,
    status: 'at_risk',
  },
  {
    projectId: 'OSLOB3',
    projectName: 'OB3 Project',
    percentComplete: 85,
    spi: 0.97,
    cpi: 1.02,
    bac: 120_000_000,
    ac: 100_000_000,
    ev: 102_000_000,
    eac: 117_647_059,
    vac: 2_352_941,
    status: 'on_track',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant');

    // Get data mode from request
    const dataMode = getDataModeFromRequest(request);
    const snapshotsTable = getMappedTable(dataMode, 'project_snapshots');

    // Validate tenant parameter
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant parameter' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAnonKey) {
      console.warn('[CFO COMPARISON API] Supabase not configured, returning mock data');
      return NextResponse.json({ projects: MOCK_COMPARISON }, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query snapshots for latest EVM data based on data mode
    const { data: snapshots, error } = await supabase
      .from(snapshotsTable)
      .select(`
        project_id,
        project_name,
        percent_complete,
        spi,
        cpi,
        bac,
        ac,
        ev
      `)
      .eq('tenant_id', tenantId)
      .order('snapshot_date', { ascending: false });

    if (error) {
      console.error('[CFO COMPARISON API] Supabase error:', error);
      return NextResponse.json({ projects: MOCK_COMPARISON }, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Group by project and get latest snapshot
    const projectMap = new Map<string, ProjectComparison>();
    for (const snapshot of snapshots || []) {
      if (!projectMap.has(snapshot.project_id)) {
        const spi = snapshot.spi || 1.0;
        const cpi = snapshot.cpi || 1.0;
        const bac = snapshot.bac || 0;
        const ac = snapshot.ac || 0;
        const ev = snapshot.ev || 0;
        const eac = calculateEAC(bac, cpi);
        const vac = calculateVAC(bac, eac);

        projectMap.set(snapshot.project_id, {
          projectId: snapshot.project_id,
          projectName: snapshot.project_name || 'Unnamed Project',
          percentComplete: snapshot.percent_complete || 0,
          spi,
          cpi,
          bac,
          ac,
          ev,
          eac,
          vac,
          status: getHealthStatus(spi, cpi),
        });
      }
    }

    const projects = Array.from(projectMap.values());

    // If no real data, return mock
    if (projects.length === 0) {
      return NextResponse.json({ projects: MOCK_COMPARISON }, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Return with VERIFY-001 headers
    return NextResponse.json(
      { projects },
      {
        headers: {
          'X-Data-Source': `supabase:${snapshotsTable}`,
          'X-Data-Mode': dataMode,
          'X-Tenant-Id': tenantId,
          'X-Verified-At': new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('[CFO COMPARISON API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

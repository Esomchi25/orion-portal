/**
 * EVM Projects API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:4.1
 *
 * Returns EVM snapshots for all projects
 *
 * GET /api/v1/evm/projects?tenant={tenantId}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface EVMProjectSnapshot {
  projectId: string;
  projectName: string;
  snapshotDate: string;
  percentComplete: number;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  sv: number;
  cv: number;
  vac: number;
  spi: number;
  cpi: number;
  tcpi: number;
  eac: number;
  etc: number;
}

// Mock data for development
const MOCK_PROJECTS: EVMProjectSnapshot[] = [
  { projectId: '10481', projectName: 'AKK SEG-1 Gas Pipeline', snapshotDate: '2026-01-01', percentComplete: 77, bac: 250_000_000, pv: 235_000_000, ev: 192_500_000, ac: 80_000_000, sv: -42_500_000, cv: 112_500_000, vac: 145_833_333, spi: 0.83, cpi: 2.40, tcpi: 0.65, eac: 104_166_667, etc: 24_166_667 },
  { projectId: 'OSLNNPC', projectName: 'NNPC - NLNG Project', snapshotDate: '2026-01-01', percentComplete: 92, bac: 400_000_000, pv: 380_000_000, ev: 368_000_000, ac: 375_510_204, sv: -12_000_000, cv: -7_510_204, vac: -8_163_265, spi: 1.05, cpi: 0.98, tcpi: 1.31, eac: 408_163_265, etc: 32_653_061 },
  { projectId: 'OSLSDPC', projectName: 'SDPC Project', snapshotDate: '2026-01-01', percentComplete: 45, bac: 180_000_000, pv: 112_500_000, ev: 81_000_000, ac: 91_800_000, sv: -31_500_000, cv: -10_800_000, vac: -24_545_455, spi: 0.72, cpi: 0.88, tcpi: 1.12, eac: 204_545_455, etc: 112_745_455 },
  { projectId: 'OSLUBET', projectName: 'UBET Project', snapshotDate: '2026-01-01', percentComplete: 68, bac: 150_000_000, pv: 112_000_000, ev: 102_000_000, ac: 108_510_638, sv: -10_000_000, cv: -6_510_638, vac: -9_574_468, spi: 0.91, cpi: 0.94, tcpi: 1.16, eac: 159_574_468, etc: 51_063_830 },
  { projectId: 'OSLOB3', projectName: 'OB3 Project', snapshotDate: '2026-01-01', percentComplete: 85, bac: 120_000_000, pv: 105_000_000, ev: 102_000_000, ac: 100_000_000, sv: -3_000_000, cv: 2_000_000, vac: 2_352_941, spi: 0.97, cpi: 1.02, tcpi: 0.90, eac: 117_647_059, etc: 17_647_059 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant parameter' },
        { status: 400 }
      );
    }

    if (!supabaseAnonKey) {
      console.warn('[EVM API] Supabase not configured, returning mock data');
      return NextResponse.json({ projects: MOCK_PROJECTS });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get latest snapshot per project
    const { data: snapshots, error } = await supabase
      .from('orion_evm.project_snapshots')
      .select(`
        project_id,
        project_name,
        snapshot_date,
        percent_complete,
        bac,
        pv,
        ev,
        ac,
        spi,
        cpi
      `)
      .eq('tenant_id', tenantId)
      .order('snapshot_date', { ascending: false });

    if (error || !snapshots || snapshots.length === 0) {
      console.warn('[EVM API] Snapshots not found, returning mock');
      return NextResponse.json({ projects: MOCK_PROJECTS });
    }

    // Get latest per project
    const projectMap = new Map<string, EVMProjectSnapshot>();
    for (const s of snapshots) {
      if (!projectMap.has(s.project_id)) {
        const bac = s.bac || 0;
        const pv = s.pv || 0;
        const ev = s.ev || 0;
        const ac = s.ac || 0;
        const spi = s.spi || 1;
        const cpi = s.cpi || 1;
        const sv = ev - pv;
        const cv = ev - ac;
        const eac = cpi > 0 ? bac / cpi : bac;
        const etc = eac - ac;
        const vac = bac - eac;
        const tcpi = (bac - ac) > 0 ? (bac - ev) / (bac - ac) : 1;

        projectMap.set(s.project_id, {
          projectId: s.project_id,
          projectName: s.project_name || 'Unnamed Project',
          snapshotDate: s.snapshot_date || new Date().toISOString(),
          percentComplete: s.percent_complete || 0,
          bac,
          pv,
          ev,
          ac,
          sv,
          cv,
          vac: Math.round(vac),
          spi: Math.round(spi * 100) / 100,
          cpi: Math.round(cpi * 100) / 100,
          tcpi: Math.round(tcpi * 100) / 100,
          eac: Math.round(eac),
          etc: Math.round(etc),
        });
      }
    }

    const projects = Array.from(projectMap.values());

    return NextResponse.json(
      { projects },
      {
        headers: {
          'X-Data-Source': 'supabase:orion_evm.project_snapshots',
          'X-Tenant-Id': tenantId,
          'X-Verified-At': new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('[EVM API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

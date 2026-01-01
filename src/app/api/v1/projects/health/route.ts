/**
 * Projects Health API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:1.2
 *
 * Returns project health metrics from orion_core.projects
 *
 * GET /api/v1/projects/health?tenant={tenantId}&limit={limit}
 *
 * Response:
 * {
 *   projects: ProjectHealth[]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDataModeFromRequest, getMappedTable } from '@/lib/dataMode';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type HealthStatus = 'on_track' | 'at_risk' | 'critical';

interface ProjectHealth {
  id: string;
  name: string;
  percentComplete: number;
  spi: number;
  cpi: number;
  status: HealthStatus;
  plannedFinish: string;
  dataDate: string;
}

/**
 * Calculate health status based on SPI and CPI
 */
function getHealthStatus(spi: number, cpi: number): HealthStatus {
  if (spi >= 0.95 && cpi >= 0.95) return 'on_track';
  if (spi < 0.85 || cpi < 0.85) return 'critical';
  return 'at_risk';
}

// Mock data for development
const MOCK_PROJECTS: ProjectHealth[] = [
  {
    id: '10481',
    name: 'AKK SEG-1 Gas Pipeline Project',
    percentComplete: 77,
    spi: 0.83,
    cpi: 2.40,
    status: 'at_risk',
    plannedFinish: '2025-12-31',
    dataDate: '2026-01-01',
  },
  {
    id: 'OSLNNPC',
    name: 'NNPC - NLNG Project',
    percentComplete: 92,
    spi: 1.05,
    cpi: 0.98,
    status: 'on_track',
    plannedFinish: '2026-06-30',
    dataDate: '2026-01-01',
  },
  {
    id: 'OSLSDPC',
    name: 'SDPC Project',
    percentComplete: 45,
    spi: 0.72,
    cpi: 0.88,
    status: 'critical',
    plannedFinish: '2027-03-15',
    dataDate: '2026-01-01',
  },
  {
    id: 'OSLUBET',
    name: 'UBET Project',
    percentComplete: 68,
    spi: 0.91,
    cpi: 0.94,
    status: 'at_risk',
    plannedFinish: '2026-09-30',
    dataDate: '2026-01-01',
  },
  {
    id: 'OSLOB3',
    name: 'OB3 Project',
    percentComplete: 85,
    spi: 0.97,
    cpi: 1.02,
    status: 'on_track',
    plannedFinish: '2026-04-15',
    dataDate: '2026-01-01',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant');
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    // Get data mode from request
    const dataMode = getDataModeFromRequest(request);
    const projectsTable = getMappedTable(dataMode, 'projects');

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
      console.warn('[PROJECTS API] Supabase not configured, returning mock data');
      return NextResponse.json({
        projects: MOCK_PROJECTS.slice(0, limit),
      }, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query projects for tenant based on data mode
    const { data: projects, error } = await supabase
      .from(projectsTable)
      .select('project_id, project_name, percent_complete, spi, cpi, planned_finish_date, data_date')
      .eq('tenant_id', tenantId)
      .order('spi', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[PROJECTS API] Supabase error:', error);
      // Fallback to mock data
      return NextResponse.json({
        projects: MOCK_PROJECTS.slice(0, limit),
      }, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Transform to ProjectHealth format
    const healthProjects: ProjectHealth[] = (projects || []).map((p) => ({
      id: p.project_id,
      name: p.project_name || 'Unnamed Project',
      percentComplete: p.percent_complete || 0,
      spi: p.spi || 1.0,
      cpi: p.cpi || 1.0,
      status: getHealthStatus(p.spi || 1.0, p.cpi || 1.0),
      plannedFinish: p.planned_finish_date || new Date().toISOString(),
      dataDate: p.data_date || new Date().toISOString(),
    }));

    // Return with VERIFY-001 headers
    return NextResponse.json(
      { projects: healthProjects },
      {
        headers: {
          'X-Data-Source': `supabase:${projectsTable}`,
          'X-Data-Mode': dataMode,
          'X-Tenant-Id': tenantId,
          'X-Verified-At': new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('[PROJECTS API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

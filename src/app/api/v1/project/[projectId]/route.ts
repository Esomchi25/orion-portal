/**
 * Project Detail API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3.1
 *
 * Returns project header information
 *
 * GET /api/v1/project/{projectId}?tenant={tenantId}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDataModeFromRequest, getMappedTable } from '@/lib/dataMode';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type ProjectStatus = 'on_track' | 'at_risk' | 'critical';

interface ProjectHeader {
  projectId: string;
  projectName: string;
  projectCode: string;
  percentComplete: number;
  status: ProjectStatus;
  dataDate: string;
  plannedStart: string;
  plannedFinish: string;
  p6ProjectId: string;
  sapWbsElement: string | null;
}

function getProjectStatus(spi: number, cpi: number): ProjectStatus {
  if (spi >= 0.95 && cpi >= 0.95) return 'on_track';
  if (spi < 0.85 || cpi < 0.85) return 'critical';
  return 'at_risk';
}

// Mock data for development
const MOCK_PROJECT: ProjectHeader = {
  projectId: '10481',
  projectName: 'AKK SEG-1 Gas Pipeline Project',
  projectCode: 'AKK-SEG1',
  percentComplete: 77,
  status: 'at_risk',
  dataDate: '2026-01-01',
  plannedStart: '2023-01-15',
  plannedFinish: '2025-12-31',
  p6ProjectId: '10481',
  sapWbsElement: 'OSL-AKK-001',
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
    const projectsTable = getMappedTable(dataMode, 'projects');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant parameter' },
        { status: 400 }
      );
    }

    if (!supabaseAnonKey) {
      console.warn('[PROJECT API] Supabase not configured, returning mock data');
      return NextResponse.json(MOCK_PROJECT, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: project, error } = await supabase
      .from(projectsTable)
      .select(`
        project_id,
        project_name,
        project_code,
        percent_complete,
        spi,
        cpi,
        data_date,
        planned_start_date,
        planned_finish_date,
        p6_project_id,
        sap_wbs_element
      `)
      .eq('tenant_id', tenantId)
      .eq('project_id', projectId)
      .single();

    if (error || !project) {
      console.warn('[PROJECT API] Project not found, returning mock');
      return NextResponse.json(MOCK_PROJECT, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    const header: ProjectHeader = {
      projectId: project.project_id,
      projectName: project.project_name || 'Unnamed Project',
      projectCode: project.project_code || project.project_id,
      percentComplete: project.percent_complete || 0,
      status: getProjectStatus(project.spi || 1, project.cpi || 1),
      dataDate: project.data_date || new Date().toISOString(),
      plannedStart: project.planned_start_date || new Date().toISOString(),
      plannedFinish: project.planned_finish_date || new Date().toISOString(),
      p6ProjectId: project.p6_project_id || project.project_id,
      sapWbsElement: project.sap_wbs_element,
    };

    return NextResponse.json(header, {
      headers: {
        'X-Data-Source': `supabase:${projectsTable}`,
        'X-Data-Mode': dataMode,
        'X-Tenant-Id': tenantId,
        'X-Project-Id': projectId,
        'X-Verified-At': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[PROJECT API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

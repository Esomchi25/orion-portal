/**
 * CFO Portfolio Health API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:2.1
 *
 * Returns portfolio health aggregates from orion_core.projects
 *
 * GET /api/v1/cfo/health?tenant={tenantId}
 *
 * Response:
 * {
 *   status: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL',
 *   avgCPI: number,
 *   avgSPI: number,
 *   totalProjects: number,
 *   onTrackCount: number,
 *   atRiskCount: number,
 *   criticalCount: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDataModeFromRequest, getMappedTable } from '@/lib/dataMode';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type PortfolioHealthStatus = 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';

interface PortfolioHealth {
  status: PortfolioHealthStatus;
  avgCPI: number;
  avgSPI: number;
  totalProjects: number;
  onTrackCount: number;
  atRiskCount: number;
  criticalCount: number;
}

/**
 * Calculate portfolio-level status based on project distribution
 */
function getPortfolioStatus(onTrack: number, atRisk: number, critical: number): PortfolioHealthStatus {
  const total = onTrack + atRisk + critical;
  if (total === 0) return 'ON_TRACK';

  const criticalRatio = critical / total;
  const atRiskRatio = atRisk / total;

  if (criticalRatio >= 0.3) return 'CRITICAL';
  if (criticalRatio > 0 || atRiskRatio >= 0.4) return 'AT_RISK';
  return 'ON_TRACK';
}

/**
 * Calculate project status based on SPI and CPI
 */
function getProjectStatus(spi: number, cpi: number): 'on_track' | 'at_risk' | 'critical' {
  if (spi >= 0.95 && cpi >= 0.95) return 'on_track';
  if (spi < 0.85 || cpi < 0.85) return 'critical';
  return 'at_risk';
}

// Mock data for development
const MOCK_HEALTH: PortfolioHealth = {
  status: 'AT_RISK',
  avgCPI: 1.02,
  avgSPI: 0.76,
  totalProjects: 5,
  onTrackCount: 2,
  atRiskCount: 2,
  criticalCount: 1,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant');

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
      console.warn('[CFO HEALTH API] Supabase not configured, returning mock data');
      return NextResponse.json(MOCK_HEALTH, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query projects based on data mode
    const { data: projects, error } = await supabase
      .from(projectsTable)
      .select('project_id, spi, cpi')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[CFO HEALTH API] Supabase error:', error);
      return NextResponse.json(MOCK_HEALTH, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Calculate aggregates
    const projectList = projects || [];
    let totalSPI = 0;
    let totalCPI = 0;
    let onTrackCount = 0;
    let atRiskCount = 0;
    let criticalCount = 0;

    for (const project of projectList) {
      const spi = project.spi || 1.0;
      const cpi = project.cpi || 1.0;
      totalSPI += spi;
      totalCPI += cpi;

      const status = getProjectStatus(spi, cpi);
      if (status === 'on_track') onTrackCount++;
      else if (status === 'at_risk') atRiskCount++;
      else criticalCount++;
    }

    const totalProjects = projectList.length;
    const avgSPI = totalProjects > 0 ? totalSPI / totalProjects : 1.0;
    const avgCPI = totalProjects > 0 ? totalCPI / totalProjects : 1.0;

    const health: PortfolioHealth = {
      status: getPortfolioStatus(onTrackCount, atRiskCount, criticalCount),
      avgCPI: Math.round(avgCPI * 100) / 100,
      avgSPI: Math.round(avgSPI * 100) / 100,
      totalProjects,
      onTrackCount,
      atRiskCount,
      criticalCount,
    };

    // Return with VERIFY-001 headers
    return NextResponse.json(health, {
      headers: {
        'X-Data-Source': `supabase:${projectsTable}`,
        'X-Data-Mode': dataMode,
        'X-Tenant-Id': tenantId,
        'X-Verified-At': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[CFO HEALTH API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Portfolio Summary API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:1.1
 *
 * Returns aggregated portfolio metrics from orion_core.projects (live) or client_demo.projects (mock)
 *
 * GET /api/v1/portfolio/summary?tenant={tenantId}&dataMode={mock|live}
 *
 * Response:
 * {
 *   totalProjects: number,
 *   onTrack: number,
 *   atRisk: number,
 *   critical: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDataModeFromRequest, getMappedTable } from '@/lib/dataMode';

// Supabase client - use env vars in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface PortfolioSummary {
  totalProjects: number;
  onTrack: number;
  atRisk: number;
  critical: number;
}

/**
 * Calculate health status based on SPI and CPI
 * - On Track: SPI >= 0.95 AND CPI >= 0.95
 * - At Risk: 0.85 <= (SPI or CPI) < 0.95
 * - Critical: SPI < 0.85 OR CPI < 0.85
 */
function getHealthStatus(spi: number, cpi: number): 'on_track' | 'at_risk' | 'critical' {
  if (spi >= 0.95 && cpi >= 0.95) return 'on_track';
  if (spi < 0.85 || cpi < 0.85) return 'critical';
  return 'at_risk';
}

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
      // Return mock data for development/testing
      console.warn('[PORTFOLIO API] Supabase not configured, returning mock data');
      const mockData: PortfolioSummary = {
        totalProjects: 5,
        onTrack: 2,
        atRisk: 2,
        critical: 1,
      };
      return NextResponse.json(mockData, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query projects table based on data mode
    // Mock: client_demo.projects | Live: orion_core.projects
    const { data: projects, error } = await supabase
      .from(projectsTable)
      .select('project_id, health_status')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[PORTFOLIO API] Supabase error:', error);
      // Fallback to mock data on error
      const mockData: PortfolioSummary = {
        totalProjects: 5,
        onTrack: 2,
        atRisk: 2,
        critical: 1,
      };
      return NextResponse.json(mockData, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Calculate portfolio summary from health_status field
    const summary: PortfolioSummary = {
      totalProjects: projects?.length || 0,
      onTrack: 0,
      atRisk: 0,
      critical: 0,
    };

    if (projects) {
      for (const project of projects) {
        const status = project.health_status || 'on_track';
        if (status === 'on_track') summary.onTrack++;
        else if (status === 'at_risk') summary.atRisk++;
        else if (status === 'critical') summary.critical++;
      }
    }

    // Return with VERIFY-001 headers
    return NextResponse.json(summary, {
      headers: {
        'X-Data-Source': `supabase:${projectsTable}`,
        'X-Data-Mode': dataMode,
        'X-Tenant-Id': tenantId,
        'X-Verified-At': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[PORTFOLIO API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

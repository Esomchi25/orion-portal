/**
 * Project Schedule API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3.5
 *
 * Returns P6 schedule intelligence (activities, WBS, critical path)
 *
 * GET /api/v1/project/{projectId}/schedule?tenant={tenantId}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDataModeFromRequest, getMappedTable } from '@/lib/dataMode';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface ScheduleIntelligence {
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  notStartedActivities: number;
  criticalPathActivities: number;
  wbsElements: number;
  originalDuration: number;
  remainingDuration: number;
  totalFloat: number;
}

// Mock data for development
const MOCK_SCHEDULE: ScheduleIntelligence = {
  totalActivities: 3544,
  completedActivities: 2744,
  inProgressActivities: 234,
  notStartedActivities: 566,
  criticalPathActivities: 127,
  wbsElements: 553,
  originalDuration: 1080,
  remainingDuration: 365,
  totalFloat: 45,
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
    const activitiesTable = getMappedTable(dataMode, 'activities');
    const wbsTable = getMappedTable(dataMode, 'wbs');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant parameter' },
        { status: 400 }
      );
    }

    if (!supabaseAnonKey) {
      console.warn('[SCHEDULE API] Supabase not configured, returning mock data');
      return NextResponse.json(MOCK_SCHEDULE, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query activity counts based on data mode
    const { data: activities, error: actError } = await supabase
      .from(activitiesTable)
      .select('status, is_critical, total_float')
      .eq('tenant_id', tenantId)
      .eq('project_id', projectId);

    // Query WBS count based on data mode
    const { count: wbsCount, error: wbsError } = await supabase
      .from(wbsTable)
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('project_id', projectId);

    if (actError || !activities) {
      console.warn('[SCHEDULE API] Activities not found, returning mock');
      return NextResponse.json(MOCK_SCHEDULE, {
        headers: { 'X-Data-Source': 'mock', 'X-Data-Mode': dataMode },
      });
    }

    // Calculate activity statistics
    const totalActivities = activities.length;
    const completedActivities = activities.filter((a) => a.status === 'completed').length;
    const inProgressActivities = activities.filter((a) => a.status === 'in_progress').length;
    const notStartedActivities = activities.filter((a) => a.status === 'not_started').length;
    const criticalPathActivities = activities.filter((a) => a.is_critical).length;
    const totalFloat = Math.round(
      activities.reduce((sum, a) => sum + (a.total_float || 0), 0) / totalActivities
    );

    const schedule: ScheduleIntelligence = {
      totalActivities,
      completedActivities,
      inProgressActivities,
      notStartedActivities,
      criticalPathActivities,
      wbsElements: wbsCount || 0,
      originalDuration: 1080, // Would come from project dates
      remainingDuration: 365, // Would be calculated from data date
      totalFloat,
    };

    return NextResponse.json(schedule, {
      headers: {
        'X-Data-Source': `supabase:${activitiesTable},${wbsTable}`,
        'X-Data-Mode': dataMode,
        'X-Tenant-Id': tenantId,
        'X-Project-Id': projectId,
        'X-Verified-At': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[SCHEDULE API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

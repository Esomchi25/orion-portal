/**
 * Data Mode API Route
 * @governance DOC-002, VERIFY-001
 *
 * Get/Set data mode preference (mock/live) for a tenant/user
 *
 * GET /api/v1/data-mode?tenant={tenantId}&user={userId}
 * POST /api/v1/data-mode - body: { tenant, user, mode }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant');
    const userId = searchParams.get('user');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant parameter' },
        { status: 400 }
      );
    }

    if (!supabaseAnonKey) {
      // Default to mock if no Supabase configured
      return NextResponse.json({ mode: 'mock' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('client_demo.data_mode_preferences')
      .select('data_mode')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId || 'default')
      .single();

    if (error || !data) {
      // Default to mock if no preference found
      return NextResponse.json({ mode: 'mock' });
    }

    return NextResponse.json(
      { mode: data.data_mode },
      {
        headers: {
          'X-Data-Source': 'supabase:client_demo.data_mode_preferences',
          'X-Verified-At': new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('[DATA-MODE API] Error:', error);
    return NextResponse.json({ mode: 'mock' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant, user, mode } = body;

    if (!tenant || !mode) {
      return NextResponse.json(
        { error: 'Missing tenant or mode' },
        { status: 400 }
      );
    }

    if (mode !== 'mock' && mode !== 'live') {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "mock" or "live"' },
        { status: 400 }
      );
    }

    if (!supabaseAnonKey) {
      // Can't persist without Supabase
      return NextResponse.json({ success: true, mode });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('client_demo.data_mode_preferences')
      .upsert(
        {
          tenant_id: tenant,
          user_id: user || 'default',
          data_mode: mode,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'tenant_id,user_id',
        }
      );

    if (error) {
      console.error('[DATA-MODE API] Upsert error:', error);
      return NextResponse.json(
        { error: 'Failed to save preference' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, mode },
      {
        headers: {
          'X-Data-Source': 'supabase:client_demo.data_mode_preferences',
          'X-Verified-At': new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('[DATA-MODE API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

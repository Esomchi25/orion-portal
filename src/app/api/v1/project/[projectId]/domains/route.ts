/**
 * Project Domain Progress API Route
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3.3
 *
 * Returns EPCIC domain breakdown
 *
 * GET /api/v1/project/{projectId}/domains?tenant={tenantId}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type DomainType = 'engineering' | 'procurement' | 'construction' | 'installation' | 'commissioning';

interface DomainProgress {
  domain: DomainType;
  label: string;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  percentComplete: number;
  spi: number;
  cpi: number;
}

const DOMAIN_LABELS: Record<DomainType, string> = {
  engineering: 'Engineering',
  procurement: 'Procurement',
  construction: 'Construction',
  installation: 'Installation',
  commissioning: 'Commissioning',
};

// Mock data for development
const MOCK_DOMAINS: DomainProgress[] = [
  { domain: 'engineering', label: 'Engineering', plannedValue: 50_000_000, earnedValue: 48_000_000, actualCost: 45_000_000, percentComplete: 96, spi: 0.96, cpi: 1.07 },
  { domain: 'procurement', label: 'Procurement', plannedValue: 80_000_000, earnedValue: 72_000_000, actualCost: 68_000_000, percentComplete: 90, spi: 0.90, cpi: 1.06 },
  { domain: 'construction', label: 'Construction', plannedValue: 100_000_000, earnedValue: 65_000_000, actualCost: 55_000_000, percentComplete: 65, spi: 0.65, cpi: 1.18 },
  { domain: 'installation', label: 'Installation', plannedValue: 15_000_000, earnedValue: 7_500_000, actualCost: 6_500_000, percentComplete: 50, spi: 0.50, cpi: 1.15 },
  { domain: 'commissioning', label: 'Commissioning', plannedValue: 5_000_000, earnedValue: 0, actualCost: 0, percentComplete: 0, spi: 0, cpi: 0 },
];

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
      console.warn('[DOMAINS API] Supabase not configured, returning mock data');
      return NextResponse.json({ domains: MOCK_DOMAINS });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: wbsMetrics, error } = await supabase
      .from('orion_evm.wbs_metrics')
      .select('epc_code, pv, ev, ac')
      .eq('tenant_id', tenantId)
      .eq('project_id', projectId);

    if (error || !wbsMetrics || wbsMetrics.length === 0) {
      console.warn('[DOMAINS API] Metrics not found, returning mock');
      return NextResponse.json({ domains: MOCK_DOMAINS });
    }

    const domainMap = new Map<DomainType, { pv: number; ev: number; ac: number }>();

    for (const wbs of wbsMetrics) {
      const epcCode = (wbs.epc_code || 'C').charAt(0).toUpperCase();
      let domain: DomainType;

      switch (epcCode) {
        case 'E': domain = 'engineering'; break;
        case 'P': domain = 'procurement'; break;
        case 'C': domain = 'construction'; break;
        case 'I': domain = 'installation'; break;
        case 'M': domain = 'commissioning'; break;
        default: domain = 'construction';
      }

      const current = domainMap.get(domain) || { pv: 0, ev: 0, ac: 0 };
      current.pv += wbs.pv || 0;
      current.ev += wbs.ev || 0;
      current.ac += wbs.ac || 0;
      domainMap.set(domain, current);
    }

    const domains: DomainProgress[] = [];
    for (const [domain, values] of domainMap.entries()) {
      const pv = values.pv;
      const ev = values.ev;
      const ac = values.ac;
      const spi = pv > 0 ? ev / pv : 0;
      const cpi = ac > 0 ? ev / ac : 0;
      const percentComplete = pv > 0 ? Math.round((ev / pv) * 100) : 0;

      domains.push({
        domain,
        label: DOMAIN_LABELS[domain],
        plannedValue: pv,
        earnedValue: ev,
        actualCost: ac,
        percentComplete,
        spi: Math.round(spi * 100) / 100,
        cpi: Math.round(cpi * 100) / 100,
      });
    }

    const order: DomainType[] = ['engineering', 'procurement', 'construction', 'installation', 'commissioning'];
    domains.sort((a, b) => order.indexOf(a.domain) - order.indexOf(b.domain));

    return NextResponse.json(
      { domains },
      {
        headers: {
          'X-Data-Source': 'supabase:orion_evm.wbs_metrics',
          'X-Tenant-Id': tenantId,
          'X-Project-Id': projectId,
          'X-Verified-At': new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('[DOMAINS API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

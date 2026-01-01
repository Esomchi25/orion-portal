/**
 * CFO Insights Page
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:2
 *
 * Executive CFO dashboard for portfolio financial oversight.
 * Route: /cfo
 */

import { CFODashboard } from '@/components/cfo/CFODashboard';

// Default tenant for development - in production this comes from auth context
const DEFAULT_TENANT = 'oilserv-tenant-001';

export const metadata = {
  title: 'CFO Insights | ORION PMS',
  description: 'Executive financial dashboard with portfolio health metrics and SAP integration',
};

export default function CFOPage() {
  return <CFODashboard tenantId={DEFAULT_TENANT} />;
}

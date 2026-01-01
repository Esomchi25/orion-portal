/**
 * Portfolio Overview Page (Dashboard Home)
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:1
 *
 * Main dashboard showing portfolio summary, project health, and sync status.
 * Route: /
 */

import { Dashboard } from '@/components/dashboard/Dashboard';

// Default tenant for development - in production this comes from auth context
const DEFAULT_TENANT = 'oilserv-tenant-001';

export const metadata = {
  title: 'Portfolio Overview | ORION PMS',
  description: 'Portfolio management dashboard with project health monitoring and sync status',
};

export default function DashboardPage() {
  return <Dashboard tenantId={DEFAULT_TENANT} />;
}

/**
 * Project Dashboard Page
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3
 *
 * Detailed project view with CPI/SPI, domain progress, and budget analytics.
 * Route: /project or /project?id={projectId}
 */

import { ProjectDashboard } from '@/components/project/ProjectDashboard';

// Default project and tenant for development
const DEFAULT_PROJECT = '10481';
const DEFAULT_TENANT = 'oilserv-tenant-001';

export const metadata = {
  title: 'Project Dashboard | ORION PMS',
  description: 'Detailed project view with EVM metrics, domain progress, and schedule intelligence',
};

export default async function ProjectPage(props: {
  searchParams: Promise<{ id?: string }>;
}) {
  const searchParams = await props.searchParams;
  const projectId = searchParams.id || DEFAULT_PROJECT;

  return <ProjectDashboard projectId={projectId} tenantId={DEFAULT_TENANT} />;
}

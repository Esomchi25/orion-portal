/**
 * EVM Analysis Page
 * @governance DOC-002, VERIFY-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:4
 *
 * Earned Value Management analysis and reference.
 * Route: /project/evm or /project/evm?project={projectId}
 */

import { EVMModule } from '@/components/evm/EVMModule';

// Default tenant for development
const DEFAULT_TENANT = 'oilserv-tenant-001';

export const metadata = {
  title: 'EVM Analysis | ORION PMS',
  description: 'Earned Value Management metrics and portfolio performance analysis',
};

export default async function EVMPage(props: {
  searchParams: Promise<{ project?: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <EVMModule
      tenantId={DEFAULT_TENANT}
      projectId={searchParams.project}
    />
  );
}

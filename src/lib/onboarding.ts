/**
 * ORION PMS Onboarding API Client
 * @governance DATA-001, DOC-002
 *
 * Handles onboarding wizard API calls to the Railway backend.
 * Supports both production (Railway) and development (localhost) backends.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// =============================================================================
// TYPES
// =============================================================================

export interface P6TestRequest {
  base_url: string;
  username: string;
  password: string;
  timeout?: number;
}

export interface SAPTestRequest {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
  latency_ms?: number;
  details?: Record<string, unknown>;
}

export interface ProjectListItem {
  object_id: number;
  id: string;
  name: string;
  status: string;
  start_date?: string;
  finish_date?: string;
}

export interface OnboardingCompleteRequest {
  tenant_name: string;
  p6_configured: boolean;
  sap_configured: boolean;
  projects_selected: number[];
}

export interface OnboardingCompleteResponse {
  success: boolean;
  tenant_id: string;
  message: string;
  next_steps: string[];
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Test P6 SOAP API connection
 */
export async function testP6Connection(
  request: P6TestRequest
): Promise<ConnectionTestResponse> {
  const response = await fetch(`${API_BASE}/api/v1/onboarding/p6/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

/**
 * Test SAP HANA connection
 */
export async function testSAPConnection(
  request: SAPTestRequest
): Promise<ConnectionTestResponse> {
  const response = await fetch(`${API_BASE}/api/v1/onboarding/sap/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

/**
 * List available P6 projects
 */
export async function listP6Projects(
  filter?: string
): Promise<ProjectListItem[]> {
  const params = filter ? `?filter=${encodeURIComponent(filter)}` : '';
  const response = await fetch(
    `${API_BASE}/api/v1/onboarding/projects${params}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

/**
 * Complete the onboarding process
 */
export async function completeOnboarding(
  request: OnboardingCompleteRequest
): Promise<OnboardingCompleteResponse> {
  const response = await fetch(`${API_BASE}/api/v1/onboarding/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  status: string;
  last_sync: string | null;
  next_sync: string | null;
  p6_connected: boolean;
  sap_connected: boolean;
  projects_synced: number;
  errors: string[];
}> {
  const response = await fetch(`${API_BASE}/api/v1/sync/status`);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<{
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  services: Record<string, string>;
}> {
  const response = await fetch(`${API_BASE}/health`);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

// =============================================================================
// EXPORT
// =============================================================================

export const onboardingApi = {
  testP6Connection,
  testSAPConnection,
  listP6Projects,
  completeOnboarding,
  getSyncStatus,
  checkHealth,
};

export default onboardingApi;

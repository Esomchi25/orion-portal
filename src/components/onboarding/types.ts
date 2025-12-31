/**
 * Onboarding Component Types (DATA HOLDERS)
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10
 *
 * These interfaces define the data shape for all onboarding components.
 * Auto-synced to documentation via sync_component_docs.py hook.
 */

// ============================================================================
// STEP 1: WELCOME SCREEN
// ============================================================================

/**
 * User profile from authentication provider (Clerk)
 * @component WelcomeScreen
 * @schema orion_xconf.onboarding_progress
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  organizationName: string | null;
}

/**
 * Welcome screen props
 * @component WelcomeScreen
 */
export interface WelcomeScreenProps {
  user: UserProfile;
  onGetStarted: () => void;
  isLoading?: boolean;
}

/**
 * Welcome screen state
 * @component WelcomeScreen
 */
export interface WelcomeScreenState {
  hasReadIntro: boolean;
  isAnimating: boolean;
}

// ============================================================================
// STEP 2: P6 CONNECTION
// ============================================================================

/**
 * P6 Connection form state
 * @component P6ConnectionForm
 * @schema orion_xconf.client_config
 */
export interface P6ConnectionState {
  wsdlBaseUrl: string;
  databaseInstance: string;
  username: string;
  password: string;
  isTesting: boolean;
  testResult: P6TestResult | null;
  validationErrors: Record<string, string | undefined>;
}

/**
 * P6 Connection test result
 * @component P6ConnectionForm
 * @api POST /api/v1/onboarding/p6/test
 */
export interface P6TestResult {
  success: boolean;
  message: string;
  projectCount?: number;
  databaseVersion?: string;
  latencyMs?: number;
}

/**
 * P6 Connection config for onNext callback
 * @component P6ConnectionForm
 */
export interface P6ConnectionConfig {
  wsdlBaseUrl: string;
  databaseInstance: string;
  username: string;
  password: string;
}

/**
 * P6 Connection form props
 * @component P6ConnectionForm
 */
export interface P6ConnectionFormProps {
  onNext: (config: P6ConnectionConfig) => void;
  onBack: () => void;
  initialState?: Partial<P6ConnectionState>;
}

// ============================================================================
// STEP 3: SAP CONNECTION
// ============================================================================

/**
 * SAP Connection form state
 * @component SAPConnectionForm
 * @schema orion_xconf.client_config
 */
export interface SAPConnectionState {
  hostUrl: string;
  port: number;
  client: string;
  systemId: string;
  username: string;
  password: string;
  useHana: boolean;
  hanaPort?: number;
  isTesting: boolean;
  testResult: SAPTestResult | null;
  validationErrors: Record<string, string | undefined>;
}

/**
 * SAP Connection test result
 * @component SAPConnectionForm
 * @api POST /api/v1/onboarding/sap/test
 */
export interface SAPTestResult {
  success: boolean;
  message: string;
  systemVersion?: string;
  latencyMs?: number;
  tableCount?: number;
  connectionType?: string;
}

/**
 * SAP Connection config for onNext callback
 * @component SAPConnectionForm
 */
export interface SAPConnectionConfig {
  hostUrl: string;
  port: number;
  client: string;
  systemId: string;
  username: string;
  password: string;
  useHana: boolean;
}

/**
 * SAP Connection form props
 * @component SAPConnectionForm
 */
export interface SAPConnectionFormProps {
  onNext: (config: SAPConnectionConfig) => void;
  onBack: () => void;
  onSkip: () => void;
  initialState?: Partial<SAPConnectionState>;
}

// ============================================================================
// STEP 4: PROJECT SELECTION
// ============================================================================

/**
 * P6 Project for selection
 * @component ProjectSelection
 * @schema p6_raw.projects
 */
export interface P6Project {
  projectId: number;
  projectCode: string;
  projectName: string;
  description?: string;
  startDate?: string;
  finishDate?: string;
  status?: string;
  percentComplete?: number;
}

/**
 * Project selection state
 * @component ProjectSelection
 * @schema orion_xconf.tenant_projects
 */
export interface ProjectSelectionState {
  projects: P6Project[];
  selectedProjectIds: number[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

/**
 * Selected projects data for onNext callback
 * @component ProjectSelection
 */
export interface SelectedProjectsData {
  selectedProjects: Array<{
    id: number;
    name: string;
    code: string;
  }>;
}

/**
 * Project selection props
 * @component ProjectSelection
 */
export interface ProjectSelectionProps {
  onNext: (data: SelectedProjectsData) => void;
  onBack: () => void;
  p6Config: P6ConnectionConfig;
}

// ============================================================================
// STEP 5: COMPLETION
// ============================================================================

/**
 * Sync progress state
 * @component OnboardingComplete
 * @schema orion_xconf.onboarding_progress
 */
export interface SyncProgress {
  projectsTotal: number;
  projectsSynced: number;
  activitiesTotal: number;
  activitiesSynced: number;
  status: 'pending' | 'syncing' | 'complete' | 'error';
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Selected project for completion summary
 * @component OnboardingComplete
 */
export interface SelectedProject {
  id: number;
  name: string;
  code: string;
}

/**
 * P6 Configuration summary
 * @component OnboardingComplete
 */
export interface P6ConfigSummary {
  wsdlBaseUrl: string;
  databaseInstance: string;
  username: string;
}

/**
 * SAP Configuration summary
 * @component OnboardingComplete
 */
export interface SAPConfigSummary {
  hostUrl: string;
  port: number;
  client: string;
  systemId: string;
  username: string;
  useHana: boolean;
}

/**
 * Completion screen props
 * @component OnboardingComplete
 */
export interface OnboardingCompleteProps {
  selectedProjects: SelectedProject[];
  p6Config: P6ConfigSummary;
  sapConfig: SAPConfigSummary | null;
  onComplete: () => void;
  onBack: () => void;
}

// ============================================================================
// SHARED TYPES
// ============================================================================

/**
 * Onboarding step definition
 */
export interface OnboardingStep {
  id: number;
  name: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
  isSkipped?: boolean;
}

/**
 * Overall onboarding progress
 * @schema orion_xconf.onboarding_progress
 */
export interface OnboardingProgress {
  tenantId: string;
  currentStep: 1 | 2 | 3 | 4 | 5;
  completedSteps: number[];
  p6Configured: boolean;
  p6TestPassed: boolean;
  sapConfigured: boolean;
  sapSkipped: boolean;
  selectedProjectIds: number[];
  completedAt?: string;
}

/**
 * Onboarding wizard context
 */
export interface OnboardingContextType {
  progress: OnboardingProgress;
  setProgress: (progress: OnboardingProgress) => void;
  goToStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  completeStep: (step: number) => void;
  isLoading: boolean;
}

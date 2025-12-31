/**
 * Onboarding Components Index
 * @governance COMPONENT-001
 *
 * Export all onboarding components and types.
 */

// Step 1: Welcome
export { WelcomeScreen } from './WelcomeScreen';

// Step 2: P6 Connection
export { P6ConnectionForm } from './P6ConnectionForm';

// Step 3: SAP Connection
export { SAPConnectionForm } from './SAPConnectionForm';

// Step 4: Project Selection
export { ProjectSelection } from './ProjectSelection';

// Step 5: Onboarding Complete
export { OnboardingComplete } from './OnboardingComplete';

// Types
export type {
  // Step 1
  UserProfile,
  WelcomeScreenProps,
  WelcomeScreenState,
  // Step 2
  P6ConnectionState,
  P6TestResult,
  P6ConnectionFormProps,
  // Step 3
  SAPConnectionState,
  SAPTestResult,
  SAPConnectionFormProps,
  // Step 4
  P6Project,
  ProjectSelectionState,
  ProjectSelectionProps,
  // Step 5
  SyncProgress,
  OnboardingCompleteProps,
  // Shared
  OnboardingStep,
  OnboardingProgress,
  OnboardingContextType,
} from './types';

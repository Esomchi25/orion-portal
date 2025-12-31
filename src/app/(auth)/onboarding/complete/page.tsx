/**
 * Onboarding Page - Step 5: Complete
 * @governance COMPONENT-001, DOC-002
 */

'use client';

export const dynamic = 'force-dynamic';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingComplete } from '@/components/onboarding';
import type {
  SelectedProject,
  P6ConfigSummary,
  SAPConfigSummary
} from '@/components/onboarding';

// Mock data for development (should come from context/state)
const MOCK_SELECTED_PROJECTS: SelectedProject[] = [
  { id: 1, name: 'LNG Terminal Expansion Phase 2', code: 'LNG-EXP-002' },
  { id: 3, name: 'Pipeline Integrity Assessment', code: 'PIA-NW-001' },
];

const MOCK_P6_CONFIG: P6ConfigSummary = {
  wsdlBaseUrl: 'https://p6.example.com/p6ws/services',
  databaseInstance: 'PROD',
  username: 'api_user',
};

const MOCK_SAP_CONFIG: SAPConfigSummary = {
  hostUrl: 'sap.example.com',
  port: 8443,
  client: '100',
  systemId: 'PRD',
  username: 'sap_user',
  useHana: true,
};

export default function OnboardingCompletePage() {
  const router = useRouter();

  const handleComplete = useCallback(() => {
    // TODO: Trigger initial sync and navigate to dashboard
    console.log('Onboarding complete!');
    router.push('/');
  }, [router]);

  const handleBack = useCallback(() => {
    router.push('/onboarding/projects');
  }, [router]);

  return (
    <OnboardingComplete
      selectedProjects={MOCK_SELECTED_PROJECTS}
      p6Config={MOCK_P6_CONFIG}
      sapConfig={MOCK_SAP_CONFIG}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}

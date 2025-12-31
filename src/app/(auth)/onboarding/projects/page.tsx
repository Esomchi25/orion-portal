/**
 * Onboarding Page - Step 4: Project Selection
 * @governance COMPONENT-001, DOC-002
 */

'use client';

export const dynamic = 'force-dynamic';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectSelection } from '@/components/onboarding';
import type { SelectedProjectsData, P6ConnectionConfig } from '@/components/onboarding';

// Mock P6 config for development (should come from context/state)
const MOCK_P6_CONFIG: P6ConnectionConfig = {
  wsdlBaseUrl: 'https://p6.example.com/p6ws/services',
  databaseInstance: 'PROD',
  username: 'api_user',
  password: '********',
};

export default function ProjectSelectionPage() {
  const router = useRouter();

  const handleNext = useCallback((data: SelectedProjectsData) => {
    // TODO: Save selected projects to context/state
    console.log('Selected Projects:', data);
    router.push('/onboarding/complete');
  }, [router]);

  const handleBack = useCallback(() => {
    router.push('/onboarding/sap');
  }, [router]);

  return (
    <ProjectSelection
      onNext={handleNext}
      onBack={handleBack}
      p6Config={MOCK_P6_CONFIG}
    />
  );
}

/**
 * Onboarding Page - Step 3: SAP Connection
 * @governance COMPONENT-001, DOC-002
 */

'use client';

export const dynamic = 'force-dynamic';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SAPConnectionForm } from '@/components/onboarding';
import type { SAPConnectionConfig } from '@/components/onboarding';

export default function SAPConnectionPage() {
  const router = useRouter();

  const handleNext = useCallback((config: SAPConnectionConfig) => {
    // TODO: Save SAP connection config to context/state
    console.log('SAP Connection Config:', config);
    router.push('/onboarding/projects');
  }, [router]);

  const handleBack = useCallback(() => {
    router.push('/onboarding/p6');
  }, [router]);

  const handleSkip = useCallback(() => {
    // SAP is optional, skip to project selection
    router.push('/onboarding/projects');
  }, [router]);

  return (
    <SAPConnectionForm
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    />
  );
}

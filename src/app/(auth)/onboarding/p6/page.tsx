/**
 * Onboarding Page - Step 2: P6 Connection
 * @governance COMPONENT-001, DOC-002
 */

'use client';

export const dynamic = 'force-dynamic';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { P6ConnectionForm } from '@/components/onboarding';
import type { P6ConnectionConfig } from '@/components/onboarding';

export default function P6ConnectionPage() {
  const router = useRouter();

  const handleNext = useCallback((config: P6ConnectionConfig) => {
    // TODO: Save P6 connection config to context/state
    console.log('P6 Connection Config:', config);
    router.push('/onboarding/sap');
  }, [router]);

  const handleBack = useCallback(() => {
    router.push('/onboarding');
  }, [router]);

  return (
    <P6ConnectionForm
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}

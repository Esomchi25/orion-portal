/**
 * Onboarding Page - Step 1: Welcome
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.1
 *
 * Entry point for the onboarding wizard.
 * Displays the WelcomeScreen component.
 */

'use client';

// Force dynamic rendering to skip static generation (Clerk needs runtime env vars)
export const dynamic = 'force-dynamic';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeScreen } from '@/components/onboarding';
import type { UserProfile } from '@/components/onboarding';

// Mock user for development - will be replaced with Clerk
const MOCK_USER: UserProfile = {
  id: 'user_dev_123',
  email: 'dev@orion-demo.com',
  firstName: 'Demo',
  lastName: 'User',
  imageUrl: null,
  organizationName: 'ORION Demo Organization',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = useCallback(async () => {
    setIsLoading(true);

    try {
      // TODO: Initialize onboarding progress in database
      // await fetch('/api/v1/onboarding/start', { method: 'POST' });

      // Navigate to P6 connection step
      router.push('/onboarding/p6');
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      setIsLoading(false);
    }
  }, [router]);

  return (
    <WelcomeScreen
      user={MOCK_USER}
      onGetStarted={handleGetStarted}
      isLoading={isLoading}
    />
  );
}

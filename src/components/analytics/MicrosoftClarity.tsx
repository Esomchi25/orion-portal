/**
 * Microsoft Clarity Integration
 * @governance UX-001 (RUM-001)
 *
 * Session replay and behavioral analytics for detecting:
 * - Rage clicks (repeated clicking indicating frustration)
 * - Dead clicks (clicking non-interactive elements)
 * - User journey pain points
 *
 * Configuration:
 * Set NEXT_PUBLIC_CLARITY_PROJECT_ID in .env.local
 * Get your project ID from: https://clarity.microsoft.com/
 *
 * @see https://clarity.microsoft.com/
 */
'use client';

import Script from 'next/script';

interface MicrosoftClarityProps {
  projectId?: string;
}

/**
 * Microsoft Clarity script component.
 * Automatically loads the Clarity tracking script in production.
 *
 * Features tracked:
 * - Session recordings
 * - Heatmaps (click, scroll, movement)
 * - Rage clicks detection
 * - Dead clicks detection
 * - Scroll depth
 * - JavaScript errors
 *
 * Privacy:
 * - Masks sensitive content by default
 * - No PII collection
 * - GDPR/CCPA compliant
 */
export function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
  const clarityId = projectId || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  // Only load in production or if explicitly enabled
  if (!clarityId || process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
    >
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `}
    </Script>
  );
}

// Extend Window interface for Clarity
declare global {
  interface Window {
    clarity?: (action: string, ...args: unknown[]) => void;
  }
}

/**
 * Clarity custom event tracking.
 * Use this to track specific user actions for analysis.
 *
 * @example
 * trackClarityEvent('onboarding_step_completed', { step: 'p6_connection' });
 */
export function trackClarityEvent(eventName: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName);

    // Also set custom tags for filtering
    if (properties) {
      Object.entries(properties).forEach(([key, value]) => {
        window.clarity?.('set', key, String(value));
      });
    }
  }
}

/**
 * Identify a user in Clarity for cross-session tracking.
 * Call this after successful authentication.
 *
 * @example
 * identifyClarityUser('user-123', 'admin');
 */
export function identifyClarityUser(userId: string, userRole?: string) {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('identify', userId);

    if (userRole) {
      window.clarity('set', 'user_role', userRole);
    }
  }
}

/**
 * Set a custom tag for session filtering.
 *
 * @example
 * setClarityTag('tenant', 'acme-corp');
 * setClarityTag('project', 'mega-construction');
 */
export function setClarityTag(key: string, value: string) {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('set', key, value);
  }
}

export default MicrosoftClarity;

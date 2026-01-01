/**
 * Lighthouse CI Configuration
 * @governance UX-001 (PERF-001)
 *
 * Performance budgets that block PR merges if violated.
 * Core Web Vitals thresholds aligned with Google's "Good" ratings.
 */

module.exports = {
  ci: {
    collect: {
      // Pages to audit
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/onboarding',
        'http://localhost:3000/onboarding/p6',
        'http://localhost:3000/onboarding/sap',
        'http://localhost:3000/onboarding/projects',
        'http://localhost:3000/onboarding/complete',
        'http://localhost:3000/cfo',
        'http://localhost:3000/project',
      ],
      numberOfRuns: 3, // Average of 3 runs for consistency
      settings: {
        preset: 'desktop',
        throttlingMethod: 'devtools',
      },
    },
    assert: {
      assertions: {
        // Overall scores (0-1 scale)
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Core Web Vitals (BLOCKER thresholds)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],     // < 2.5s
        'interactive': ['error', { maxNumericValue: 3500 }],                   // TTI < 3.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],       // CLS < 0.1
        'total-blocking-time': ['error', { maxNumericValue: 300 }],           // TBT < 300ms
        'speed-index': ['warn', { maxNumericValue: 3000 }],                   // SI < 3s

        // Resource budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // JS < 500KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }], // Images < 1MB
        'resource-summary:total:size': ['warn', { maxNumericValue: 2000000 }], // Total < 2MB

        // Accessibility specifics
        'color-contrast': ['error', { minScore: 1 }],
        'button-name': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage', // For CI/CD artifact storage
    },
  },
};

/**
 * Storybook Configuration
 * @governance UX-001, COMPONENT-001
 * @design-system ORION Command Center
 *
 * Component documentation and visual testing environment.
 * Integrates with Chromatic for visual regression testing.
 */
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',  // Visual regression testing
    '@storybook/addon-a11y',     // Accessibility testing (UX-001 A11Y-001)
    '@storybook/addon-docs',     // Documentation generation
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag', // Auto-generate docs for components with @storybook/docs tag
  },
};

export default config;
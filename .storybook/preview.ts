/**
 * Storybook Preview Configuration
 * @governance UX-001, COMPONENT-001
 * @design-system ORION Command Center
 *
 * Global decorators and parameters for component stories.
 * Includes ORION dark theme and accessibility testing setup.
 */
import type { Preview } from '@storybook/nextjs-vite';

// Import ORION global styles
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    // Control matchers for props
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // ORION dark mode background
    backgrounds: {
      default: 'orion-dark',
      values: [
        { name: 'orion-dark', value: '#0a0f1a' },
        { name: 'orion-elevated', value: '#1a2332' },
        { name: 'orion-secondary', value: '#111827' },
        { name: 'light', value: '#ffffff' },
      ],
    },

    // Viewport presets for responsive testing (RESP-001)
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '320px', height: '568px' } },
        mobileLarge: { name: 'Mobile Large', styles: { width: '414px', height: '896px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
        wide: { name: 'Wide', styles: { width: '1536px', height: '960px' } },
      },
    },

    // Layout configuration
    layout: 'centered',

    // Accessibility parameters (UX-001 A11Y-001)
    a11y: {
      // Enable accessibility checks
      element: '#storybook-root',
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'image-alt', enabled: true },
          { id: 'label', enabled: true },
          { id: 'link-name', enabled: true },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
    },
  },

  // Global decorators
  decorators: [
    (Story) => (
      <div className="font-display" style={{ minHeight: '100px' }}>
        <Story />
      </div>
    ),
  ],

  // Global tags
  tags: ['autodocs'],
};

export default preview;
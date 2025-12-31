/**
 * Tailwind CSS Configuration
 * @governance COMPONENT-001
 * @design-system ORION Command Center (Industrial-Premium)
 *
 * This config aligns with globals.css design tokens.
 * All colors, animations, and typography are synchronized.
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ORION Command Center palette
        orion: {
          // Background layers (dark)
          'bg-primary': '#0a0f1a',
          'bg-secondary': '#111827',
          'bg-elevated': '#1a2332',
          'bg-glass': 'rgba(17, 24, 39, 0.7)',

          // Primary accent (cyan)
          cyan: '#00d4ff',
          'cyan-glow': 'rgba(0, 212, 255, 0.3)',

          // Schedule/P6 accent (amber)
          amber: '#fbbf24',
          'amber-glow': 'rgba(251, 191, 36, 0.3)',

          // Finance/SAP accent (emerald)
          emerald: '#10b981',
          'emerald-glow': 'rgba(16, 185, 129, 0.3)',

          // Analytics accent (violet)
          violet: '#8b5cf6',
          'violet-glow': 'rgba(139, 92, 246, 0.3)',

          // Text hierarchy
          'text-primary': '#f1f5f9',
          'text-secondary': '#94a3b8',
          'text-muted': '#64748b',

          // Borders
          border: 'rgba(148, 163, 184, 0.1)',
          'border-glow': 'rgba(0, 212, 255, 0.5)',
        },
      },
      fontFamily: {
        // Display font for headings and UI
        display: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
        // Monospace font for data, code, and technical values
        mono: [
          'var(--font-mono)',
          'JetBrains Mono',
          'Fira Code',
          'monospace',
        ],
        // Default sans-serif (uses display)
        sans: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        // Orbital animations
        orbit: 'orbit 20s linear infinite',
        'orbit-reverse': 'orbit-reverse 15s linear infinite',

        // Entrance animations
        'slide-up': 'slide-up 0.6s var(--orion-ease-out) forwards',
        'slide-in-right': 'slide-in-right 0.6s var(--orion-ease-out) forwards',
        'fade-in': 'fade-in 0.4s var(--orion-ease-out) forwards',
        'scale-in': 'scale-in 0.5s var(--orion-ease-spring) forwards',

        // Continuous animations
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',

        // Legacy compatibility
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'orbit-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'orion-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'orion-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      spacing: {
        // ORION spacing scale (mirroring CSS custom properties)
        'orion-xs': '0.25rem',
        'orion-sm': '0.5rem',
        'orion-md': '1rem',
        'orion-lg': '1.5rem',
        'orion-xl': '2rem',
        'orion-2xl': '3rem',
        'orion-3xl': '4rem',
      },
      borderRadius: {
        // ORION rounded corners
        orion: '1rem',
        'orion-sm': '0.75rem',
        'orion-lg': '1.25rem',
      },
      backdropBlur: {
        // Glassmorphism blur levels
        orion: '20px',
        'orion-elevated': '24px',
      },
      boxShadow: {
        // ORION shadows
        'orion-glow-cyan':
          '0 0 20px -5px rgba(0, 212, 255, 0.3), 0 0 40px -10px rgba(0, 212, 255, 0.3)',
        'orion-glow-amber':
          '0 0 20px -5px rgba(251, 191, 36, 0.3), 0 0 40px -10px rgba(251, 191, 36, 0.3)',
        'orion-glow-emerald':
          '0 0 20px -5px rgba(16, 185, 129, 0.3), 0 0 40px -10px rgba(16, 185, 129, 0.3)',
        'orion-elevated':
          '0 4px 24px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03) inset',
      },
    },
  },
  plugins: [],
};

export default config;

/**
 * Root Layout
 * @governance COMPONENT-001
 * @design-system ORION Command Center (Outfit + JetBrains Mono)
 */

import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

// Display font for headings and UI text
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

// Monospace font for data, code, and technical values
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'ORION - P6 & SAP Integration Platform',
  description:
    'Unified platform for Primavera P6 schedules and SAP financials',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${outfit.variable} ${jetbrainsMono.variable} font-display antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
// Deploy trigger 1767235388

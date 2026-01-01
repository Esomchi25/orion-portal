/**
 * Dashboard Layout - ORION Command Center
 * @governance COMPONENT-001, DOC-002
 *
 * Shared layout for all dashboard pages including sidebar navigation.
 * Uses ORION Command Center design system.
 */

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DataModeToggle } from '@/components/ui';

// Navigation items for the sidebar
const navigationItems = [
  {
    section: 'HOME',
    items: [
      { href: '/', label: 'Portfolio Overview', icon: 'grid', badge: null },
    ],
  },
  {
    section: 'EXECUTIVE',
    items: [
      { href: '/cfo', label: 'CFO Insights', icon: 'chart', badge: 'NEW' },
    ],
  },
  {
    section: 'PROJECT',
    items: [
      { href: '/project', label: 'Project Dashboard', icon: 'folder', badge: null },
      { href: '/project/evm', label: 'EVM Analysis', icon: 'trending', badge: null },
    ],
  },
];

// Icon components
function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  grid: GridIcon,
  chart: ChartIcon,
  folder: FolderIcon,
  trending: TrendingIcon,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-[var(--orion-bg-primary)]">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[var(--orion-bg-glass)] border border-[var(--orion-border)] text-[var(--orion-text-primary)]"
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full bg-[var(--orion-bg-secondary)] border-r border-[var(--orion-border)] flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-[var(--orion-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--orion-cyan)] to-[var(--orion-violet)] flex items-center justify-center">
                <span className="text-white font-bold font-mono text-lg">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--orion-text-primary)] font-display">ORION</h1>
                <p className="text-xs text-[var(--orion-text-muted)] font-mono">P6-SAP Integration</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {navigationItems.map((section) => (
              <div key={section.section} className="mb-6">
                <h2 className="text-xs font-bold text-[var(--orion-text-muted)] font-mono mb-2 px-3">
                  {section.section}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = iconMap[item.icon];

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={closeSidebar}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            isActive
                              ? 'bg-[var(--orion-cyan)]/10 text-[var(--orion-cyan)] border border-[var(--orion-cyan)]/30'
                              : 'text-[var(--orion-text-secondary)] hover:bg-[var(--orion-bg-elevated)] hover:text-[var(--orion-text-primary)]'
                          }`}
                        >
                          <Icon className={`flex-shrink-0 ${isActive ? 'text-[var(--orion-cyan)]' : ''}`} />
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto px-2 py-0.5 text-xs font-bold font-mono rounded bg-[var(--orion-violet)]/20 text-[var(--orion-violet)]">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Data Mode Toggle (Admin Only) */}
          <div className="px-4 pt-4">
            <DataModeToggle compact className="w-full justify-center" />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--orion-border)]">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--orion-bg-elevated)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--orion-amber)] to-[var(--orion-emerald)] flex items-center justify-center">
                <span className="text-white text-sm font-bold">O</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--orion-text-primary)] truncate">OILSERV</p>
                <p className="text-xs text-[var(--orion-text-muted)] font-mono">Tenant Active</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

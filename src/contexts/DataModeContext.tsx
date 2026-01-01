/**
 * Data Mode Context - Mock/Live Toggle
 * @governance DOC-002
 *
 * Provides global state for switching between mock and live data sources.
 * Admin-only feature for demonstrations and testing.
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

export type DataMode = 'mock' | 'live';

interface DataModeContextType {
  /** Current data mode */
  mode: DataMode;
  /** Toggle between mock and live */
  toggleMode: () => void;
  /** Set specific mode */
  setMode: (mode: DataMode) => void;
  /** Is user an admin (can see toggle) */
  isAdmin: boolean;
  /** Loading state while fetching preference */
  isLoading: boolean;
  /** Last sync timestamps */
  syncStatus: {
    p6LastSync: string | null;
    sapLastSync: string | null;
  };
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

const STORAGE_KEY = 'orion-data-mode';
const ADMIN_ROLES = ['admin', 'super_admin', 'developer'];

interface DataModeProviderProps {
  children: ReactNode;
  /** User role from auth provider */
  userRole?: string;
  /** Tenant ID for persistence */
  tenantId?: string;
}

export function DataModeProvider({
  children,
  userRole = 'admin', // Default to admin for development
  tenantId,
}: DataModeProviderProps) {
  const [mode, setModeState] = useState<DataMode>('mock');
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    p6LastSync: null as string | null,
    sapLastSync: null as string | null,
  });

  const isAdmin = ADMIN_ROLES.includes(userRole?.toLowerCase() || '');

  // Load preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === 'mock' || stored === 'live')) {
        setModeState(stored);
      }
    } catch {
      // localStorage not available
    }
    setIsLoading(false);
  }, []);

  // Persist to localStorage when mode changes
  const setMode = useCallback((newMode: DataMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // localStorage not available
    }
  }, []);

  // Toggle between modes
  const toggleMode = useCallback(() => {
    setMode(mode === 'mock' ? 'live' : 'mock');
  }, [mode, setMode]);

  // Fetch sync status when in live mode
  useEffect(() => {
    if (mode === 'live' && tenantId) {
      fetch(`/api/v1/sync/status?tenant=${tenantId}`)
        .then((res) => res.json())
        .then((data) => {
          setSyncStatus({
            p6LastSync: data.p6?.lastSync || null,
            sapLastSync: data.sap?.lastSync || null,
          });
        })
        .catch(() => {
          // Ignore errors
        });
    }
  }, [mode, tenantId]);

  return (
    <DataModeContext.Provider
      value={{
        mode,
        toggleMode,
        setMode,
        isAdmin,
        isLoading,
        syncStatus,
      }}
    >
      {children}
    </DataModeContext.Provider>
  );
}

/**
 * Hook to access data mode context
 */
export function useDataMode(): DataModeContextType {
  const context = useContext(DataModeContext);
  if (context === undefined) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return context;
}

/**
 * Get the schema prefix based on current data mode
 * @param mode - Current data mode
 * @returns Schema name to use in queries
 */
export function getSchemaForMode(mode: DataMode): string {
  return mode === 'mock' ? 'client_demo' : 'orion_core';
}

/**
 * Get the EVM schema prefix based on current data mode
 */
export function getEVMSchemaForMode(mode: DataMode): string {
  return mode === 'mock' ? 'client_demo' : 'orion_evm';
}

/**
 * Get the P6 schema prefix based on current data mode
 */
export function getP6SchemaForMode(mode: DataMode): string {
  return mode === 'mock' ? 'client_demo' : 'p6_raw';
}

export default DataModeContext;

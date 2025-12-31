/**
 * Settings Page Component Tests
 * @governance COMPONENT-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:9
 *
 * Test coverage:
 * - Unit tests: Tab navigation, form rendering
 * - Integration tests: API interactions, save/test operations
 * - Accessibility tests: Keyboard navigation, screen reader
 */

import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsPage, P6ConnectionSettings, SAPConnectionSettings, SyncSettings, UserPreferencesSettings } from '../Settings';
import type {
  P6ConnectionConfig,
  SAPConnectionConfig,
  SyncConfig,
  UserPreferences,
  TenantConfig,
  SettingsResponse,
} from '../types';

expect.extend(toHaveNoViolations);

// ============================================================================
// MOCK DATA
// ============================================================================

const mockP6Config: P6ConnectionConfig = {
  id: 'p6-conn-1',
  wsdlUrl: 'https://p6.example.com/p6ws/services',
  username: 'p6admin',
  password: '********',
  databaseInstance: 'PRIMAVERA',
  status: 'connected',
  lastTestedAt: '2024-03-15T10:00:00Z',
  lastError: null,
  isEnabled: true,
};

const mockSAPConfig: SAPConnectionConfig = {
  id: 'sap-conn-1',
  hostUrl: 'https://sap.example.com:8443',
  client: '100',
  username: 'sapadmin',
  password: '********',
  systemNumber: '00',
  instanceNumber: '00',
  connectionType: 'hana',
  status: 'connected',
  lastTestedAt: '2024-03-15T10:00:00Z',
  lastError: null,
  isEnabled: true,
};

const mockSyncConfig: SyncConfig = {
  id: 'sync-1',
  frequency: 'daily',
  cronExpression: '0 2 * * *',
  isEnabled: true,
  lastSyncAt: '2024-03-15T02:00:00Z',
  lastSyncStatus: 'success',
  lastSyncDurationSeconds: 120,
  lastSyncRecordCount: 5000,
  nextScheduledAt: '2024-03-16T02:00:00Z',
  p6Entities: [
    { name: 'projects', isEnabled: true, lastSyncCount: 10, lastSyncAt: '2024-03-15T02:00:00Z' },
    { name: 'wbs', isEnabled: true, lastSyncCount: 500, lastSyncAt: '2024-03-15T02:00:00Z' },
    { name: 'activities', isEnabled: true, lastSyncCount: 2000, lastSyncAt: '2024-03-15T02:00:00Z' },
    { name: 'relationships', isEnabled: true, lastSyncCount: 1500, lastSyncAt: '2024-03-15T02:00:00Z' },
    { name: 'resources', isEnabled: false, lastSyncCount: null, lastSyncAt: null },
    { name: 'assignments', isEnabled: false, lastSyncCount: null, lastSyncAt: null },
  ],
  sapEntities: [
    { name: 'acdoca', isEnabled: true, lastSyncCount: 10000, lastSyncAt: '2024-03-15T02:00:00Z', wrttpFilter: '04' },
    { name: 'prps', isEnabled: true, lastSyncCount: 500, lastSyncAt: '2024-03-15T02:00:00Z' },
    { name: 'bseg', isEnabled: false, lastSyncCount: null, lastSyncAt: null },
    { name: 'ekko', isEnabled: false, lastSyncCount: null, lastSyncAt: null },
    { name: 'ekpo', isEnabled: false, lastSyncCount: null, lastSyncAt: null },
    { name: 'tcurr', isEnabled: true, lastSyncCount: 50, lastSyncAt: '2024-03-15T02:00:00Z' },
  ],
};

const mockPreferences: UserPreferences = {
  userId: 'user-1',
  theme: 'system',
  dateFormat: 'YYYY-MM-DD',
  numberFormat: 'en-US',
  currency: 'USD',
  timezone: 'America/New_York',
  showNotifications: true,
  emailNotifications: false,
  defaultGanttScale: 'month',
  defaultDashboardView: 'portfolio',
};

const mockTenantConfig: TenantConfig = {
  id: 'tenant-1',
  name: 'ACME Construction',
  tier: 'professional',
  maxProjects: 50,
  maxUsers: 25,
  currentProjectCount: 12,
  currentUserCount: 8,
  features: {
    aiChat: true,
    advancedEvm: true,
    customReports: true,
    apiAccess: true,
    sso: false,
    auditLogging: true,
  },
  subscriptionStatus: 'active',
  trialEndsAt: null,
  billingEmail: 'billing@acme.com',
};

const mockSettingsResponse: SettingsResponse = {
  p6Connection: mockP6Config,
  sapConnection: mockSAPConfig,
  syncConfig: mockSyncConfig,
  preferences: mockPreferences,
  tenant: mockTenantConfig,
};

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/v1/settings')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSettingsResponse),
      });
    }
    if (url.includes('/api/v1/settings/connections/p6/test')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Connected', responseTimeMs: 150 }),
      });
    }
    if (url.includes('/api/v1/settings/connections/sap/test')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Connected', responseTimeMs: 200 }),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
});

// ============================================================================
// SETTINGS PAGE TESTS
// ============================================================================

describe('SettingsPage', () => {
  describe('Unit Tests: Tab Navigation', () => {
    it('renders settings page with tabs', async () => {
      render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      expect(screen.getByRole('tab', { name: /connections/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /sync/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /tenant/i })).toBeInTheDocument();
    });

    it('shows connections tab by default', async () => {
      render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /connections/i })).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('switches tabs on click', async () => {
      const user = userEvent.setup();
      render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /sync/i }));

      expect(screen.getByRole('tab', { name: /sync/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /connections/i })).toHaveAttribute('aria-selected', 'false');
    });

    it('supports keyboard navigation between tabs', async () => {
      const user = userEvent.setup();
      render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      const connectionsTab = screen.getByRole('tab', { name: /connections/i });
      connectionsTab.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /sync/i })).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /preferences/i })).toHaveFocus();
    });

    it('respects initial tab prop', async () => {
      render(<SettingsPage tenantId="tenant-1" userId="user-1" initialTab="preferences" />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /preferences/i })).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Unit Tests: Loading State', () => {
    it('shows loading spinner while fetching', () => {
      render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('hides loading spinner after data loads', async () => {
      render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('Unit Tests: Error State', () => {
    it('shows error message when API fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText(/failed to load settings/i)).toBeInTheDocument();
    });

    it('shows retry button on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('uses proper ARIA roles for tabs', async () => {
      render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(4);

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
    });
  });
});

// ============================================================================
// P6 CONNECTION SETTINGS TESTS
// ============================================================================

describe('P6ConnectionSettings', () => {
  const mockOnTestConnection = vi.fn().mockResolvedValue(undefined);
  const mockOnSave = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnTestConnection.mockClear();
    mockOnSave.mockClear();
  });

  it('renders P6 connection form', () => {
    render(
      <P6ConnectionSettings
        config={mockP6Config}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByLabelText(/wsdl url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/database instance/i)).toBeInTheDocument();
  });

  it('displays current values', () => {
    render(
      <P6ConnectionSettings
        config={mockP6Config}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByLabelText(/wsdl url/i)).toHaveValue(mockP6Config.wsdlUrl);
    expect(screen.getByLabelText(/username/i)).toHaveValue(mockP6Config.username);
  });

  it('shows connection status indicator', () => {
    render(
      <P6ConnectionSettings
        config={mockP6Config}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  it('calls onTestConnection when test button clicked', async () => {
    const user = userEvent.setup();

    render(
      <P6ConnectionSettings
        config={mockP6Config}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    expect(mockOnTestConnection).toHaveBeenCalled();
  });

  it('calls onSave when save button clicked', async () => {
    const user = userEvent.setup();

    render(
      <P6ConnectionSettings
        config={mockP6Config}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    // Change a value
    await user.clear(screen.getByLabelText(/wsdl url/i));
    await user.type(screen.getByLabelText(/wsdl url/i), 'https://new-p6.example.com/services');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        wsdlUrl: 'https://new-p6.example.com/services',
      })
    );
  });

  it('disables buttons when loading', () => {
    render(
      <P6ConnectionSettings
        config={mockP6Config}
        isLoading={true}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByRole('button', { name: /test connection/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('shows error message when error prop is set', () => {
    render(
      <P6ConnectionSettings
        config={mockP6Config}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error="Connection failed: Invalid credentials"
      />
    );

    expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
  });

  it('shows enable/disable toggle', () => {
    render(
      <P6ConnectionSettings
        config={mockP6Config}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByRole('switch', { name: /enable/i })).toBeInTheDocument();
  });
});

// ============================================================================
// SAP CONNECTION SETTINGS TESTS
// ============================================================================

describe('SAPConnectionSettings', () => {
  const mockOnTestConnection = vi.fn().mockResolvedValue(undefined);
  const mockOnSave = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnTestConnection.mockClear();
    mockOnSave.mockClear();
  });

  it('renders SAP connection form', () => {
    render(
      <SAPConnectionSettings
        config={mockSAPConfig}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByLabelText(/host url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('displays connection type selector', () => {
    render(
      <SAPConnectionSettings
        config={mockSAPConfig}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByRole('combobox', { name: /connection type/i })).toBeInTheDocument();
  });

  it('shows HANA selected for HANA connection', () => {
    render(
      <SAPConnectionSettings
        config={mockSAPConfig}
        isLoading={false}
        onTestConnection={mockOnTestConnection}
        onSave={mockOnSave}
        error={null}
      />
    );

    const select = screen.getByRole('combobox', { name: /connection type/i });
    expect(select).toHaveValue('hana');
  });
});

// ============================================================================
// SYNC SETTINGS TESTS
// ============================================================================

describe('SyncSettings', () => {
  const mockOnTriggerSync = vi.fn().mockResolvedValue(undefined);
  const mockOnSave = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnTriggerSync.mockClear();
    mockOnSave.mockClear();
  });

  it('renders sync configuration', () => {
    render(
      <SyncSettings
        config={mockSyncConfig}
        isLoading={false}
        onTriggerSync={mockOnTriggerSync}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByRole('combobox', { name: /frequency/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /enable sync/i })).toBeInTheDocument();
  });

  it('displays last sync status', () => {
    render(
      <SyncSettings
        config={mockSyncConfig}
        isLoading={false}
        onTriggerSync={mockOnTriggerSync}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByText(/last sync.*success/i)).toBeInTheDocument();
  });

  it('shows P6 entity toggles', () => {
    render(
      <SyncSettings
        config={mockSyncConfig}
        isLoading={false}
        onTriggerSync={mockOnTriggerSync}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByRole('switch', { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /wbs/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /activities/i })).toBeInTheDocument();
  });

  it('shows SAP entity toggles', () => {
    render(
      <SyncSettings
        config={mockSyncConfig}
        isLoading={false}
        onTriggerSync={mockOnTriggerSync}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByRole('switch', { name: /acdoca/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /prps/i })).toBeInTheDocument();
  });

  it('calls onTriggerSync when sync now clicked', async () => {
    const user = userEvent.setup();

    render(
      <SyncSettings
        config={mockSyncConfig}
        isLoading={false}
        onTriggerSync={mockOnTriggerSync}
        onSave={mockOnSave}
        error={null}
      />
    );

    await user.click(screen.getByRole('button', { name: /sync now/i }));

    expect(mockOnTriggerSync).toHaveBeenCalled();
  });

  it('displays sync statistics', () => {
    render(
      <SyncSettings
        config={mockSyncConfig}
        isLoading={false}
        onTriggerSync={mockOnTriggerSync}
        onSave={mockOnSave}
        error={null}
      />
    );

    // toLocaleString() formats 5000 as "5,000"
    expect(screen.getByText(/5,000/)).toBeInTheDocument(); // Records synced
    expect(screen.getByText(/120/)).toBeInTheDocument(); // Duration seconds
  });
});

// ============================================================================
// USER PREFERENCES TESTS
// ============================================================================

describe('UserPreferencesSettings', () => {
  const mockOnSave = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders preference options', () => {
    render(
      <UserPreferencesSettings
        preferences={mockPreferences}
        isLoading={false}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByRole('combobox', { name: /theme/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /date format/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /timezone/i })).toBeInTheDocument();
  });

  it('shows current theme selection', () => {
    render(
      <UserPreferencesSettings
        preferences={mockPreferences}
        isLoading={false}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByRole('combobox', { name: /theme/i })).toHaveValue('system');
  });

  it('has notification toggles', () => {
    render(
      <UserPreferencesSettings
        preferences={mockPreferences}
        isLoading={false}
        onSave={mockOnSave}
        error={null}
      />
    );

    expect(screen.getByRole('switch', { name: /show notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /email notifications/i })).toBeInTheDocument();
  });

  it('calls onSave when save clicked', async () => {
    const user = userEvent.setup();

    render(
      <UserPreferencesSettings
        preferences={mockPreferences}
        isLoading={false}
        onSave={mockOnSave}
        error={null}
      />
    );

    await user.selectOptions(screen.getByRole('combobox', { name: /theme/i }), 'dark');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' })
    );
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('Snapshot Tests', () => {
  it('matches SettingsPage snapshot', async () => {
    const { container } = render(<SettingsPage tenantId="tenant-1" userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});

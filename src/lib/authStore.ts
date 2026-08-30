import { UserProfile, ScanSummary, IntegrationStatus } from './types';

const AUTH_STORAGE_KEY = 'slashsaas_auth_session';
const SCAN_STORAGE_KEY = 'slashsaas_current_scan';
const INTEGRATIONS_STORAGE_KEY = 'slashsaas_integrations';

export const DEFAULT_INTEGRATIONS: IntegrationStatus[] = [
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    status: 'disconnected',
    icon: 'Chrome',
    description: 'OAuth 2.0 Directory & Reports API for token audit and user logins'
  },
  {
    id: 'slack',
    name: 'Slack',
    status: 'disconnected',
    icon: 'MessageSquare',
    description: 'Bot token integration for automated 1-click license nudges'
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    status: 'disconnected',
    icon: 'Grid',
    description: 'Azure Entra ID & Microsoft 365 application usage event stream'
  },
  {
    id: 'okta',
    name: 'Okta',
    status: 'disconnected',
    icon: 'ShieldCheck',
    description: 'Enterprise SSO event stream and SAML login tracking'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    status: 'disconnected',
    icon: 'CreditCard',
    description: 'Automatic corporate card and invoice reconciliation for SaaS billing'
  }
];

export function getStoredSession(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(profile: UserProfile, rememberMe: boolean = true) {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(profile);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, payload);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
    }
  } catch (err) {
    console.error('Failed to save auth session', err);
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(SCAN_STORAGE_KEY);
  localStorage.removeItem(INTEGRATIONS_STORAGE_KEY);
}

export function getStoredIntegrations(): IntegrationStatus[] {
  if (typeof window === 'undefined') return DEFAULT_INTEGRATIONS;
  try {
    const raw = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_INTEGRATIONS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INTEGRATIONS;
  }
}

export function saveIntegrations(integrations: IntegrationStatus[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(integrations));
}

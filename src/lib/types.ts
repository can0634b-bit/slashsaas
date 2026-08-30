export type InactivityBucket = '30-59' | '60-89' | '90+';

export type Department = 'Engineering' | 'Product' | 'Design' | 'Marketing' | 'Sales' | 'Operations' | 'Finance' | 'HR';

export type NudgeStatus = 'pending' | 'nudged' | 'reclaimed' | 'retained' | 'ignored';

export interface SaaSApp {
  id: string;
  name: string;
  category: 'Design' | 'Engineering' | 'Productivity' | 'Sales/CRM' | 'Analytics' | 'Communication' | 'AI & Tools';
  logoUrl?: string;
  iconName: string;
  costPerSeatMonthly: number;
  totalSeats: number;
  activeSeats: number;
  zombieSeats: number;
  monthlyWaste: number;
  annualWaste: number;
  ssoSupported: boolean;
  appUrl: string;
}

export interface ZombieUserSeat {
  id: string;
  userName: string;
  userEmail: string;
  avatarUrl: string;
  department: Department;
  appId: string;
  appName: string;
  costMonthly: number;
  lastActiveDate: string;
  daysInactive: number;
  inactivityBucket: InactivityBucket;
  nudgeStatus: NudgeStatus;
  nudgeSentAt?: string;
  lastNudgeResponse?: string;
}

export interface DepartmentSpend {
  department: Department;
  totalSpend: number;
  wastedSpend: number;
  activeSeats: number;
  zombieSeats: number;
}

export interface ScanSummary {
  scannedAt: string;
  organizationName: string;
  totalEmployees: number;
  totalAppsDiscovered: number;
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  monthlyWastedSpend: number;
  annualWastedSpend: number;
  zombieSeatCount: number;
  totalSeatCount: number;
  zombieSeatPercentage: number;
  potentialSavingsPercentage: number;
  apps: SaaSApp[];
  zombieSeats: ZombieUserSeat[];
  departmentBreakdown: DepartmentSpend[];
  inactivityBreakdown: {
    bucket30to59Days: number;
    bucket60to89Days: number;
    bucket90PlusDays: number;
  };
}

export interface IntegrationStatus {
  id: string;
  name: 'Google Workspace' | 'Slack' | 'Microsoft 365' | 'Okta' | 'Stripe';
  status: 'connected' | 'disconnected' | 'pending';
  lastSyncAt?: string;
  accountsFound?: number;
  icon: string;
  description: string;
}

export interface AutomationRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  triggerDays: number;
  targetApps: string[];
  actionType: 'slack_nudge' | 'email_alert' | 'auto_reclaim';
}

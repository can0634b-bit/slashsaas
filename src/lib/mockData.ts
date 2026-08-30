import { ScanSummary, IntegrationStatus, AutomationRule } from './types';

export const INITIAL_MOCK_SCAN: ScanSummary = {
  scannedAt: new Date().toISOString(),
  organizationName: 'Apex Technologies, Inc.',
  totalEmployees: 64,
  totalAppsDiscovered: 12,
  totalMonthlySpend: 8420,
  totalAnnualSpend: 101040,
  monthlyWastedSpend: 1890,
  annualWastedSpend: 22680,
  zombieSeatCount: 41,
  totalSeatCount: 218,
  zombieSeatPercentage: 18.8,
  potentialSavingsPercentage: 22.4,
  apps: [
    {
      id: 'figma',
      name: 'Figma Organization',
      category: 'Design',
      costPerSeatMonthly: 45,
      totalSeats: 24,
      activeSeats: 16,
      zombieSeats: 8,
      monthlyWaste: 360,
      annualWaste: 4320,
      ssoSupported: true,
      appUrl: 'https://figma.com',
      iconName: 'Figma'
    },
    {
      id: 'chatgpt-team',
      name: 'OpenAI ChatGPT Team',
      category: 'AI & Tools',
      costPerSeatMonthly: 30,
      totalSeats: 32,
      activeSeats: 22,
      zombieSeats: 10,
      monthlyWaste: 300,
      annualWaste: 3600,
      ssoSupported: true,
      appUrl: 'https://openai.com',
      iconName: 'Bot'
    },
    {
      id: 'github-copilot',
      name: 'GitHub Copilot Enterprise',
      category: 'Engineering',
      costPerSeatMonthly: 39,
      totalSeats: 28,
      activeSeats: 21,
      zombieSeats: 7,
      monthlyWaste: 273,
      annualWaste: 3276,
      ssoSupported: true,
      appUrl: 'https://github.com',
      iconName: 'Code2'
    },
    {
      id: 'notion',
      name: 'Notion Business',
      category: 'Productivity',
      costPerSeatMonthly: 18,
      totalSeats: 48,
      activeSeats: 40,
      zombieSeats: 8,
      monthlyWaste: 144,
      annualWaste: 1728,
      ssoSupported: true,
      appUrl: 'https://notion.so',
      iconName: 'FileText'
    },
    {
      id: 'loom',
      name: 'Loom Enterprise',
      category: 'Communication',
      costPerSeatMonthly: 20,
      totalSeats: 35,
      activeSeats: 29,
      zombieSeats: 6,
      monthlyWaste: 120,
      annualWaste: 1440,
      ssoSupported: true,
      appUrl: 'https://loom.com',
      iconName: 'Video'
    },
    {
      id: 'salesforce',
      name: 'Salesforce Sales Cloud',
      category: 'Sales/CRM',
      costPerSeatMonthly: 80,
      totalSeats: 12,
      activeSeats: 10,
      zombieSeats: 2,
      monthlyWaste: 160,
      annualWaste: 1920,
      ssoSupported: true,
      appUrl: 'https://salesforce.com',
      iconName: 'TrendingUp'
    },
    {
      id: 'datadog',
      name: 'Datadog APM',
      category: 'Engineering',
      costPerSeatMonthly: 35,
      totalSeats: 16,
      activeSeats: 13,
      zombieSeats: 3,
      monthlyWaste: 105,
      annualWaste: 1260,
      ssoSupported: true,
      appUrl: 'https://datadoghq.com',
      iconName: 'Activity'
    },
    {
      id: 'miro',
      name: 'Miro Business',
      category: 'Productivity',
      costPerSeatMonthly: 16,
      totalSeats: 23,
      activeSeats: 19,
      zombieSeats: 4,
      monthlyWaste: 64,
      annualWaste: 768,
      ssoSupported: true,
      appUrl: 'https://miro.com',
      iconName: 'LayoutGrid'
    }
  ],
  zombieSeats: [
    {
      id: 'z-1',
      userName: 'Marcus Vance',
      userEmail: 'marcus.vance@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      department: 'Marketing',
      appId: 'figma',
      appName: 'Figma Organization',
      costMonthly: 45,
      lastActiveDate: '2026-05-14',
      daysInactive: 108,
      inactivityBucket: '90+',
      nudgeStatus: 'pending'
    },
    {
      id: 'z-2',
      userName: 'Elena Rostova',
      userEmail: 'elena.rostova@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      department: 'Sales',
      appId: 'chatgpt-team',
      appName: 'OpenAI ChatGPT Team',
      costMonthly: 30,
      lastActiveDate: '2026-05-22',
      daysInactive: 100,
      inactivityBucket: '90+',
      nudgeStatus: 'pending'
    },
    {
      id: 'z-3',
      userName: 'David Kim',
      userEmail: 'david.kim@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      department: 'Engineering',
      appId: 'github-copilot',
      appName: 'GitHub Copilot Enterprise',
      costMonthly: 39,
      lastActiveDate: '2026-06-08',
      daysInactive: 83,
      inactivityBucket: '60-89',
      nudgeStatus: 'pending'
    },
    {
      id: 'z-4',
      userName: 'Sarah Jenkins',
      userEmail: 'sarah.jenkins@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      department: 'Product',
      appId: 'figma',
      appName: 'Figma Organization',
      costMonthly: 45,
      lastActiveDate: '2026-06-15',
      daysInactive: 76,
      inactivityBucket: '60-89',
      nudgeStatus: 'nudged',
      nudgeSentAt: '2026-08-28T14:30:00Z'
    },
    {
      id: 'z-5',
      userName: 'Liam Thorne',
      userEmail: 'liam.thorne@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      department: 'Operations',
      appId: 'notion',
      appName: 'Notion Business',
      costMonthly: 18,
      lastActiveDate: '2026-07-02',
      daysInactive: 59,
      inactivityBucket: '30-59',
      nudgeStatus: 'pending'
    },
    {
      id: 'z-6',
      userName: 'Chloe Bennett',
      userEmail: 'chloe.b@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      department: 'Marketing',
      appId: 'loom',
      appName: 'Loom Enterprise',
      costMonthly: 20,
      lastActiveDate: '2026-05-30',
      daysInactive: 92,
      inactivityBucket: '90+',
      nudgeStatus: 'pending'
    },
    {
      id: 'z-7',
      userName: 'Julian Alcantara',
      userEmail: 'julian.a@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
      department: 'Sales',
      appId: 'salesforce',
      appName: 'Salesforce Sales Cloud',
      costMonthly: 80,
      lastActiveDate: '2026-05-18',
      daysInactive: 104,
      inactivityBucket: '90+',
      nudgeStatus: 'pending'
    },
    {
      id: 'z-8',
      userName: 'Aaliyah Patel',
      userEmail: 'aaliyah.p@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      department: 'Engineering',
      appId: 'datadog',
      appName: 'Datadog APM',
      costMonthly: 35,
      lastActiveDate: '2026-06-25',
      daysInactive: 66,
      inactivityBucket: '60-89',
      nudgeStatus: 'reclaimed',
      nudgeSentAt: '2026-08-25T09:00:00Z',
      lastNudgeResponse: 'License relinquished by user'
    },
    {
      id: 'z-9',
      userName: 'Thomas Mueller',
      userEmail: 'thomas.m@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      department: 'Product',
      appId: 'miro',
      appName: 'Miro Business',
      costMonthly: 16,
      lastActiveDate: '2026-07-10',
      daysInactive: 51,
      inactivityBucket: '30-59',
      nudgeStatus: 'pending'
    },
    {
      id: 'z-10',
      userName: 'Sophie Martin',
      userEmail: 'sophie.m@apextech.io',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      department: 'HR',
      appId: 'chatgpt-team',
      appName: 'OpenAI ChatGPT Team',
      costMonthly: 30,
      lastActiveDate: '2026-05-10',
      daysInactive: 112,
      inactivityBucket: '90+',
      nudgeStatus: 'pending'
    }
  ],
  departmentBreakdown: [
    { department: 'Engineering', totalSpend: 3450, wastedSpend: 680, activeSeats: 65, zombieSeats: 14 },
    { department: 'Design', totalSpend: 1280, wastedSpend: 420, activeSeats: 22, zombieSeats: 9 },
    { department: 'Marketing', totalSpend: 1150, wastedSpend: 340, activeSeats: 18, zombieSeats: 7 },
    { department: 'Sales', totalSpend: 1420, wastedSpend: 260, activeSeats: 20, zombieSeats: 5 },
    { department: 'Product', totalSpend: 820, wastedSpend: 130, activeSeats: 14, zombieSeats: 4 },
    { department: 'Operations', totalSpend: 300, wastedSpend: 60, activeSeats: 8, zombieSeats: 2 }
  ],
  inactivityBreakdown: {
    bucket30to59Days: 14,
    bucket60to89Days: 16,
    bucket90PlusDays: 11
  }
};

export const MOCK_INTEGRATIONS: IntegrationStatus[] = [
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    status: 'connected',
    lastSyncAt: 'Just now',
    accountsFound: 64,
    icon: 'Chrome',
    description: 'OAuth 2.0 Directory & Reports API for token audit and user logins'
  },
  {
    id: 'slack',
    name: 'Slack',
    status: 'connected',
    lastSyncAt: '10 minutes ago',
    accountsFound: 64,
    icon: 'MessageSquare',
    description: 'Bot token integration for automated 1-click license nudges'
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    status: 'disconnected',
    icon: 'Grid',
    description: 'Azure Entra ID & Microsoft 365 app usage logs'
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
    status: 'connected',
    lastSyncAt: '1 hour ago',
    icon: 'CreditCard',
    description: 'Automatic credit card statement reconciliation for SaaS invoices'
  }
];

export const MOCK_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule-1',
    title: '60-Day Dormant Seat Warning',
    description: 'Send a polite Slack DM when a user hasn\'t logged into Figma, Loom, or Miro in 60+ days.',
    enabled: true,
    triggerDays: 60,
    targetApps: ['figma', 'loom', 'miro'],
    actionType: 'slack_nudge'
  },
  {
    id: 'rule-2',
    title: '90-Day Zombie License Flag',
    description: 'Automatically flag any seat inactive for 90+ days and notify the department manager.',
    enabled: true,
    triggerDays: 90,
    targetApps: ['chatgpt-team', 'github-copilot', 'salesforce'],
    actionType: 'email_alert'
  },
  {
    id: 'rule-3',
    title: 'Weekly CFO Waste Summary',
    description: 'Generate and email a PDF waste summary every Monday morning to the finance team.',
    enabled: true,
    triggerDays: 7,
    targetApps: ['all'],
    actionType: 'email_alert'
  }
];

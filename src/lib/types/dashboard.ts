export type AppCategory = 'saas' | 'ai' | 'shadow';
export type BillingCycle = 'monthly' | 'annual';

export interface DetectedApp {
  id: string;
  org_id: string;
  app_name: string;
  category: AppCategory;
  monthly_seat_cost: number;
  billing_cycle: BillingCycle;
  renewal_date: string | null;
  seats_total: number;
  first_seen: string;
  users_count?: number;
}

export interface Seat {
  id: string;
  org_id: string;
  app_id: string | null;
  email: string;
  name: string | null;
  department: string | null;
  last_active_at: string | null;
  dormancy_days: number;
  source: string;
  created_at: string;
  app?: DetectedApp | null;
}

export interface DepartmentWaste {
  department: string;
  dormant_seats: number;
  annual_waste: number;
  percentage: number;
}

export interface RenewalAlert {
  app_id: string;
  app_name: string;
  category: AppCategory;
  renewal_date: string;
  days_until_renewal: number;
  total_seats: number;
  dormant_seats_count: number;
  reclaimable_annual_amount: number;
  monthly_seat_cost: number;
}

export interface DashboardComputedMetrics {
  totalAnnualWaste: number;
  totalMonthlyWaste: number;
  totalMonitoredSeats: number;
  dormantSeatsCount: number;
  activeSeatsCount: number;
  totalDetectedApps: number;
  departmentBreakdown: DepartmentWaste[];
  upcomingRenewals: RenewalAlert[];
  dormantSeats: Seat[];
}

import { DetectedApp, Seat, DashboardComputedMetrics, DepartmentWaste, RenewalAlert } from '../types/dashboard';

export function computeWasteMetrics(
  apps: DetectedApp[],
  seats: Seat[],
  dormancyThresholdDays = 45
): DashboardComputedMetrics {
  const now = new Date();
  const appMap = new Map<string, DetectedApp>();
  apps.forEach((app) => appMap.set(app.id, app));

  // 1. Process seats & calculate exact dormancy days
  const processedSeats: Seat[] = seats.map((seat) => {
    const linkedApp = seat.app_id ? appMap.get(seat.app_id) || null : null;
    let dormancyDays = 0;

    if (seat.last_active_at) {
      const lastActive = new Date(seat.last_active_at);
      const diffTime = Math.max(0, now.getTime() - lastActive.getTime());
      dormancyDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      // If never logged in or no timestamp, consider high dormancy (e.g. 90 days)
      dormancyDays = 90;
    }

    return {
      ...seat,
      dormancy_days: dormancyDays,
      app: linkedApp,
    };
  });

  const dormantSeats = processedSeats.filter(
    (seat) => seat.dormancy_days >= dormancyThresholdDays
  );
  const activeSeats = processedSeats.filter(
    (seat) => seat.dormancy_days < dormancyThresholdDays
  );

  // 2. Compute Annual & Monthly Waste
  let totalAnnualWaste = 0;
  let totalMonthlyWaste = 0;

  const departmentWasteMap = new Map<string, { dormantCount: number; annualWaste: number }>();

  dormantSeats.forEach((seat) => {
    const cost = Number(seat.app?.monthly_seat_cost || 0);
    const annualCost = cost * 12;

    totalMonthlyWaste += cost;
    totalAnnualWaste += annualCost;

    if (annualCost > 0 || seat.department) {
      const dept = seat.department?.trim() || 'General';
      const current = departmentWasteMap.get(dept) || { dormantCount: 0, annualWaste: 0 };
      departmentWasteMap.set(dept, {
        dormantCount: current.dormantCount + 1,
        annualWaste: current.annualWaste + annualCost,
      });
    }
  });

  // 3. Department Breakdown
  const departmentBreakdown: DepartmentWaste[] = [];
  departmentWasteMap.forEach((val, dept) => {
    const percentage = totalAnnualWaste > 0 ? Math.round((val.annualWaste / totalAnnualWaste) * 100) : 0;
    departmentBreakdown.push({
      department: dept,
      dormant_seats: val.dormantCount,
      annual_waste: val.annualWaste,
      percentage,
    });
  });

  // Sort departments by waste descending
  departmentBreakdown.sort((a, b) => b.annual_waste - a.annual_waste);

  // 4. Renewal Radar calculation
  const upcomingRenewals: RenewalAlert[] = [];

  apps.forEach((app) => {
    if (!app.renewal_date) return;

    const renewalDate = new Date(app.renewal_date);
    const diffTime = renewalDate.getTime() - now.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const appDormantSeats = dormantSeats.filter((s) => s.app_id === app.id);
    const reclaimableAmount = appDormantSeats.length * Number(app.monthly_seat_cost || 0) * 12;

    upcomingRenewals.push({
      app_id: app.id,
      app_name: app.app_name,
      category: app.category,
      renewal_date: app.renewal_date,
      days_until_renewal: daysUntil,
      total_seats: app.seats_total || 1,
      dormant_seats_count: appDormantSeats.length,
      reclaimable_annual_amount: reclaimableAmount,
      monthly_seat_cost: Number(app.monthly_seat_cost || 0),
    });
  });

  // Sort renewals by upcoming date (closest first)
  upcomingRenewals.sort((a, b) => a.days_until_renewal - b.days_until_renewal);

  return {
    totalAnnualWaste,
    totalMonthlyWaste,
    totalMonitoredSeats: processedSeats.length,
    dormantSeatsCount: dormantSeats.length,
    activeSeatsCount: activeSeats.length,
    totalDetectedApps: apps.length,
    departmentBreakdown,
    upcomingRenewals,
    dormantSeats,
  };
}

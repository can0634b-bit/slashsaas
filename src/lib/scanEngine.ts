import { ScanSummary, SaaSApp, ZombieUserSeat, DepartmentSpend, Department, InactivityBucket } from './types';
import { POPULAR_SAAS_CATALOG } from './catalog';

export interface ScanOptions {
  companyName: string;
  employeeCount: number;
  provider: 'google' | 'slack' | 'microsoft' | 'manual';
}

const DEPARTMENTS: Department[] = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR'];

const FIRST_NAMES = ['Alex', 'Marcus', 'Elena', 'David', 'Sarah', 'Liam', 'Chloe', 'Julian', 'Aaliyah', 'Thomas', 'Sophie', 'Jordan', 'Maya', 'Lucas', 'Zoe', 'Noah', 'Emma', 'Oliver', 'Amara', 'Leo'];
const LAST_NAMES = ['Vance', 'Rostova', 'Kim', 'Jenkins', 'Thorne', 'Bennett', 'Alcantara', 'Patel', 'Mueller', 'Martin', 'Hayes', 'Chen', 'Silva', 'Taylor', 'Kowalski', 'O\'Connor', 'Dubois', 'Novak', 'Santoro', 'Berg'];

export function generateCustomScan(options: ScanOptions): ScanSummary {
  const { companyName, employeeCount } = options;
  const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.io';
  
  // Select 8-14 apps from catalog
  const selectedCatalogApps = POPULAR_SAAS_CATALOG.slice(0, Math.min(14, Math.max(6, Math.floor(employeeCount / 5))));
  
  const apps: SaaSApp[] = [];
  const zombieSeats: ZombieUserSeat[] = [];
  let totalMonthlySpend = 0;
  let monthlyWastedSpend = 0;
  let totalSeatCount = 0;
  let zombieSeatCount = 0;

  const departmentMap: Record<Department, { totalSpend: number; wastedSpend: number; activeSeats: number; zombieSeats: number }> = {
    Engineering: { totalSpend: 0, wastedSpend: 0, activeSeats: 0, zombieSeats: 0 },
    Product: { totalSpend: 0, wastedSpend: 0, activeSeats: 0, zombieSeats: 0 },
    Design: { totalSpend: 0, wastedSpend: 0, activeSeats: 0, zombieSeats: 0 },
    Marketing: { totalSpend: 0, wastedSpend: 0, activeSeats: 0, zombieSeats: 0 },
    Sales: { totalSpend: 0, wastedSpend: 0, activeSeats: 0, zombieSeats: 0 },
    Operations: { totalSpend: 0, wastedSpend: 0, activeSeats: 0, zombieSeats: 0 },
    Finance: { totalSpend: 0, wastedSpend: 0, activeSeats: 0, zombieSeats: 0 },
    HR: { totalSpend: 0, wastedSpend: 0, activeSeats: 0, zombieSeats: 0 },
  };

  selectedCatalogApps.forEach((catApp, index) => {
    // Generate realistic seat distribution for this app
    const seatRatio = 0.2 + (Math.sin(index + 1) * 0.15 + 0.35); // 20% - 70% of company
    const totalSeats = Math.max(4, Math.floor(employeeCount * seatRatio));
    const zombieRatio = 0.15 + (index % 4) * 0.06; // 15% - 33% zombie rate
    const appZombies = Math.max(1, Math.floor(totalSeats * zombieRatio));
    const activeSeats = totalSeats - appZombies;
    
    const appMonthlyWaste = appZombies * catApp.costPerSeatMonthly;
    const appMonthlyTotal = totalSeats * catApp.costPerSeatMonthly;
    
    totalMonthlySpend += appMonthlyTotal;
    monthlyWastedSpend += appMonthlyWaste;
    totalSeatCount += totalSeats;
    zombieSeatCount += appZombies;

    apps.push({
      ...catApp,
      totalSeats,
      activeSeats,
      zombieSeats: appZombies,
      monthlyWaste: appMonthlyWaste,
      annualWaste: appMonthlyWaste * 12,
    });

    // Generate individual zombie records for this app
    for (let i = 0; i < appZombies; i++) {
      const fName = FIRST_NAMES[(index * 3 + i) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(index * 2 + i * 5) % LAST_NAMES.length];
      const dept = DEPARTMENTS[(index + i) % DEPARTMENTS.length];
      
      const daysInactive = 32 + ((index * 17 + i * 23) % 95); // 32 to 127 days
      let bucket: InactivityBucket = '30-59';
      if (daysInactive >= 90) bucket = '90+';
      else if (daysInactive >= 60) bucket = '60-89';

      const lastActive = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      departmentMap[dept].totalSpend += catApp.costPerSeatMonthly;
      departmentMap[dept].wastedSpend += catApp.costPerSeatMonthly;
      departmentMap[dept].zombieSeats += 1;

      zombieSeats.push({
        id: `z-${catApp.id}-${i + 1}`,
        userName: `${fName} ${lName}`,
        userEmail: `${fName.toLowerCase()}.${lName.toLowerCase()}@${domain}`,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (index * 1000 + i * 500) % 8000000}?w=100&auto=format&fit=crop&q=80`,
        department: dept,
        appId: catApp.id,
        appName: catApp.name,
        costMonthly: catApp.costPerSeatMonthly,
        lastActiveDate: lastActive,
        daysInactive,
        inactivityBucket: bucket,
        nudgeStatus: i === 0 && index === 0 ? 'nudged' : 'pending',
      });
    }
  });

  // Sort apps by highest monthly waste
  apps.sort((a, b) => b.monthlyWaste - a.monthlyWaste);
  // Sort zombie seats by highest cost & days inactive
  zombieSeats.sort((a, b) => b.costMonthly * b.daysInactive - a.costMonthly * a.daysInactive);

  const departmentBreakdown: DepartmentSpend[] = Object.entries(departmentMap).map(([dept, data]) => ({
    department: dept as Department,
    totalSpend: data.totalSpend + 800,
    wastedSpend: data.wastedSpend,
    activeSeats: data.activeSeats + 10,
    zombieSeats: data.zombieSeats,
  })).filter(d => d.zombieSeats > 0);

  const bucket30to59 = zombieSeats.filter(z => z.inactivityBucket === '30-59').length;
  const bucket60to89 = zombieSeats.filter(z => z.inactivityBucket === '60-89').length;
  const bucket90Plus = zombieSeats.filter(z => z.inactivityBucket === '90+').length;

  return {
    scannedAt: new Date().toISOString(),
    organizationName: companyName,
    totalEmployees: employeeCount,
    totalAppsDiscovered: apps.length,
    totalMonthlySpend,
    totalAnnualSpend: totalMonthlySpend * 12,
    monthlyWastedSpend,
    annualWastedSpend: monthlyWastedSpend * 12,
    zombieSeatCount,
    totalSeatCount,
    zombieSeatPercentage: Number(((zombieSeatCount / totalSeatCount) * 100).toFixed(1)),
    potentialSavingsPercentage: Number(((monthlyWastedSpend / totalMonthlySpend) * 100).toFixed(1)),
    apps,
    zombieSeats,
    departmentBreakdown,
    inactivityBreakdown: {
      bucket30to59Days: bucket30to59,
      bucket60to89Days: bucket60to89,
      bucket90PlusDays: bucket90Plus,
    }
  };
}

import { NextResponse } from 'next/server';
import { INITIAL_MOCK_SCAN } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = body.scanData || INITIAL_MOCK_SCAN;

    const headers = ['User Name', 'Email', 'Department', 'App Name', 'Monthly Cost ($)', 'Annual Waste ($)', 'Days Inactive', 'Inactivity Bracket', 'Status'];
    const rows = (data.zombieSeats || []).map((z: any) => [
      `"${z.userName}"`,
      `"${z.userEmail}"`,
      `"${z.department}"`,
      `"${z.appName}"`,
      z.costMonthly,
      z.costMonthly * 12,
      z.daysInactive,
      `"${z.inactivityBucket}"`,
      `"${z.nudgeStatus}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r: any) => r.join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ghostspend-audit-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

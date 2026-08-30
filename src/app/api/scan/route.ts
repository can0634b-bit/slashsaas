import { NextResponse } from 'next/server';
import { generateCustomScan } from '@/lib/scanEngine';
import { INITIAL_MOCK_SCAN } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { companyName, employeeCount, provider } = body;

    if (!companyName) {
      return NextResponse.json(INITIAL_MOCK_SCAN);
    }

    const scanResult = generateCustomScan({
      companyName: companyName || 'My Startup Inc.',
      employeeCount: Number(employeeCount) || 50,
      provider: provider || 'google',
    });

    return NextResponse.json(scanResult);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Failed to process scan' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(INITIAL_MOCK_SCAN);
}

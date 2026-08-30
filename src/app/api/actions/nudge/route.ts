import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seatId, userEmail, userName, appName, daysInactive, actionType } = body;

    // Simulate Slack Nudge or License Reclaim action
    console.log(`[GhostSpend Action] ${actionType} triggered for ${userName} (${userEmail}) on ${appName} (${daysInactive} days inactive)`);

    return NextResponse.json({
      success: true,
      seatId,
      status: actionType === 'reclaim' ? 'reclaimed' : 'nudged',
      message: actionType === 'reclaim' 
        ? `Successfully marked ${appName} license as reclaimed for ${userName}.`
        : `Sent Slack DM nudge to ${userName} via GhostSpend Bot.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Nudge action error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

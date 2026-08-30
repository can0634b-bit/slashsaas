import { NextResponse } from 'next/server';

interface WaitlistPayload {
  email: string;
  name?: string | null;
  company?: string | null;
  planInterest?: string;
  source?: string;
}

// In-memory buffer fallback for dev runtime inspection
const inMemoryWaitlist: Array<WaitlistPayload & { id: string; createdAt: string; deliveredVia: string[] }> = [];

export async function GET() {
  const persistenceConfigured = Boolean(
    (process.env.WAITLIST_WEBHOOK_URL && process.env.WAITLIST_WEBHOOK_URL.trim().length > 0) ||
    (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0)
  );

  return NextResponse.json({
    ok: true,
    persistenceConfigured,
  });
}

export async function POST(request: Request) {
  try {
    const body: WaitlistPayload = await request.json();
    const { email, name, company, planInterest, source } = body;

    // Strict validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'A valid work email address is required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid work email address.' },
        { status: 400 }
      );
    }

    const leadEntry = {
      id: 'lead_' + Math.random().toString(36).substring(2, 11),
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
      company: company?.trim() || null,
      planInterest: planInterest || 'early_access',
      source: source || 'landing_page',
      createdAt: new Date().toISOString(),
    };

    const deliveredVia: string[] = [];

    // Loud configuration warning if zero persistence providers exist
    const hasWebhook = Boolean(process.env.WAITLIST_WEBHOOK_URL && process.env.WAITLIST_WEBHOOK_URL.trim().length > 0);
    const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0);

    if (!hasWebhook && !hasResend) {
      console.warn(
        '⚠️ WAITLIST: no persistence provider configured — leads are only in server logs. Set WAITLIST_WEBHOOK_URL or RESEND_API_KEY.'
      );
    }

    // 1. Try Webhook Provider (e.g. Zapier, Make, Slack, Google Sheets)
    if (hasWebhook) {
      try {
        const webhookRes = await fetch(process.env.WAITLIST_WEBHOOK_URL!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadEntry),
        });
        if (webhookRes.ok) {
          deliveredVia.push('webhook');
        } else {
          console.error(`[WAITLIST_WEBHOOK_ERROR] HTTP ${webhookRes.status}: ${await webhookRes.text().catch(() => '')}`);
        }
      } catch (webhookErr) {
        console.error('[WAITLIST_WEBHOOK_EXCEPTION] Failed to forward waitlist lead:', webhookErr);
      }
    }

    // 2. Try Resend Provider (does NOT abort if webhook failed or succeeded)
    if (hasResend) {
      try {
        const notificationEmail = process.env.WAITLIST_NOTIFICATION_EMAIL || 'support@slashsaas.com';
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'SlashSaaS Leads <onboarding@resend.dev>',
            to: [notificationEmail],
            subject: `🎉 New SlashSaaS Early Access Lead: ${leadEntry.email}`,
            html: `
              <h2>New Early Access Request</h2>
              <p><strong>Email:</strong> ${leadEntry.email}</p>
              <p><strong>Name:</strong> ${leadEntry.name || 'Not provided'}</p>
              <p><strong>Company:</strong> ${leadEntry.company || 'Not provided'}</p>
              <p><strong>Plan Interest:</strong> ${leadEntry.planInterest}</p>
              <p><strong>Lead ID:</strong> ${leadEntry.id}</p>
              <p><strong>Timestamp:</strong> ${leadEntry.createdAt}</p>
            `,
          }),
        });

        if (resendRes.ok) {
          deliveredVia.push('resend');
        } else {
          console.error(`[WAITLIST_RESEND_ERROR] HTTP ${resendRes.status}: ${await resendRes.text().catch(() => '')}`);
        }
      } catch (resendErr) {
        console.error('[WAITLIST_RESEND_EXCEPTION] Failed to notify via Resend:', resendErr);
      }
    }

    // 3. Guaranteed Server Log Fallback (retained in Vercel logs)
    if (deliveredVia.length === 0) {
      deliveredVia.push('log-only');
    }

    // Guaranteed grep-friendly server log line emitted on every single lead
    console.info(
      '[WAITLIST_LEAD]',
      JSON.stringify({
        ts: leadEntry.createdAt,
        email: leadEntry.email,
        name: leadEntry.name,
        company: leadEntry.company,
        plan: leadEntry.planInterest,
        source: leadEntry.source,
        leadId: leadEntry.id,
        deliveredVia,
      })
    );

    // In-memory record
    inMemoryWaitlist.push({ ...leadEntry, deliveredVia });

    const persisted = deliveredVia.some((d) => d === 'webhook' || d === 'resend');

    return NextResponse.json({
      success: true,
      message: 'You have been added to the priority early access list.',
      leadId: leadEntry.id,
      persisted,
      deliveredVia,
    });
  } catch (error) {
    console.error('Waitlist API unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

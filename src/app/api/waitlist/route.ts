import { NextResponse } from 'next/server';
import { clientIp, escapeHtml, capString } from '@/lib/security/rate-limit';
import { enforceRateLimit } from '@/lib/security/rate-limit-db';

interface WaitlistPayload {
  email: string;
  name?: string | null;
  company?: string | null;
  planInterest?: string;
  source?: string;
}

// In-memory buffer fallback for dev runtime inspection (bounded).
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
    // Rate limit (best-effort, per IP): this endpoint is public and unauthenticated.
    if (await enforceRateLimit(`waitlist:${clientIp(request)}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a little while.' },
        { status: 429 }
      );
    }

    const body: WaitlistPayload = await request.json().catch(() => ({} as WaitlistPayload));

    // Normalize + hard-cap every field to bound payload size and abuse.
    const email = capString(body.email, 254).toLowerCase();
    const name = capString(body.name, 120);
    const company = capString(body.company, 120);
    const planInterest = capString(body.planInterest, 60) || 'early_access';
    const source = capString(body.source, 60) || 'landing_page';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid work email address.' },
        { status: 400 }
      );
    }

    const leadEntry = {
      id: 'lead_' + Math.random().toString(36).substring(2, 11),
      email,
      name: name || null,
      company: company || null,
      planInterest,
      source,
      createdAt: new Date().toISOString(),
    };

    const deliveredVia: string[] = [];

    const hasWebhook = Boolean(process.env.WAITLIST_WEBHOOK_URL && process.env.WAITLIST_WEBHOOK_URL.trim().length > 0);
    const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0);

    if (!hasWebhook && !hasResend) {
      console.warn(
        '⚠️ WAITLIST: no persistence provider configured — leads are only in server logs. Set WAITLIST_WEBHOOK_URL or RESEND_API_KEY.'
      );
    }

    // 1. Webhook provider (e.g. Make.com → Google Sheet).
    if (hasWebhook) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 8000);
        const webhookRes = await fetch(process.env.WAITLIST_WEBHOOK_URL!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadEntry),
          signal: controller.signal,
        });
        clearTimeout(t);
        if (webhookRes.ok) {
          deliveredVia.push('webhook');
        } else {
          console.error(`[WAITLIST_WEBHOOK_ERROR] HTTP ${webhookRes.status}: ${await webhookRes.text().catch(() => '')}`);
        }
      } catch (webhookErr) {
        console.error('[WAITLIST_WEBHOOK_EXCEPTION] Failed to forward waitlist lead:', webhookErr);
      }
    }

    // 2. Resend provider — user-supplied values are HTML-escaped to prevent
    //    HTML/email injection into the notification.
    if (hasResend) {
      try {
        const notificationEmail = process.env.WAITLIST_NOTIFICATION_EMAIL || 'slashsaas@gmail.com';
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 8000);
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'SlashSaaS Leads <onboarding@resend.dev>',
            to: [notificationEmail],
            subject: `New SlashSaaS lead: ${leadEntry.email}`,
            html: `
              <h2>New Early Access Request</h2>
              <p><strong>Email:</strong> ${escapeHtml(leadEntry.email)}</p>
              <p><strong>Name:</strong> ${escapeHtml(leadEntry.name || 'Not provided')}</p>
              <p><strong>Company:</strong> ${escapeHtml(leadEntry.company || 'Not provided')}</p>
              <p><strong>Plan Interest:</strong> ${escapeHtml(leadEntry.planInterest)}</p>
              <p><strong>Source:</strong> ${escapeHtml(leadEntry.source)}</p>
              <p><strong>Lead ID:</strong> ${leadEntry.id}</p>
              <p><strong>Timestamp:</strong> ${leadEntry.createdAt}</p>
            `,
          }),
          signal: controller.signal,
        });
        clearTimeout(t);

        if (resendRes.ok) {
          deliveredVia.push('resend');
        } else {
          console.error(`[WAITLIST_RESEND_ERROR] HTTP ${resendRes.status}: ${await resendRes.text().catch(() => '')}`);
        }
      } catch (resendErr) {
        console.error('[WAITLIST_RESEND_EXCEPTION] Failed to notify via Resend:', resendErr);
      }
    }

    // 3. Guaranteed server-log fallback.
    if (deliveredVia.length === 0) {
      deliveredVia.push('log-only');
    }

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

    // Bounded in-memory record (keep only the most recent entries).
    inMemoryWaitlist.push({ ...leadEntry, deliveredVia });
    if (inMemoryWaitlist.length > 200) inMemoryWaitlist.splice(0, inMemoryWaitlist.length - 200);

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

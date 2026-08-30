import { NextResponse } from 'next/server';

interface WaitlistPayload {
  email: string;
  name?: string;
  company?: string;
  planInterest?: string;
  source?: string;
}

// In-memory buffer fallback for development/demo
const inMemoryWaitlist: Array<WaitlistPayload & { id: string; createdAt: string }> = [];

export async function POST(request: Request) {
  try {
    const body: WaitlistPayload = await request.json();
    const { email, name, company, planInterest, source } = body;

    // Validate email format
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
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

    // 1. Swappable Webhook Provider (e.g. Zapier, Make, Slack, Google Sheets)
    const webhookUrl = process.env.WAITLIST_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadEntry),
        });
      } catch (webhookErr) {
        console.error('Failed to forward waitlist lead to webhook:', webhookErr);
      }
    }

    // 2. Swappable Resend Provider
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.WAITLIST_NOTIFICATION_EMAIL || 'support@slashsaas.com';
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
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
              <p><strong>Timestamp:</strong> ${leadEntry.createdAt}</p>
            `,
          }),
        });
      } catch (resendErr) {
        console.error('Failed to notify via Resend:', resendErr);
      }
    }

    // Fallback store
    inMemoryWaitlist.push(leadEntry as any);

    return NextResponse.json({
      success: true,
      message: 'You have been added to the priority early access list.',
      leadId: leadEntry.id,
    });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

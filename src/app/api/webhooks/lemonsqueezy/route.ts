import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('X-Signature') || '';
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

    if (!secret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET is missing');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.error('Invalid LemonSqueezy webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;
    
    // Check if it's a subscription creation or update
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const orgId = customData?.org_id;
      const variantId = payload.data.attributes.variant_id?.toString();
      const status = payload.data.attributes.status; // 'active', 'past_due', 'unpaid', 'cancelled', 'expired'

      if (orgId && variantId) {
        let planName = 'free';
        let billingUrl = payload.data.attributes.urls?.customer_portal || null;

        // Map variant back to plan name if active
        if (status === 'active' || status === 'past_due') {
          if (variantId === '2102182') {
            planName = 'radar';
          } else if (variantId === '2102197') {
            planName = 'command';
          }
        } else if (status === 'cancelled' || status === 'expired' || status === 'unpaid') {
          planName = 'free';
        }

        console.log(`[Webhook] Updating org ${orgId} to plan ${planName} (Status: ${status})`);

        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
          .from('organizations')
          .update({ 
            plan: planName,
            billing_portal_url: billingUrl
          })
          .eq('id', orgId);

        if (error) {
          console.error('[Webhook] Failed to update organization plan:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing LemonSqueezy payload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

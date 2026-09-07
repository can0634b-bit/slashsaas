import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

export const dynamic = 'force-dynamic';

const VARIANT_MAP: Record<string, string> = {
  radar: '2102182',
  command: '2102197',
};

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // If not logged in, redirect to login which then redirects to checkout
      const url = new URL(req.url);
      const plan = url.searchParams.get('plan') || 'command';
      return NextResponse.redirect(new URL(`/login?next=/api/checkout?plan=${plan}`, req.url));
    }

    // Get user's active organization
    const { data: memberData } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!memberData?.org_id) {
      return NextResponse.json({ error: 'No active organization found' }, { status: 400 });
    }

    const orgId = memberData.org_id;

    const url = new URL(req.url);
    const plan = url.searchParams.get('plan') || 'command';
    const variantId = VARIANT_MAP[plan];

    if (!variantId) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      console.error('LEMONSQUEEZY_API_KEY is missing');
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    lemonSqueezySetup({ apiKey });

    // Assuming the store ID is available via an env var, or if omitted, LemonSqueezy might infer it. 
    // Usually, we need the Store ID for createCheckout. Let's see if we can just pass the variant.
    // The LemonSqueezy SDK checkout create requires storeId.
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!storeId) {
       console.error('LEMONSQUEEZY_STORE_ID is missing');
       return NextResponse.json({ error: 'Payment gateway configuration error (Store ID)' }, { status: 500 });
    }

    const checkoutResponse = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: user.email,
        custom: {
          org_id: orgId, // This will be sent back in the webhook!
          user_id: user.id,
        },
      },
    });

    if (checkoutResponse.error) {
      console.error('LemonSqueezy checkout error:', checkoutResponse.error);
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    // Redirect the user to the LemonSqueezy hosted checkout page
    return NextResponse.redirect(checkoutResponse.data?.data.attributes.url!);
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

# LemonSqueezy Payment Integration Plan

This plan outlines the integration of LemonSqueezy for handling subscription payments (Radar and Command plans).

## User Review Required

> [!IMPORTANT]
> Bu plan, sitenin "Ücretsiz" yapısından "Ücretli Abonelik" (SaaS) yapısına geçişi için gereken tüm ödeme altyapısını kuracaktır. Test modunda çalışacak şekilde dizayn edilmiştir. Onayladığında kodları ekleyeceğim.

## Proposed Changes

### 1. LemonSqueezy SDK Initialization
- We will create a helper file to initialize the `@lemonsqueezy/lemonsqueezy.js` client using the `LEMONSQUEEZY_API_KEY`.

#### [NEW] `src/lib/lemonsqueezy.ts`
Setup and export the configured LemonSqueezy API client.

---

### 2. Checkout Route (Gidiş Köprüsü)
- When a user clicks "Start with Command" or "Start with Radar", we need to generate a unique, secure checkout URL specifically for their workspace (Organization).

#### [NEW] `src/app/api/checkout/route.ts`
- Accepts a `plan` parameter (`radar` or `command`).
- Maps the plan to the specific Variant IDs provided (`2102182` and `2102197`).
- Injects the user's Supabase `org_id` into the LemonSqueezy checkout `custom_data` (so we know who paid when the webhook fires).
- Redirects the user to the generated LemonSqueezy checkout page.

---

### 3. Webhook Route (Dönüş Köprüsü)
- LemonSqueezy needs a secure endpoint to send payment confirmations.

#### [NEW] `src/app/api/webhooks/lemonsqueezy/route.ts`
- Listens for `subscription_created` and `subscription_updated` events.
- Verifies the webhook signature using `LEMONSQUEEZY_WEBHOOK_SECRET` to prevent fake requests.
- Reads the `custom_data.org_id` from the payload.
- Updates the Supabase `organizations` table, setting `plan = 'radar'` or `plan = 'command'`.

---

### 4. UI Updates
- Update the Pricing page buttons to trigger the checkout flow.
- Remove "Google Gemini" branding from the pricing features.

#### [MODIFY] `src/app/pricing/page.tsx`
- Change "Google Gemini, grounded" to "Premium Live AI, grounded".
- Update the Call-to-Action buttons to redirect to `/api/checkout?plan=radar` or `/api/checkout?plan=command`.

## Verification Plan

### Manual Verification
1. We will click the "Start with Command" button on the pricing page.
2. We will complete a test checkout using LemonSqueezy's fake credit card numbers (Test Mode).
3. We will verify that the Webhook fires and successfully updates the Supabase database.

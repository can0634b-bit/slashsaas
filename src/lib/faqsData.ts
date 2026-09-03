export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS_DATA: FaqItem[] = [
  {
    q: 'Does SlashSaaS have access to our company emails, files, or messages?',
    a: 'Absolutely not. SlashSaaS connects strictly through Read-Only OAuth 2.0 and SAML directory scopes. We only inspect user authentication timestamps (e.g. "Last login: 45 days ago"). We never access, parse, or store documents, emails, Slack message contents, or passwords.',
  },
  {
    q: 'How does the 1-Click Slack Nudge Bot work without causing awkwardness?',
    a: 'When an employee hasn’t logged into a paid app (like Figma or Notion) for 30+ days, SlashSaaS sends a polite, automated DM in Slack: "Hey Alex, we noticed you haven\'t used Figma in 45 days. Do you still need this $75/mo license?" Alex can click "Keep License" or "Relinquish" directly in Slack with zero interpersonal friction.',
  },
  {
    q: 'How long does onboarding take?',
    a: 'Less than 60 seconds. You authenticate your Google Workspace or Slack admin account via read-only OAuth with one click. SlashSaaS immediately audits your active tokens and builds your full organizational waste breakdown in real time.',
  },
  {
    q: 'Which SaaS tools and apps does SlashSaaS support?',
    a: 'We monitor over 40+ premier tech SaaS tools out of the box, including Figma, Notion, ChatGPT Team/Enterprise, GitHub Copilot, Linear, Loom, Salesforce, Miro, Asana, Datadog, Slack, and Zoom. You can also define custom pricing and seat thresholds for any internal software.',
  },
  {
    q: 'What happens after our initial waste audit?',
    a: 'You get an executive dashboard detailing every dormant seat, monthly financial bleed, and department matrix. You can either export a board-ready CSV immediately or turn on autonomous background monitoring to continuously catch zombie licenses before renewals occur.',
  },
  {
    q: 'What is your cancellation and refund policy?',
    a: 'You can cancel your subscription at any time with a single click inside your dashboard—no retention calls or hoops. Cancellation stops all future billing immediately. When billing is active through our Merchant of Record (LemonSqueezy), refund requests follow LemonSqueezy\'s standard customer terms.',
  },
  {
    q: 'What is your contract length and commitment?',
    a: 'All plans are available on a flexible month-to-month basis with zero long-term commitments. We also offer an annual billing option with an instant 20% discount for organizations that prefer annual invoicing.',
  },
  {
    q: 'Where is our data hosted and how is it secured?',
    a: 'All SlashSaaS services and telemetry databases are hosted on enterprise-grade AWS / Vercel cloud infrastructure in the US-East region, protected by TLS 1.3 in transit and AES-256 encryption at rest.',
  },
  {
    q: 'What is your data retention policy?',
    a: 'We maintain a 30-day rolling window of login timestamp telemetry. If you disconnect your integration or request account deletion, all organization records, token mappings, and user data are purged immediately and permanently.',
  },
  {
    q: 'How do you handle GDPR and data privacy?',
    a: 'SlashSaaS is designed around strict privacy-by-design and GDPR principles. We strictly request read-only authentication timestamps, never access emails or private files, never sell user data, and never use customer data to train AI models. You can disconnect integrations or request full data erasure at any time.',
  },
  {
    q: 'How are subscription payments processed?',
    a: 'Payments are handled securely via LemonSqueezy, our global Merchant of Record. LemonSqueezy handles all compliance, VAT/sales tax calculation, and PCI-DSS compliant payment processing.',
  },
];

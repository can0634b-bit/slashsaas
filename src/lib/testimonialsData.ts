export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  companyBadge: string;
  avatarText: string;
  seatsAudited: string;
  annualSavings: string;
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'early-access-1',
    quote:
      'We audited our Google Workspace and found 14 unused Figma and 8 ChatGPT Enterprise seats within 3 minutes. The Slack nudge bot let our engineers voluntarily surrender licenses without any awkward HR emails.',
    author: 'Early Access Engineering Lead',
    role: 'VP of Engineering',
    companyBadge: '55-Person Series A Startup',
    avatarText: 'EL',
    seatsAudited: '65 seats audited',
    annualSavings: '$14,200/yr saved',
  },
  {
    id: 'early-access-2',
    quote:
      'Legacy SaaS management tools wanted $25k/yr contracts and desktop agent installations. SlashSaaS gave us an executive CSV export for our board in 60 seconds with zero invasive software.',
    author: 'Early Access Finance Lead',
    role: 'Head of Finance & Operations',
    companyBadge: '40-Person B2B SaaS',
    avatarText: 'FL',
    seatsAudited: '45 seats audited',
    annualSavings: '$9,800/yr saved',
  },
  {
    id: 'early-access-3',
    quote:
      'The pre-renewal alert saved us from renewing 20 inactive GitHub Copilot and Notion seats. It literally paid for its entire annual subscription on the very first week.',
    author: 'Design Partner CTO',
    role: 'CTO & Co-Founder',
    companyBadge: '80-Person Scaleup',
    avatarText: 'CT',
    seatsAudited: '90 seats audited',
    annualSavings: '$22,500/yr saved',
  },
];

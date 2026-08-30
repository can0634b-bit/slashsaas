export interface TestimonialItem {
  id: string;
  isIllustrative: boolean;
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
    isIllustrative: true,
    quote:
      'We modeled our Google Workspace and uncovered 14 dormant Figma and 8 unused ChatGPT Team licenses within 3 minutes. The Slack nudge workflow enables engineers to voluntarily surrender licenses without awkward manual HR emails.',
    author: 'Early Access Engineering Lead',
    role: 'VP of Engineering',
    companyBadge: '55-Seat Modeled Profile',
    avatarText: 'EL',
    seatsAudited: '65 seats benchmarked',
    annualSavings: '~$14,200/yr projected savings',
  },
  {
    id: 'early-access-2',
    isIllustrative: true,
    quote:
      'Legacy SaaS management platforms required $25k/yr contracts and invasive MDM desktop agents. SlashSaaS generates executive board-ready CSV audit summaries in 60 seconds with zero endpoint software.',
    author: 'Early Access Finance Lead',
    role: 'Head of Finance & Operations',
    companyBadge: '40-Seat Modeled Profile',
    avatarText: 'FL',
    seatsAudited: '45 seats benchmarked',
    annualSavings: '~$9,800/yr projected savings',
  },
  {
    id: 'early-access-3',
    isIllustrative: true,
    quote:
      'Automated pre-renewal alerts catch unassigned GitHub Copilot and Notion seats before annual contracts auto-renew. It is designed to pay for its entire annual subscription in the very first scan.',
    author: 'Design Partner CTO',
    role: 'CTO & Co-Founder',
    companyBadge: '80-Seat Modeled Profile',
    avatarText: 'CT',
    seatsAudited: '90 seats benchmarked',
    annualSavings: '~$22,500/yr projected savings',
  },
];

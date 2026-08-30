import React from 'react';
import { FAQS_DATA } from '@/lib/faqsData';

export const JsonLd: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://slashsaas.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SlashSaaS',
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description: 'Autonomous SaaS license waste hunter and FinOps optimization platform for startups.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@slashsaas.com',
      contactType: 'customer support',
      availableLanguage: ['English'],
    },
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SlashSaaS',
    operatingSystem: 'All (Cloud/Web Application)',
    applicationCategory: 'BusinessApplication',
    url: baseUrl,
    description: 'Detect inactive Notion, Figma, and AI tool seats in 60 seconds. Reclaim wasted budget with autonomous 1-click Slack nudges.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Growth Plan',
        price: '39.00',
        priceCurrency: 'USD',
        billingDuration: 'P1M',
        description: 'Up to 60 tracked employee seats, continuous OAuth/SAML audit, 1-click Slack nudge bot.',
      },
      {
        '@type': 'Offer',
        name: 'Scale Plan',
        price: '95.00',
        priceCurrency: 'USD',
        billingDuration: 'P1M',
        description: 'Unlimited tracked employee seats, Okta/Azure Entra ID SSO, custom Slack bot workflows.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS_DATA.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};

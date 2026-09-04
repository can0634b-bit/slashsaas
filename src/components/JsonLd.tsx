import React from 'react';

export const JsonLd: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://slashsaas.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SlashSaaS',
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description: 'Modern software tools and multi-tenant workspace platform.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@slashsaas.com',
      contactType: 'customer support',
      availableLanguage: ['English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
};

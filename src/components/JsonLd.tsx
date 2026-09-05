import React from 'react';

export const JsonLd: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://slashsaas.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SlashSaaS',
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description:
      'AI search visibility monitoring — track how ChatGPT, Perplexity, Google AI and Gemini answer about your brand versus competitors over time.',
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
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: baseUrl,
    description:
      'Monitor your brand’s visibility inside AI assistant answers (ChatGPT, Perplexity, Google AI, Gemini): visibility score, share of voice vs competitors, citation sources, and change alerts. Public data only.',
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
    </>
  );
};

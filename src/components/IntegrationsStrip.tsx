'use client';

import React from 'react';

export const IntegrationsStrip: React.FC = () => {
  const integrations = [
    { name: 'Google Workspace', desc: 'SAML & OAuth login audit' },
    { name: 'Slack Enterprise', desc: '1-Click DM Nudge Bot' },
    { name: 'Figma', desc: 'Design seat telemetry' },
    { name: 'Notion', desc: 'Workspace seat sync' },
    { name: 'GitHub Copilot', desc: 'Developer seat tracking' },
    { name: 'Linear', desc: 'Issue tracker seat check' },
    { name: 'OpenAI ChatGPT', desc: 'Team & Enterprise AI seats' },
    { name: 'Microsoft 365', desc: 'Azure Entra ID SSO' },
  ];

  return (
    <div className="mt-16 pt-10 border-t border-white/[0.06] text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-6">
        Integrates with Your Core Startup Stack (Read-Only via API)
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
        {integrations.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-950/80 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-all shadow-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#8ce04a]" />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

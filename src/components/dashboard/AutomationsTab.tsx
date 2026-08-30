'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Bell, 
  MessageSquare, 
  Mail, 
  ShieldCheck, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import { AutomationRule } from '@/lib/types';
import { MOCK_AUTOMATION_RULES } from '@/lib/mockData';

export const AutomationsTab: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>(MOCK_AUTOMATION_RULES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextState = !r.enabled;
        setToastMessage(`Rule "${r.title}" is now ${nextState ? 'ENABLED' : 'DISABLED'}`);
        setTimeout(() => setToastMessage(null), 3000);
        return { ...r, enabled: nextState };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-400" />
            <span>Autonomous License Optimization Rules</span>
          </h3>
          <p className="text-xs text-zinc-400">
            GhostSpend runs background scans 24/7 and automatically initiates Slack DMs before licenses renew.
          </p>
        </div>

        <button
          onClick={() => {
            setToastMessage('New custom automation trigger created.');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="h-4 w-4 fill-zinc-950" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {toastMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`rounded-2xl border p-5 sm:p-6 transition-all ${
              rule.enabled
                ? 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                : 'border-zinc-850 bg-zinc-950/40 opacity-70'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${rule.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                  <h4 className="text-base font-bold text-white">{rule.title}</h4>
                  <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 border border-zinc-800">
                    Trigger: {rule.triggerDays} Days Inactive
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed pl-5">
                  {rule.description}
                </p>
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-semibold text-zinc-400">
                  {rule.enabled ? 'Active' : 'Paused'}
                </span>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    rule.enabled ? 'bg-emerald-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-zinc-950 transition-transform ${
                      rule.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Rule Footer Info */}
            <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                Action: Automated Slack Bot DM with 1-Click Response Buttons
              </span>
              <span>Target: {rule.targetApps.join(', ').toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

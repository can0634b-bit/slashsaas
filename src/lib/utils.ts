import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getInactivityBadgeStyle(bucket: '30-59' | '60-89' | '90+'): { bg: string; text: string; label: string } {
  switch (bucket) {
    case '30-59':
      return { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: '30-59 Days Inactive' };
    case '60-89':
      return { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', label: '60-89 Days Inactive' };
    case '90+':
      return { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400', label: '90+ Days (Zombie)' };
  }
}

export function getNudgeStatusBadge(status: string): { bg: string; text: string; label: string } {
  switch (status) {
    case 'nudged':
      return { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'Nudge Sent' };
    case 'reclaimed':
      return { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'License Reclaimed' };
    case 'retained':
      return { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400', label: 'Confirmed Needed' };
    default:
      return { bg: 'bg-zinc-800/80 border-zinc-700/60', text: 'text-zinc-400', label: 'Action Required' };
  }
}

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'slate' | 'amber' | 'blue';
}

export default function MetricCard({ title, value, subtext, icon: Icon, variant = 'slate' }: MetricCardProps) {
  const themes = {
    slate: {
      bg: 'bg-slate-900/50',
      border: 'border-slate-800/80',
      iconBg: 'bg-slate-800/60',
      iconColor: 'text-slate-400',
      accent: 'border-t-slate-700',
    },
    emerald: {
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      accent: 'border-t-emerald-500/40',
    },
    amber: {
      bg: 'bg-amber-950/20',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      accent: 'border-t-amber-500/40',
    },
    blue: {
      bg: 'bg-blue-950/20',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      accent: 'border-t-blue-500/40',
    },
  };

  const activeTheme = themes[variant];

  return (
    <div className={`relative flex items-center justify-between p-4 rounded-2xl border ${activeTheme.border} ${activeTheme.bg} shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-slate-700 group`}>
      {/* Decorative background pulse for premium visual depth */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-slate-800/10 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <div className="text-xl font-extrabold text-white font-mono leading-tight">
          {value}
        </div>
        <span className="text-[10px] text-slate-500 font-medium block">
          {subtext}
        </span>
      </div>

      <div className={`p-2.5 rounded-xl ${activeTheme.iconBg} ${activeTheme.iconColor} shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 stroke-[2]" />
      </div>
    </div>
  );
}

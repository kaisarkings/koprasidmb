import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose';
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'emerald',
  badgeText,
}) => {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-emerald-500 text-white',
      border: 'border-emerald-200 dark:border-emerald-800/60',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-blue-500 text-white',
      border: 'border-blue-200 dark:border-blue-800/60',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      iconBg: 'bg-amber-500 text-white',
      border: 'border-amber-200 dark:border-amber-800/60',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-500 text-white',
      border: 'border-purple-200 dark:border-purple-800/60',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      iconBg: 'bg-rose-500 text-white',
      border: 'border-rose-200 dark:border-rose-800/60',
    },
  };

  const selectedColor = colorClasses[colorScheme];

  return (
    <div
      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:shadow-md ${selectedColor.bg}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight truncate">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-2xl ${selectedColor.iconBg} shadow-md shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {badgeText && (
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{badgeText}</span>
        </div>
      )}
    </div>
  );
};

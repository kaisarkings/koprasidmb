export const getCardClass = (uiStyle: string) => {
  if (uiStyle === 'neo-brutalism') {
    return 'bg-white dark:bg-slate-900 border-[4px] border-black dark:border-slate-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(71,85,105,1)] rounded-xl overflow-hidden font-mono';
  }
  return 'bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative';
};

export const getCardPaddingClass = (uiStyle: string, padding: string = 'p-6') => {
  if (uiStyle === 'neo-brutalism') {
    return `bg-white dark:bg-slate-900 border-[4px] border-black dark:border-slate-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(71,85,105,1)] rounded-xl overflow-hidden font-mono ${padding}`;
  }
  return `bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative ${padding}`;
};

export const getHeaderClass = (uiStyle: string, color: string = 'cyan-400') => {
  if (uiStyle === 'neo-brutalism') {
    return `bg-${color} dark:bg-${color}/80 p-4 border-b-[4px] border-black dark:border-slate-600 font-black uppercase text-black`;
  }
  return 'hidden';
};

export const getButtonClass = (uiStyle: string, variant: 'primary' | 'secondary' | 'danger' | 'warning' = 'primary', additional: string = '') => {
  if (uiStyle === 'neo-brutalism') {
    const baseNeo = 'font-black uppercase flex items-center justify-center gap-2 border-[3px] border-black dark:border-slate-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(71,85,105,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(71,85,105,1)] active:translate-y-0 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[0px_0px_0px_0px_rgba(71,85,105,1)] transition-all rounded-xl';
    if (variant === 'danger') return `bg-rose-400 dark:bg-rose-500 text-black ${baseNeo} ${additional}`;
    if (variant === 'warning') return `bg-yellow-400 dark:bg-yellow-500 text-black ${baseNeo} ${additional}`;
    if (variant === 'secondary') return `bg-white dark:bg-slate-800 text-black dark:text-white ${baseNeo} ${additional}`;
    return `bg-emerald-400 dark:bg-emerald-500 text-black ${baseNeo} ${additional}`;
  }
    
  // Standard
  const baseStd = 'font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]';
  if (variant === 'danger') return `bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 ${baseStd} ${additional}`;
  if (variant === 'warning') return `bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 ${baseStd} ${additional}`;
  if (variant === 'secondary') return `bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${baseStd} ${additional}`;
  return `bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 ${baseStd} ${additional}`;
};

export const getInputClass = (uiStyle: string) => {
    if (uiStyle === 'neo-brutalism') {
        return 'w-full px-4 py-2 bg-white dark:bg-slate-800 border-[3px] border-black dark:border-slate-600 font-bold text-black dark:text-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(71,85,105,1)] rounded-xl transition-all';
    }
    return 'w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white transition-all';
};

export const getIconContainerClass = (uiStyle: string, color: string = 'emerald') => {
    if (uiStyle === 'neo-brutalism') {
        return `p-2 bg-white dark:bg-slate-800 border-[3px] border-black dark:border-slate-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(71,85,105,1)] rotate-3 text-black dark:text-white`;
    }
    return `p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`;
}

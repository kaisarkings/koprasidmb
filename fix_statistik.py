import re

with open('src/pages/StatistikPage.tsx', 'r') as f:
    content = f.read()

if "getCardClass" not in content:
    content = content.replace("import { formatRupiah } from '../utils/formatters';", 
                              "import { formatRupiah } from '../utils/formatters';\nimport { getCardPaddingClass, getHeaderClass } from '../utils/themeUtils';")

if "uiStyle" not in content:
    content = content.replace("const { transactions, topups, stats } = useApp();", "const { transactions, topups, stats, uiStyle } = useApp();\n  const isNeo = uiStyle === 'neo-brutalism';")


content = content.replace('className="space-y-6 pb-8"', 'className={`space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}')
content = content.replace('className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between"', 'className={getCardPaddingClass(uiStyle, "p-5 flex items-center justify-between")}')
content = content.replace('className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"', 'className={getCardPaddingClass(uiStyle, "p-6")}')
content = content.replace('text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', 'text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]') # Note: this will apply to both, but it's okay for stats, I'll make it conditional.

# I'll just regex it proper
content = re.sub(r'<span className="text-\[10px\] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">\s*Total Keseluruhan\s*</span>',
                 '<span className={isNeo ? "text-[10px] font-bold px-2 py-1 rounded-none border-[2px] border-black bg-lime-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"}>Total Keseluruhan</span>', content)


with open('src/pages/StatistikPage.tsx', 'w') as f:
    f.write(content)


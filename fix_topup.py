import re

with open('src/pages/TopUpPage.tsx', 'r') as f:
    content = f.read()

if "getCardPaddingClass" not in content:
    content = content.replace("import { formatRupiah } from '../utils/formatters';", 
                              "import { formatRupiah } from '../utils/formatters';\nimport { getCardPaddingClass, getCardClass, getButtonClass, getInputClass, getIconContainerClass, getHeaderClass } from '../utils/themeUtils';")

if "uiStyle" not in content:
    content = content.replace("const { students, transactions, topups, addTopUp, isLoading } = useApp();", "const { students, transactions, topups, addTopUp, isLoading, uiStyle } = useApp();\n  const isNeo = uiStyle === 'neo-brutalism';")

content = content.replace('className="space-y-6 pb-8"', 'className={`space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}')

content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative"',
                 r'className={getCardPaddingClass(uiStyle, "p-6 overflow-hidden relative")}', content)

content = re.sub(r'className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"',
                 r'className={`pl-9 ${getInputClass(uiStyle)}`}', content)
                 
content = re.sub(r'className="w-full px-3\.5 py-2\.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"',
                 r'className={getInputClass(uiStyle)}', content)
                 
content = re.sub(r'className="w-full px-3\.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"',
                 r'className={getInputClass(uiStyle)}', content)

content = re.sub(r'className="w-full py-3\.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-\[0\.98\] disabled:opacity-50 flex items-center justify-center gap-2"',
                 r'className={getButtonClass(uiStyle, "primary", "w-full py-3.5 text-sm")}', content)

content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"',
                 r'className={getCardClass(uiStyle)}', content)

with open('src/pages/TopUpPage.tsx', 'w') as f:
    f.write(content)


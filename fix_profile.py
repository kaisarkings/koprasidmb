import re

with open('src/pages/SantriDetailPage.tsx', 'r') as f:
    content = f.read()

if "getCardPaddingClass" not in content:
    content = content.replace("import { formatRupiah } from '../utils/formatters';", 
                              "import { formatRupiah } from '../utils/formatters';\nimport { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';")

if "uiStyle" not in content:
    content = content.replace("const { students, transactions, topups } = useApp();", "const { students, transactions, topups, uiStyle } = useApp();\n  const isNeo = uiStyle === 'neo-brutalism';")

content = content.replace('className="max-w-4xl mx-auto space-y-6 pb-8"', 'className={`max-w-4xl mx-auto space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}')

content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6"',
                 r'className={getCardPaddingClass(uiStyle, "p-6 flex flex-col md:flex-row items-center md:items-start gap-6")}', content)

content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"',
                 r'className={getCardPaddingClass(uiStyle, "p-5")}', content)

content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"',
                 r'className={getCardClass(uiStyle)}', content)

with open('src/pages/SantriDetailPage.tsx', 'w') as f:
    f.write(content)


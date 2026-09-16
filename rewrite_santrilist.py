import re

with open('src/pages/SantriListPage.tsx', 'r') as f:
    content = f.read()

# Add getCardClass etc
if "getCardPaddingClass" not in content:
    content = content.replace("import { getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';", 
                              "import { getCardClass, getCardPaddingClass, getButtonClass, getInputClass } from '../utils/themeUtils';")
    if "import { getCardPaddingClass" not in content:
        content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { getCardClass, getCardPaddingClass, getButtonClass, getInputClass } from '../utils/themeUtils';")

# Add uiStyle
if "uiStyle" not in content:
    content = content.replace("const { students, settings } = useApp();", "const { students, settings, uiStyle } = useApp();")

if "isNeo" not in content:
    content = content.replace("const isGuest = user?.role === 'guest';", "const isGuest = user?.role === 'guest';\n  const isNeo = uiStyle === 'neo-brutalism';")


# Standardize the search container classes
content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3"', 
                 'className={getCardPaddingClass(uiStyle, "p-4 space-y-3")}', content)


content = re.sub(r'className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"',
                 'className={`pl-9 ${getInputClass(uiStyle)}`}', content)
                 
content = re.sub(r'className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs appearance-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"',
                 'className={`pl-9 appearance-none ${getInputClass(uiStyle)}`}', content)


content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow"',
                 'className={getCardPaddingClass(uiStyle, "p-5 space-y-3 hover:shadow-md transition-shadow relative group cursor-pointer")}', content)


content = re.sub(r'className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-500/20"',
                 'className={getButtonClass(uiStyle, "primary", "px-4 py-2.5 text-xs")}', content)


content = re.sub(r'className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"',
                 'className={getButtonClass(uiStyle, "primary", "px-3 py-2 text-xs")}', content)

content = re.sub(r'className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"',
                 'className={getButtonClass(uiStyle, "secondary", "px-3 py-2 text-xs")}', content)
                 

content = re.sub(r'<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">',
                 '<div className={getCardClass(uiStyle)}>', content)


content = re.sub(r'className="flex-1 py-1\.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1\.5 shadow-sm"',
                 'className={getButtonClass(uiStyle, "primary", "flex-1 py-1.5 text-xs")}', content)

with open('src/pages/SantriListPage.tsx', 'w') as f:
    f.write(content)


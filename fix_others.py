import re
import glob

files = [
    'src/pages/SettingsPage.tsx', 
    'src/pages/UserManagementPage.tsx', 
    'src/pages/LaporanPage.tsx',
    'src/components/dashboard/QuickPOSWidget.tsx',
    'src/components/dashboard/TopSantriTable.tsx',
    'src/components/dashboard/CategoryPieChart.tsx',
    'src/components/dashboard/TransactionChart.tsx',
]

for file_path in files:
    try:
        with open(file_path, 'r') as f:
            content = f.read()

        if "getCardPaddingClass" not in content and "getCardClass" not in content:
            if "import { formatRupiah" in content:
                content = content.replace("import { formatRupiah } from '../utils/formatters';", 
                                      "import { formatRupiah } from '../utils/formatters';\nimport { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';")
            elif "import { useApp" in content:
                content = content.replace("import { useApp } from '../context/AppContext';", 
                                      "import { useApp } from '../context/AppContext';\nimport { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';")
            elif "import { useApp" in content.replace("../../context/AppContext", "../context/AppContext"):
                content = content.replace("import { useApp } from '../../context/AppContext';", 
                                      "import { useApp } from '../../context/AppContext';\nimport { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../../utils/themeUtils';")

        if "uiStyle" not in content:
            # Try to inject uiStyle into useApp()
            match = re.search(r'const \{([^}]+)\} = useApp\(\);', content)
            if match:
                inner = match.group(1)
                if "uiStyle" not in inner:
                    content = content.replace(match.group(0), f'const {{{inner}, uiStyle}} = useApp();\n  const isNeo = uiStyle === \'neo-brutalism\';')
            else:
                 content = content.replace("const isNeo = false;", "const { uiStyle } = useApp();\n  const isNeo = uiStyle === 'neo-brutalism';")


        content = content.replace('className="space-y-6 pb-8"', 'className={`space-y-6 pb-8 ${isNeo ? "font-mono" : ""}`}')

        # Card replacements
        content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative"',
                         r'className={getCardPaddingClass(uiStyle, "p-6 overflow-hidden relative")}', content)
        content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center"',
                         r'className={getCardPaddingClass(uiStyle, "p-6 flex flex-col items-center")}', content)
        content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6"',
                         r'className={getCardPaddingClass(uiStyle, "p-6 space-y-6")}', content)
        content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"',
                         r'className={getCardPaddingClass(uiStyle, "p-6")}', content)
        content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"',
                         r'className={getCardClass(uiStyle)}', content)
                         
        content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col gap-3"',
                         r'className={getCardPaddingClass(uiStyle, "p-5 flex flex-col gap-3")}', content)

        content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs"',
                         r'className={getCardPaddingClass(uiStyle, "p-5")}', content)
        content = re.sub(r'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm"',
                         r'className={getCardPaddingClass(uiStyle, "p-4 sm:p-6")}', content)


        # Inputs
        content = re.sub(r'className="w-full px-3\.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"',
                         r'className={getInputClass(uiStyle)}', content)
        content = re.sub(r'className="w-full px-3\.5 py-2\.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"',
                         r'className={getInputClass(uiStyle)}', content)
        content = re.sub(r'className="w-full px-3\.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"',
                         r'className={getInputClass(uiStyle)}', content)
        content = re.sub(r'className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"',
                         r'className={`pl-9 ${getInputClass(uiStyle)}`}', content)
        content = re.sub(r'className="w-full px-3\.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"',
                         r'className={getInputClass(uiStyle)}', content)

        with open(file_path, 'w') as f:
            f.write(content)
    except Exception as e:
        print(f"Error processing {file_path}: {e}")


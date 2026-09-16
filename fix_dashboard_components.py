import re

files = [
    'src/components/dashboard/QuickPOSWidget.tsx',
    'src/components/dashboard/TopSantriTable.tsx',
    'src/components/dashboard/CategoryPieChart.tsx',
    'src/components/dashboard/TransactionChart.tsx',
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove the injected uiStyle line if it was added
    content = re.sub(r'const \{([^}]+), uiStyle\} = useApp\(\);\n\s*const isNeo = uiStyle === \'neo-brutalism\';', 
                     r'const {\1} = useApp();', content)
    
    # Also fix where I added getCardPaddingClass
    # It was replacing: className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative"
    content = content.replace('{getCardPaddingClass(uiStyle, "p-6")}', '""')
    content = content.replace('{getCardPaddingClass(uiStyle, "p-6 flex flex-col items-center")}', '"flex flex-col items-center"')
    content = content.replace('{getCardPaddingClass(uiStyle, "p-6 space-y-6")}', '"space-y-6"')
    content = content.replace('{getCardPaddingClass(uiStyle, "p-6 overflow-hidden relative")}', '"overflow-hidden relative"')
    content = content.replace('{getCardPaddingClass(uiStyle, "p-0 overflow-hidden relative")}', '"overflow-hidden relative"')
    
    content = content.replace('{getCardPaddingClass(uiStyle, "p-5")}', '""')
    content = content.replace('{getCardClass(uiStyle)}', '""')

    # Revert input styles if any
    content = re.sub(r'className=\{getInputClass\(uiStyle\)\}', '"w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"', content)
    content = re.sub(r'className=\{`pl-9 \$\{getInputClass\(uiStyle\)\}`\}', '"w-full pl-9 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"', content)

    # Revert import if I added it
    content = re.sub(r"import \{ getCardPaddingClass, getCardClass, getButtonClass, getInputClass \} from '[^']+';\n", "", content)

    with open(file_path, 'w') as f:
        f.write(content)


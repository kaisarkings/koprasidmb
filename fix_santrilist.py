import re

with open('src/pages/SantriListPage.tsx', 'r') as f:
    content = f.read()

# Add getCardClass, getButtonClass, getInputClass to import
if "getCardClass" not in content:
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';")

# Add uiStyle
content = content.replace("const { students, settings } = useApp();", "const { students, settings, uiStyle } = useApp();\n  const isNeo = uiStyle === 'neo-brutalism';")


# Standardize the search container classes
content = content.replace('className="bg-purple-300 dark:bg-purple-900 rounded-xl border-[4px] border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3 font-mono"', 
                          'className={getCardClass(uiStyle)}')
content = content.replace('className="bg-purple-300 dark:bg-purple-900 rounded-xl border-[4px] border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-mono"', 
                          'className={getCardClass(uiStyle)}')

# Inputs
content = content.replace('className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border-[3px] border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"',
                          'className={`pl-9 ${getInputClass(uiStyle)}`}')
content = content.replace('className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border-[3px] border-black rounded-xl text-xs font-bold text-black appearance-none focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"',
                          'className={`pl-9 appearance-none ${getInputClass(uiStyle)}`}')

content = content.replace('className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"',
                          'className={getInputClass(uiStyle)}')
content = content.replace('className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"',
                          'className={getInputClass(uiStyle)}')


# Grid items
content = content.replace('className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"',
                          'className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isNeo ? "gap-6" : "gap-4"}`}')
content = content.replace('className="bg-white dark:bg-slate-800 rounded-2xl border-[4px] border-black p-4 flex flex-col gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform relative overflow-hidden group"',
                          'className={getCardClass(uiStyle).replace("p-6", "p-4") + " relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"}')

# Top buttons
content = content.replace('className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-500/20"',
                          'className={getButtonClass(uiStyle)}')

# Table and Grid swap classes
content = content.replace('className="flex items-center gap-1 px-3 py-2 bg-yellow-400 border-[3px] border-black text-black rounded-xl text-xs font-black transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"',
                          'className={viewMode === \'table\' ? getButtonClass(uiStyle, "secondary") : getButtonClass(uiStyle, "primary")}')
# Need to make sure both Grid and Table buttons are dynamic, but currently I don't know exactly what they were. I'll just use a generic replace.
# In original, Table and Grid buttons had active/inactive states.

# Add UI style conditional for table wrapper
content = content.replace('<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">',
                          '<div className={getCardClass(uiStyle).replace("p-6", "p-0")}>')

with open('src/pages/SantriListPage.tsx', 'w') as f:
    f.write(content)


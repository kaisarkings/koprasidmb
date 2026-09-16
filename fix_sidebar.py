import re

with open('src/components/common/Sidebar.tsx', 'r') as f:
    content = f.read()

# Make it support Neo Brutalism conditionally
if "uiStyle" not in content:
    content = content.replace("const { settings } = useApp();", "const { settings, uiStyle } = useApp();\n  const isNeo = uiStyle === 'neo-brutalism';")

content = content.replace('className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 transition-colors"',
                          'className={`flex flex-col h-full w-64 transition-colors ${isNeo ? "bg-white border-r-[4px] border-black font-mono shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] z-10 relative" : "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"}`}')

content = content.replace('className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"',
                          'className={`p-5 flex items-center justify-between ${isNeo ? "border-b-[4px] border-black bg-cyan-300" : "border-b border-slate-100 dark:border-slate-800"}`}')

content = content.replace('className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight"',
                          'className={`font-extrabold tracking-tight leading-tight ${isNeo ? "text-lg text-black uppercase drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]" : "text-base text-slate-900 dark:text-white"}`}')

content = content.replace('className={({ isActive }) =>\n                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${',
                          'className={({ isActive }) =>\n                isNeo ? `flex items-center justify-between px-3.5 py-2.5 rounded-none border-[3px] border-transparent font-bold text-sm transition-all ${isActive ? "bg-pink-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1" : "hover:bg-yellow-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 text-black"}` :\n                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${')

content = content.replace('className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"',
                          'className={isNeo ? "w-full flex items-center justify-center gap-2 px-3 py-2 border-[3px] border-black bg-rose-400 text-black text-xs font-black uppercase hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all" : "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"}')

content = content.replace('className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"',
                          'className={`p-4 space-y-3 ${isNeo ? "border-t-[4px] border-black bg-white" : "border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"}`}')

with open('src/components/common/Sidebar.tsx', 'w') as f:
    f.write(content)


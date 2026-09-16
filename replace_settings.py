import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

# Remove unused states
content = re.sub(r'const \[selectedColorTheme.*?;', '', content, flags=re.DOTALL)
content = re.sub(r'const \[selectedDarkVariant.*?;', '', content, flags=re.DOTALL)
content = re.sub(r'setColorTheme\(selectedColorTheme\);', '', content)
content = re.sub(r'setDarkModeVariant\(selectedDarkVariant\);', '', content)

replacement_section = """
              {/* SECTION: Kustomisasi Tema & UI Style */}
              <div className="sm:col-span-2 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Kustomisasi Mode Layar
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Atur pencahayaan layar terang atau gelap.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {themeMode === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{themeMode === 'dark' ? 'Mode Gelap' : 'Mode Terang'}</span>
                  </button>
                </div>
              </div>
            </div>
"""

content = re.sub(r'\{\/\* SECTION: Kustomisasi Tema Warna & Varian Mode Gelap \*\/.*?<\/div>\s*<\/div>\s*<\/div>', replacement_section, content, flags=re.DOTALL)

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)


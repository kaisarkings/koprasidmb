import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

# Add highContrast to imports
content = content.replace("toggleTheme,\n    uiStyle", "toggleTheme,\n    uiStyle,\n    highContrast,\n    toggleHighContrast")

# Add the UI toggle for neo-brutalism and high contrast
toggle_html = """
              {/* UI Theme Customization Section */}
              <div className="sm:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Gaya Desain Aplikasi (UI)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ubah keseluruhan tata letak menjadi mode Neo Brutalism atau Standar.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleUIStyle}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      uiStyle === 'neo-brutalism' 
                        ? 'border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-600 dark:bg-purple-900/40 dark:text-purple-300' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{uiStyle === 'neo-brutalism' ? 'Neo Brutalism' : 'Standar'}</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Mode High Contrast (Keterbacaan Tinggi)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Gunakan warna super kontras (hitam/kuning/putih murni) agar lebih mudah dibaca.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleHighContrast}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      highContrast 
                        ? 'border-black bg-yellow-400 text-black' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{highContrast ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
"""

# Try to insert it before the toggleTheme button
if "toggleUIStyle" not in content:
    content = content.replace("toggleTheme,\n    uiStyle,", "toggleTheme,\n    uiStyle,\n    toggleUIStyle,\n    highContrast,\n    toggleHighContrast,")
    
    # Needs Eye and LayoutTemplate from lucide-react
    if "Eye," not in content:
        content = content.replace("Moon, Sun", "Moon, Sun, LayoutTemplate, Eye")
        
    content = content.replace(
        "              {/* Login Picture & Logo Customization */}",
        toggle_html + "\n              {/* Login Picture & Logo Customization */}"
    )

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)

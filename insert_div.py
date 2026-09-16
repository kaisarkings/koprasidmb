with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer\"""",
"""            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer\""""
)

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)

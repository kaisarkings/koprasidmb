import re

with open('src/utils/theme.ts', 'r') as f:
    content = f.read()

content = content.replace("export type UIStyleMode = 'standard' | 'neo-brutalism';", "export type UIStyleMode = 'standard' | 'neo-brutalism' | 'high-contrast';")

with open('src/utils/theme.ts', 'w') as f:
    f.write(content)


with open('src/context/AppContext.tsx', 'r') as f:
    content = f.read()

# Update toggleUIStyle cycle to include high-contrast? The prompt says: "Add a 'high-contrast' mode toggle in the SettingsPage that overrides the current theme... separate from the structural neo-brutalism aesthetic."
# This means high-contrast might be better implemented as a separate toggle (like highContrastMode: boolean) or added to UIStyleMode.
# If we add it to UIStyleMode, it's mutually exclusive with neo-brutalism. "separate from the structural neo-brutalism aesthetic" -> suggests it could be another aesthetic option, or a distinct override.
# Let's add it to UIStyleMode for simplicity, and modify toggleUIStyle? Actually, the prompt says "separate from the structural neo-brutalism aesthetic" and "overrides the current theme".
# Let's see what `toggleUIStyle` does.
# Wait, "Add a 'high-contrast' mode toggle in the SettingsPage"

import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("  , uiStyle} = useApp();", "} = useApp();")
content = content.replace("toggleTheme,", "toggleTheme,\n    uiStyle")

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)

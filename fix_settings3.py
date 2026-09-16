import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("    highContrast,\n    toggleHighContrast,\n    highContrast,\n    toggleHighContrast,", "    highContrast,\n    toggleHighContrast,")

if "Eye" not in content and "LayoutTemplate" not in content:
    content = content.replace("import {", "import { Eye, LayoutTemplate,")

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)


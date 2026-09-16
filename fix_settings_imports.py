import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

# Fix duplicates in SettingsPage
content = content.replace("    highContrast,\n    toggleHighContrast,\n    highContrast,\n    toggleHighContrast,", "    highContrast,\n    toggleHighContrast,")

# In case it looks different
content = re.sub(r'highContrast,\n\s*toggleHighContrast,\n\s*highContrast,\n\s*toggleHighContrast,', 'highContrast,\n    toggleHighContrast,', content)

# Check imports for Eye and LayoutTemplate
if "Eye" not in content and "LayoutTemplate" not in content:
    content = content.replace("import {", "import { Eye, LayoutTemplate,")

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)


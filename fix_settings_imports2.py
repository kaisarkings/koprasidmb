import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("    toggleUIStyle,\n    highContrast,\n    toggleHighContrast,\n    highContrast,\n    toggleHighContrast} = useApp();", "    toggleUIStyle,\n    highContrast,\n    toggleHighContrast\n} = useApp();")

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)

with open('src/pages/DashboardPage.tsx', 'r') as f:
    content = f.read()

if "getCardPaddingClass" not in content:
    content = content.replace("import { getCardClass, getHeaderClass } from '../utils/themeUtils';", "import { getCardPaddingClass, getCardClass, getHeaderClass } from '../utils/themeUtils';")
elif "import { getCardClass" in content and "getCardPaddingClass" not in content[:500]:
    content = content.replace("import { getCardClass, getHeaderClass }", "import { getCardPaddingClass, getCardClass, getHeaderClass }")
else:
    # Check if getCardPaddingClass is imported
    pass

with open('src/pages/DashboardPage.tsx', 'w') as f:
    f.write(content)



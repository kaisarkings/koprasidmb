import re

with open('src/pages/RiwayatPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("const { transactions, topups, searchQuery, setSearchQuery, showToast, refreshData } = useApp();", "const { transactions, topups, searchQuery, setSearchQuery, showToast, refreshData, uiStyle } = useApp();\n  const isNeo = uiStyle === 'neo-brutalism';")
content = content.replace("import { getCardPaddingClass, getCardClass, getButtonClass } from '../utils/themeUtils';", "import { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';")

# Just make sure getInputClass is imported
if "getInputClass" not in content and "getCardPaddingClass" in content:
    content = content.replace("import { getCardPaddingClass, getCardClass, getButtonClass }", "import { getCardPaddingClass, getCardClass, getButtonClass, getInputClass }")

with open('src/pages/RiwayatPage.tsx', 'w') as f:
    f.write(content)


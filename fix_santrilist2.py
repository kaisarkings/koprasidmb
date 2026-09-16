import re

with open('src/pages/SantriListPage.tsx', 'r') as f:
    content = f.read()

if "import { getCardClass" not in content:
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';")
    
content = content.replace("const { students, searchQuery, setSearchQuery, showToast, refreshData, settings } = useApp();", "const { students, searchQuery, setSearchQuery, showToast, refreshData, settings, uiStyle } = useApp();\n  const isNeo = uiStyle === 'neo-brutalism';")

with open('src/pages/SantriListPage.tsx', 'w') as f:
    f.write(content)


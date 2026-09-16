import re

with open('src/pages/SantriListPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useNavigate, Link } from 'react-router-dom';", "import { useNavigate, Link } from 'react-router-dom';\nimport { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';")

with open('src/pages/SantriListPage.tsx', 'w') as f:
    f.write(content)

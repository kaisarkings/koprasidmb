import re

with open('src/pages/RiwayatPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { formatRupiah, formatDateTime } from '../utils/formatters';", "import { formatRupiah, formatDateTime } from '../utils/formatters';\nimport { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';")

with open('src/pages/RiwayatPage.tsx', 'w') as f:
    f.write(content)

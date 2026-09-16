import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "} from 'lucide-react';",
    "  Eye,\n  LayoutTemplate,\n} from 'lucide-react';"
)

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)


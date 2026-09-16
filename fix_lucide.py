import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { Moon, Sun, Save, Download, Upload, ShieldCheck, Database, Server, Image as ImageIcon } from 'lucide-react';",
    "import { Moon, Sun, Save, Download, Upload, ShieldCheck, Database, Server, Image as ImageIcon, Eye, LayoutTemplate } from 'lucide-react';"
)

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)


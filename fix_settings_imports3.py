import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'highContrast,\n\s*toggleHighContrast,\n\s*highContrast,\n\s*toggleHighContrast',
    'highContrast,\n    toggleHighContrast',
    content
)

# And missing imports: Eye, LayoutTemplate
if 'Eye' not in content:
    content = content.replace("import { ", "import { Eye, LayoutTemplate, ")
elif 'Eye,' not in content:
    content = content.replace("import { Moon, Sun }", "import { Moon, Sun, Eye, LayoutTemplate }")

# Just to be sure, using regex for imports
if "import { Eye" not in content and "Eye," not in content:
    content = re.sub(r'import \{ ([^}]+) \} from \'lucide-react\';', r'import { \1, Eye, LayoutTemplate } from \'lucide-react\';', content)

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)


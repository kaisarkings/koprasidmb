import re

with open('src/context/AppContext.tsx', 'r') as f:
    content = f.read()

content = content.replace("        toggleHighContrast,\n        themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {", "  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {")

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(content)


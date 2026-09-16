import re

with open('src/context/AppContext.tsx', 'r') as f:
    content = f.read()

# Fix duplicates in AppContext
content = content.replace(
    "const [highContrast,        toggleHighContrast,        themeMode, setThemeMode] = useState<'light' | 'dark'>",
    "const [themeMode, setThemeMode] = useState<'light' | 'dark'>"
)

content = content.replace(
    "[highContrast,        toggleHighContrast,        themeMode, uiStyle, highContrast]",
    "[themeMode, uiStyle, highContrast]"
)

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(content)

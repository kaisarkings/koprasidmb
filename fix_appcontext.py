import re

with open('src/context/AppContext.tsx', 'r') as f:
    content = f.read()

# Add highContrast state
if "highContrast" not in content:
    content = content.replace("interface AppContextType {", "interface AppContextType {\n  highContrast: boolean;\n  toggleHighContrast: () => void;")
    content = content.replace("const [hasUnsyncedData, setHasUnsyncedData] = useState<boolean>(false);", "const [hasUnsyncedData, setHasUnsyncedData] = useState<boolean>(false);\n  const [highContrast, setHighContrast] = useState<boolean>(() => localStorage.getItem('koperasi_high_contrast') === 'true');")
    
    toggle_hc = """
  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem('koperasi_high_contrast', String(next));
      return next;
    });
  }, []);
"""
    content = content.replace("const toggleTheme = useCallback(() => {", toggle_hc + "\n  const toggleTheme = useCallback(() => {")
    
    # Add to useEffect root classes
    content = content.replace("if (uiStyle === 'neo-brutalism') {", "if (highContrast) {\n      root.classList.add('high-contrast');\n    } else {\n      root.classList.remove('high-contrast');\n    }\n\n    if (uiStyle === 'neo-brutalism') {")
    content = content.replace("[themeMode, uiStyle]);", "[themeMode, uiStyle, highContrast]);")
    
    # Add to provider
    content = content.replace("themeMode,", "highContrast,\n        toggleHighContrast,\n        themeMode,")

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(content)


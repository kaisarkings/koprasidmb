import re

for file_path in ['src/pages/TopUpPage.tsx', 'src/pages/TransaksiJajanPage.tsx']:
    with open(file_path, 'r') as f:
        content = f.read()
    
    match = re.search(r'const \{([^}]+)\} = useApp\(\);', content)
    if match:
        inner = match.group(1)
        if "uiStyle" not in inner:
            content = content.replace(match.group(0), f'const {{{inner}, uiStyle}} = useApp();\n  const isNeo = uiStyle === \'neo-brutalism\';')
            
    with open(file_path, 'w') as f:
        f.write(content)


import re

with open('src/context/AppContext.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const [highContrast,\n", "")

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(content)


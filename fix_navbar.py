import re

with open('src/components/common/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace("topups.forEach((tp) => {", "(topups || []).forEach((tp) => {")
content = content.replace("transactions.forEach((tr) => {", "(transactions || []).forEach((tr) => {")

with open('src/components/common/Navbar.tsx', 'w') as f:
    f.write(content)

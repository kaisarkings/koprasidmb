import re

with open('src/context/AppContext.tsx', 'r') as f:
    content = f.read()

# Fix duplicates in AppContext
# Look for duplicates of highContrast and toggleHighContrast in AppContext.tsx

# Because I used string replace, it probably replaced multiple occurrences or I ran it twice. Let's reset it to be safe or parse and fix.
# Let's just find and remove duplicates manually by seeing the file contents


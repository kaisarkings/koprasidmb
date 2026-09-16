import re

with open('src/pages/DashboardPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("<TopSantriTable />", "<TopSantriTable topSantri={topSantri || []} />")

with open('src/pages/DashboardPage.tsx', 'w') as f:
    f.write(content)

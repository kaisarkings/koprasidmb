import re
import os

files_to_check = [
    'src/components/dashboard/CategoryPieChart.tsx',
    'src/components/dashboard/TransactionChart.tsx',
    'src/pages/RiwayatPage.tsx',
    'src/pages/SantriDetailPage.tsx',
    'src/pages/StatistikPage.tsx'
]

for file in files_to_check:
    if os.path.exists(file):
        with open(file, 'r') as f:
            content = f.read()
        
        content = content.replace("transactions.forEach", "(transactions || []).forEach")
        content = content.replace("topups.forEach", "(topups || []).forEach")
        content = content.replace("studentTrxs.forEach", "(studentTrxs || []).forEach")
        content = content.replace("studentTopups.forEach", "(studentTopups || []).forEach")
        
        with open(file, 'w') as f:
            f.write(content)


import re

with open('src/pages/DashboardPage.tsx', 'r') as f:
    content = f.read()

# Fix the QuickPOS widget wrapper
content = re.sub(
    r'<div className=\{getCardClass\(uiStyle\)\}>\n\s*<h2 className=\{isNeo',
    r'<div className={getCardPaddingClass(uiStyle, "p-6 overflow-hidden relative")}>\n              <h2 className={isNeo',
    content
)

# Fix the TransactionChart wrapper
content = re.sub(
    r'<div className=\{getCardClass\(uiStyle\) \+ \(isNeo \? " p-0" : ""\)\}>\n\s*<div className=\{getHeaderClass\(uiStyle, \'cyan-400\'\)\}>\n\s*<h2 className="text-xl font-black uppercase">📈 Grafik Transaksi</h2>\n\s*</div>',
    r'<div className={getCardPaddingClass(uiStyle, isNeo ? "p-0" : "p-6")}>\n             <div className={getHeaderClass(uiStyle, "cyan-400")}>\n              <h2 className="text-xl font-black uppercase">📈 Grafik Transaksi</h2>\n             </div>',
    content
)

# Fix Top Santri wrapper
content = re.sub(
    r'<div className=\{getCardClass\(uiStyle\) \+ \(isNeo \? " p-0" : ""\)\}>\n\s*<div className=\{getHeaderClass\(uiStyle, \'rose-400\'\)\}>\n\s*<h2 className="text-lg font-black uppercase">🏆 Top Santri</h2>\n\s*</div>',
    r'<div className={getCardPaddingClass(uiStyle, isNeo ? "p-0" : "p-6 space-y-6")}>\n             <div className={getHeaderClass(uiStyle, "rose-400")}>\n              <h2 className="text-lg font-black uppercase">🏆 Top Santri</h2>\n             </div>',
    content
)

# Fix Category Pie wrapper
content = re.sub(
    r'<div className=\{getCardClass\(uiStyle\) \+ \(isNeo \? " p-0" : ""\)\}>\n\s*<div className=\{getHeaderClass\(uiStyle, \'lime-400\'\)\}>\n\s*<h2 className="text-lg font-black uppercase">📊 Kategori Jajan</h2>\n\s*</div>',
    r'<div className={getCardPaddingClass(uiStyle, isNeo ? "p-0" : "p-6")}>\n             <div className={getHeaderClass(uiStyle, "lime-400")}>\n              <h2 className="text-lg font-black uppercase">📊 Kategori Jajan</h2>\n             </div>',
    content
)

# Check if we need to add getCardPaddingClass to imports
if 'getCardPaddingClass' not in content:
    content = content.replace("import { getCardClass, getHeaderClass } from '../utils/themeUtils';", "import { getCardPaddingClass, getCardClass, getHeaderClass } from '../utils/themeUtils';")

with open('src/pages/DashboardPage.tsx', 'w') as f:
    f.write(content)


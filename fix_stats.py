import re

with open('src/pages/DashboardPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("const { stats, topSantri, transactions, topups, settings, students } = useApp();", "const { stats, topSantri, transactions, topups, settings, students, isLoading } = useApp();\n  const safeStats = stats || { total_students: 0, active_students: 0, total_balance_all: 0, today_transactions_count: 0, today_income: 0, today_expense: 0, yesterday_income: 0, yesterday_expense: 0, this_month_expense: 0, this_month_topup: 0 };")

content = content.replace("stats.total_students", "safeStats.total_students")
content = content.replace("stats.active_students", "safeStats.active_students")
content = content.replace("stats.total_balance_all", "safeStats.total_balance_all")
content = content.replace("stats.today_transactions_count", "safeStats.today_transactions_count")
content = content.replace("stats.today_expense", "safeStats.today_expense")
content = content.replace("stats.today_income", "safeStats.today_income")

with open('src/pages/DashboardPage.tsx', 'w') as f:
    f.write(content)

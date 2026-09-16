import re

with open('src/pages/SantriDetailPage.tsx', 'r') as f:
    content = f.read()

# Make sure only non-guests can see top-up / print buttons
# We need to add `useAuth` if not already imported
if "useAuth" not in content:
    content = content.replace("import { useApp } from '../context/AppContext';", "import { useApp } from '../context/AppContext';\nimport { useAuth } from '../context/AuthContext';")
    content = content.replace("const { students, transactions, topups, settings } = useApp();", "const { students, transactions, topups, settings } = useApp();\n  const { user } = useAuth();")

# We should hide the "Isi Saldo Cepat" button for guests
content = content.replace("""<button
                onClick={() => setQuickTopUpStudent(student)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >""",
"""{user?.role !== 'guest' && (<button
                onClick={() => setQuickTopUpStudent(student)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >""")
content = content.replace("""Isi Saldo
              </button>""", """Isi Saldo
              </button>)}""")

with open('src/pages/SantriDetailPage.tsx', 'w') as f:
    f.write(content)

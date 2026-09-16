import re

with open('src/index.css', 'r') as f:
    content = f.read()

hc_css = """
/* High Contrast Mode Overrides */
html.high-contrast {
    --hc-bg: #ffffff;
    --hc-text: #000000;
    --hc-border: #000000;
    --hc-accent: #ffff00;
    --hc-primary: #0000ff;
    --hc-danger: #ff0000;
}

html.high-contrast.dark {
    --hc-bg: #000000;
    --hc-text: #ffffff;
    --hc-border: #ffffff;
    --hc-accent: #ffff00;
    --hc-primary: #5555ff;
    --hc-danger: #ff5555;
}

html.high-contrast body {
    background-color: var(--hc-bg) !important;
    color: var(--hc-text) !important;
}

html.high-contrast * {
    border-color: var(--hc-border) !important;
}

html.high-contrast .bg-white, 
html.high-contrast .dark\:bg-slate-900,
html.high-contrast .bg-slate-50,
html.high-contrast .dark\:bg-slate-800 {
    background-color: var(--hc-bg) !important;
}

html.high-contrast .text-slate-900,
html.high-contrast .dark\:text-white,
html.high-contrast .text-slate-500,
html.high-contrast .dark\:text-slate-400,
html.high-contrast .text-slate-600,
html.high-contrast .text-slate-700,
html.high-contrast .text-slate-800 {
    color: var(--hc-text) !important;
}

html.high-contrast .bg-emerald-600,
html.high-contrast .hover\:bg-emerald-700 {
    background-color: var(--hc-primary) !important;
    color: #ffffff !important;
}

html.high-contrast .bg-rose-600,
html.high-contrast .hover\:bg-rose-700,
html.high-contrast .bg-rose-500 {
    background-color: var(--hc-danger) !important;
    color: #ffffff !important;
}

html.high-contrast .text-emerald-600,
html.high-contrast .dark\:text-emerald-400,
html.high-contrast .text-emerald-500 {
    color: var(--hc-primary) !important;
}

html.high-contrast .text-rose-600,
html.high-contrast .dark\:text-rose-400,
html.high-contrast .text-rose-500 {
    color: var(--hc-danger) !important;
}

html.high-contrast .border {
    border: 2px solid var(--hc-border) !important;
}

html.high-contrast .shadow-sm,
html.high-contrast .shadow-md,
html.high-contrast .shadow-lg {
    box-shadow: none !important;
}

"""

if "html.high-contrast" not in content:
    with open('src/index.css', 'a') as f:
        f.write("\n" + hc_css)


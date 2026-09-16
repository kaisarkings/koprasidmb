import re

with open('src/components/common/Sidebar.tsx', 'r') as f:
    content = f.read()

# Update roles array to include guest for dashboard, data santri
content = content.replace("roles: ['admin', 'administrator'] },\n    { label: 'Data Santri', path: '/santri', icon: Users, roles: ['admin', 'administrator'] },", 
"roles: ['admin', 'administrator', 'guest'] },\n    { label: 'Data Santri', path: '/santri', icon: Users, roles: ['admin', 'administrator', 'guest'] },")

# Also let's update neo-brutalism design of the sidebar if possible.
# Actually, the user wants neo-brutalism for dashboard and login mostly, but I will make the Sidebar slightly neo-brutalism as well.
# We'll leave Sidebar as is or maybe just change its styling a bit? The user said "kalau neo brutalism itu kan rata-rata warna-warni... jangan terlalu kotak-kotak banget gitu".

with open('src/components/common/Sidebar.tsx', 'w') as f:
    f.write(content)

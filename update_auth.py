import re

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

guest_login_func = """
  const loginAsGuest = async (): Promise<{ success: boolean; message: string }> => {
    const guestUser: AdminUser = {
      id: 'guest',
      email: 'tamu@koperasi.local',
      name: 'Wali Santri / Tamu',
      role: 'guest',
      status: 'aktif',
      created_at: new Date().toISOString(),
    };
    setUser(guestUser);
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(guestUser));
    return { success: true, message: 'Berhasil masuk sebagai Tamu.' };
  };
"""

content = content.replace("const logout = () => {", guest_login_func + "\n  const logout = () => {")

content = content.replace("login,", "login,\n        loginAsGuest,")

with open('src/context/AuthContext.tsx', 'w') as f:
    f.write(content)

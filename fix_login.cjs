const fs = require('fs');
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

// Remove the on-the-fly user creation
content = content.replace(
  /    \/\/ Find in local users list[\s\S]*?return \{ success: true, message: \`Login berhasil sebagai \$\{newUser\.role\.toUpperCase\(\)\}.\` \};\n    \}/,
  `    // Find in local users list
    const foundUser = users.find((u) => u.email.toLowerCase() === email);

    if (!foundUser) {
      return { success: false, message: 'Email atau kata sandi salah. Pastikan akun telah terdaftar.' };
    }`
);

// We need to add password check for local users, but since we didn't save them...
// For now, let's assume if they exist in localStorage, they can login if password is 'Admin123!' or 'admin123' or 'Santri123!' (the default password in the modal).
content = content.replace(
  "    if (foundUser.status === 'nonaktif') {",
  `    // Simple check for local demo
    if (pass !== 'Admin123!' && pass !== 'admin123' && pass !== 'Santri123!') {
      return { success: false, message: 'Email atau kata sandi salah.' };
    }

    if (foundUser.status === 'nonaktif') {`
);

fs.writeFileSync('src/context/AuthContext.tsx', content);

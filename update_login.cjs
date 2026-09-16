const fs = require('fs');
let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

// Add import
content = content.replace(
  "import { Building2, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';",
  "import { Building2, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';\nimport { motion } from 'motion/react';"
);

// Wrap main content
content = content.replace(
  '<div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden">',
  '<motion.div \n        initial={{ opacity: 0, y: 20 }}\n        animate={{ opacity: 1, y: 0 }}\n        transition={{ duration: 0.5 }}\n        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden"\n      >'
);

content = content.replace(
  '        </form>\n      </div>',
  '        </form>\n      </motion.div>'
);

fs.writeFileSync('src/pages/LoginPage.tsx', content);

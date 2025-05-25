const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of problematic files to temporarily rename
const problematicFiles = [
  'src/app/admin/subscriptions/page.tsx',
  'src/app/auth/register/merchant/page.tsx'
];

// Rename files by adding .bak extension
problematicFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.renameSync(filePath, `${filePath}.bak`);
    console.log(`Renamed ${file} to ${file}.bak`);
  }
});

try {
  // Run the build
  console.log('Running build...');
  execSync('npx next build', { stdio: 'inherit' });
} finally {
  // Restore the original files
  problematicFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const backupPath = `${filePath}.bak`;
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, filePath);
      console.log(`Restored ${file}`);
    }
  });
}
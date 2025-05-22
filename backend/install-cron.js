const { execSync } = require('child_process');

try {
  console.log('Installing node-cron package...');
  execSync('npm install node-cron@3.0.2', { stdio: 'inherit' });
  console.log('node-cron package installed successfully!');
} catch (error) {
  console.error('Error installing node-cron package:', error);
}
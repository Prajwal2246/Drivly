const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'check-branch-name.sh');
const target = path.join(__dirname, '../.git/hooks/pre-push');

try {
  // Check if .git/hooks directory exists
  const hooksDir = path.dirname(target);
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    fs.chmodSync(target, '755');
    console.log('✅ Git pre-push branch name naming hook installed successfully.');
  } else {
    console.error('❌ Hook source script not found at:', source);
  }
} catch (error) {
  console.warn('⚠️ Could not copy pre-push git hook. Make sure you are inside a git repository.', error.message);
}

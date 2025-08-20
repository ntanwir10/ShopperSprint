const { execSync } = require('child_process');

try {
  console.log('Testing server startup...');
  execSync('npx tsx src/index.ts', { 
    stdio: 'inherit',
    timeout: 10000 
  });
} catch (error) {
  console.error('Server startup failed:', error.message);
}

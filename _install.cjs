const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '_install_log.txt');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
}

log('Starting install...');

try {
  // First check pnpm version
  const ver = execSync('pnpm --version', { encoding: 'utf8', timeout: 10000 }).trim();
  log('pnpm version: ' + ver);
} catch (e) {
  log('Error getting pnpm version: ' + e.message);
}

try {
  const result = execSync('pnpm install --no-frozen-lockfile', {
    cwd: __dirname,
    encoding: 'utf8',
    timeout: 180000,
    env: { ...process.env, FORCE_COLOR: '0', CI: '1' },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  log('STDOUT: ' + result);
  log('Install completed successfully');
} catch (e) {
  log('Install error code: ' + e.status);
  if (e.stdout) log('STDOUT: ' + e.stdout);
  if (e.stderr) log('STDERR: ' + e.stderr);
  log('Error message: ' + e.message);
}

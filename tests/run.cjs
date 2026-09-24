const { spawnSync } = require('node:child_process');
const path = require('node:path');
const commands = [['--test', 'tests/source-policy.test.cjs'], ['tests/check.cjs']];
if (process.argv.includes('--browser')) {
  commands[1].push('--browser');
  commands.push(['tests/mobile.cjs']);
}
for (const args of commands) {
  const result = spawnSync(process.execPath, args, { cwd:path.resolve(__dirname, '..'), stdio:'inherit' });
  if (result.error) console.error(result.error);
  if (result.status !== 0) process.exit(result.status || 1);
}

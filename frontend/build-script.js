const { spawn } = require('child_process');

// Set environment variable to disable treating warnings as errors
process.env.CI = 'false';
process.env.GENERATE_SOURCEMAP = 'false';

// Run the build
const build = spawn('npm', ['run', 'react-build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, CI: 'false', GENERATE_SOURCEMAP: 'false' }
});

build.on('close', (code) => {
  process.exit(code);
});
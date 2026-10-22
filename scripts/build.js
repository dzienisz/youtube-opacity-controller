// Packages the extension into dist/youtube-controls-<version>.zip.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const buildFiles = require('./build-files');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const distDir = path.join(root, 'dist');
const zipPath = path.join(distDir, `youtube-controls-${manifest.version}.zip`);

fs.mkdirSync(distDir, { recursive: true });
fs.rmSync(zipPath, { force: true });

execFileSync('zip', ['-r', zipPath, ...buildFiles, '-x', '*.DS_Store'], {
  cwd: root,
  stdio: 'inherit'
});

console.log(`Built ${path.relative(root, zipPath)}`);

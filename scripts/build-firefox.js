const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const buildFiles = require('./build-files');

const root = path.join(__dirname, '..');
const distDir = path.join(root, 'dist');
const firefoxDir = path.join(distDir, 'firefox');
const geckoId = '{37f85cef-c6f8-4dc8-979e-408fef7c843a}';

function buildManifest() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  manifest.background = { scripts: ['settings.js', 'background.js'] };
  manifest.browser_specific_settings = {
    gecko: {
      id: geckoId,
      strict_min_version: '128.0',
      data_collection_permissions: { required: ['none'] }
    }
  };
  return manifest;
}

function copyFiles() {
  fs.rmSync(firefoxDir, { recursive: true, force: true });
  fs.mkdirSync(firefoxDir, { recursive: true });

  for (const file of buildFiles) {
    if (file === 'manifest.json') continue;
    fs.cpSync(path.join(root, file), path.join(firefoxDir, file), {
      recursive: true,
      filter: source => path.basename(source) !== '.DS_Store'
    });
  }
}

function main() {
  const manifest = buildManifest();
  copyFiles();
  fs.writeFileSync(
    path.join(firefoxDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
  console.log(`Built ${path.relative(root, firefoxDir)}`);

  if (process.argv.includes('--zip')) {
    const zipPath = path.join(distDir, `youtube-controls-firefox-${manifest.version}.zip`);
    fs.rmSync(zipPath, { force: true });
    execFileSync('zip', ['-r', zipPath, '.', '-x', '*.DS_Store'], {
      cwd: firefoxDir,
      stdio: 'inherit'
    });
    console.log(`Built ${path.relative(root, zipPath)}`);
  }
}

module.exports = { geckoId };

if (require.main === module) main();

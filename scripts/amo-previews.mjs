import { createHmac, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import firefoxBuilder from './build-firefox.js';

const { geckoId } = firefoxBuilder;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const addonUrl = `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(geckoId)}/`;
const issuer = process.env.AMO_JWT_ISSUER;
const secret = process.env.AMO_JWT_SECRET;
const maxRequestAttempts = 5;
const captions = [
  'Strong contrast, a bigger progress bar and readable subtitles, all set from the popup',
  "Before and after: YouTube's see-through controls vs. recommended settings",
  'Bigger progress bar with a yellow, cyan or green highlight',
  'Keyboard shortcuts with on-player feedback',
  'Works in YouTube videos embedded on other sites'
];

function parseArguments(args) {
  const unknown = args.filter(arg => arg !== '--dry-run' && arg !== '--replace');
  if (unknown.length) {
    throw new Error(`Unknown argument(s): ${unknown.join(', ')}`);
  }

  return {
    dryRun: args.includes('--dry-run'),
    replace: args.includes('--replace')
  };
}

async function loadImages() {
  return Promise.all(captions.map(async (caption, index) => {
    const filename = `screenshot${index + 1}.png`;
    const relativePath = path.join('store-assets', filename);
    const filePath = path.join(root, relativePath);
    let image;

    try {
      image = await readFile(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Missing preview image: ${relativePath}`);
      }
      throw error;
    }

    return {
      filename,
      relativePath,
      image,
      position: index + 1,
      caption
    };
  }));
}

function printDryRun(images) {
  console.log(`Add-on URL: ${addonUrl}`);
  for (const item of images) {
    console.log(
      `${item.relativePath} (${item.image.length} bytes), position ${item.position}: "${item.caption}"`
    );
  }
}

function createJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: issuer,
    jti: randomUUID(),
    iat: now,
    exp: now + 60
  })).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

async function request(url, options = {}) {
  for (let attempt = 1; attempt <= maxRequestAttempts; attempt += 1) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `JWT ${createJwt()}`
      }
    });
    const body = await response.text();

    if (response.status === 429 && attempt < maxRequestAttempts) {
      const retryAfter = response.headers.get('Retry-After');
      const retryAfterSeconds = retryAfter === null ? NaN : Number(retryAfter);
      const bodyDelay = body.match(/available in (\d+) seconds/i);
      const delaySeconds = (
        Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0
          ? retryAfterSeconds
          : bodyDelay
            ? Number(bodyDelay[1])
            : 60
      ) + 2;

      console.log(`AMO throttled; retrying in ${delaySeconds}s`);
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      continue;
    }

    if (!response.ok) {
      throw new Error(`AMO request failed with status ${response.status}: ${body}`);
    }

    return body;
  }
}

function previewUrl(id) {
  return new URL(`previews/${encodeURIComponent(id)}/`, addonUrl);
}

async function uploadImages(images, replace) {
  if (!issuer || !secret) {
    throw new Error('AMO_JWT_ISSUER and AMO_JWT_SECRET are required to upload previews.');
  }

  const addon = JSON.parse(await request(addonUrl));
  const previews = addon.previews ?? [];
  if (!Array.isArray(previews)) {
    throw new Error('The AMO add-on response did not contain a previews list.');
  }

  if (previews.length && !replace) {
    console.log('Existing AMO previews:');
    console.log(JSON.stringify(previews, null, 2));
    throw new Error('AMO previews already exist; rerun with --replace to swap them.');
  }

  if (replace) {
    for (const preview of previews) {
      if (preview.id === undefined || preview.id === null) {
        throw new Error('An existing AMO preview is missing its id.');
      }
      await request(previewUrl(preview.id), { method: 'DELETE' });
    }
  }

  for (const item of images) {
    const form = new FormData();
    form.append('image', new Blob([item.image], { type: 'image/png' }), item.filename);
    form.append('position', String(item.position));

    const created = JSON.parse(await request(new URL('previews/', addonUrl), {
      method: 'POST',
      body: form
    }));
    if (created.id === undefined || created.id === null) {
      throw new Error(`AMO did not return an id for ${item.filename}.`);
    }

    await request(previewUrl(created.id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: { 'en-US': item.caption } })
    });
    console.log(`Uploaded ${item.filename} as AMO preview ${created.id}.`);
  }
}

async function main() {
  const { dryRun, replace } = parseArguments(process.argv.slice(2));
  const images = await loadImages();

  if (dryRun) {
    printDryRun(images);
    return;
  }

  await uploadImages(images, replace);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

export { request };

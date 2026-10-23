import assert from 'node:assert/strict';
import test from 'node:test';
import { getImagesToUpload, parseArguments } from '../scripts/amo-previews.mjs';

test('parses resume mode with dry-run', () => {
  assert.deepEqual(parseArguments(['--dry-run', '--resume']), {
    dryRun: true,
    replace: false,
    resume: true
  });
});

test('rejects resume and replace together', () => {
  assert.throws(
    () => parseArguments(['--resume', '--replace']),
    /--replace and --resume cannot be used together/
  );
});

test('resume uploads only screenshots after the existing preview prefix', () => {
  const images = Array.from({ length: 5 }, (_, index) => ({
    filename: `screenshot${index + 1}.png`,
    position: index + 1
  }));

  assert.deepEqual(getImagesToUpload(images, 1, true), images.slice(1));
  assert.deepEqual(getImagesToUpload(images, 0, true), images);
  assert.deepEqual(getImagesToUpload(images, 5, true), []);
  assert.equal(getImagesToUpload(images, 1, false), images);
});

test('resume rejects more previews than local screenshots', () => {
  const images = [{ filename: 'screenshot1.png' }];

  assert.throws(
    () => getImagesToUpload(images, 2, true),
    /more existing previews than there are local screenshots/
  );
});

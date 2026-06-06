import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { projectShiftAssetSpecs } from './project-shift-asset-spec.mjs';

function pngSize(buffer) {
  if (buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function webpSize(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3)
    };
  }
  if (chunk === 'VP8L' && buffer[20] === 0x2f) {
    const b1 = buffer[21];
    const b2 = buffer[22];
    const b3 = buffer[23];
    const b4 = buffer[24];
    return {
      width: 1 + (b1 | ((b2 & 0x3f) << 8)),
      height: 1 + ((b2 >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10))
    };
  }
  return null;
}

export function validateProjectShiftAssets(root) {
  const errors = [];
  const assetRoot = join(root, 'public', 'project-shift', 'assets');

  for (const spec of projectShiftAssetSpecs) {
    for (const extension of ['png', 'webp']) {
      const file = join(assetRoot, `${spec.path}.${extension}`);
      if (!existsSync(file)) {
        errors.push(`public/project-shift/assets/${spec.path}.${extension}: required asset is missing`);
        continue;
      }
      const buffer = readFileSync(file);
      const size = extension === 'png' ? pngSize(buffer) : webpSize(buffer);
      if (!size) {
        errors.push(`public/project-shift/assets/${spec.path}.${extension}: unsupported or corrupt image`);
        continue;
      }
      if (size.width !== spec.width || size.height !== spec.height) {
        errors.push(
          `public/project-shift/assets/${spec.path}.${extension}: expected ${spec.width}x${spec.height}, got ${size.width}x${size.height}`
        );
      }
    }
  }

  return errors;
}

if (import.meta.url === `file:///${process.argv[1]?.replaceAll('\\', '/')}`) {
  const errors = validateProjectShiftAssets(process.cwd());
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('Project SHIFT asset check passed.');
}

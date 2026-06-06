export const projectShiftAssetSpecs = [
  ...[
    'characters/player-astronaut',
    'characters/player-drone',
    'characters/player-explorer',
    'characters/player-geometric'
  ].map((path) => ({ path, format: 'raster', width: 512, height: 512 })),
  ...[
    'entities/box',
    'entities/box-on-target',
    'tiles/floor',
    'tiles/wall',
    'tiles/target'
  ].map((path) => ({ path, format: 'svg', viewBox: '0 0 64 64' }))
];

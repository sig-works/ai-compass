import type { ImgHTMLAttributes } from 'react';

export const PROJECT_SHIFT_ASSETS = {
  characters: {
    astronaut: 'characters/player-astronaut',
    drone: 'characters/player-drone',
    explorer: 'characters/player-explorer',
    geometric: 'characters/player-geometric'
  },
  entities: {
    cube: 'entities/cube',
    cubePowered: 'entities/cube-powered'
  },
  tiles: {
    floor: 'tiles/floor',
    wall: 'tiles/wall',
    goal: 'tiles/goal',
    goalActive: 'tiles/goal-active',
    exitClosed: 'tiles/exit-closed',
    exitOpen: 'tiles/exit-open',
    switchOff: 'tiles/switch-off',
    switchOn: 'tiles/switch-on',
    doorClosed: 'tiles/door-closed',
    doorOpen: 'tiles/door-open',
    warp: 'tiles/warp',
    ice: 'tiles/ice',
    oneWayUp: 'tiles/one-way-up',
    oneWayRight: 'tiles/one-way-right',
    oneWayDown: 'tiles/one-way-down',
    oneWayLeft: 'tiles/one-way-left'
  },
  ui: {
    undo: 'ui/undo',
    redo: 'ui/redo',
    restart: 'ui/restart',
    help: 'ui/help',
    stages: 'ui/stages',
    back: 'ui/back',
    check: 'ui/check',
    arrow: 'ui/arrow',
    lock: 'ui/lock',
    directionUp: 'ui/direction-up',
    directionRight: 'ui/direction-right',
    directionDown: 'ui/direction-down',
    directionLeft: 'ui/direction-left'
  },
  backgrounds: {
    gameSurface: 'backgrounds/game-surface'
  }
} as const;

export type ProjectShiftAssetPath =
  | (typeof PROJECT_SHIFT_ASSETS.characters)[keyof typeof PROJECT_SHIFT_ASSETS.characters]
  | (typeof PROJECT_SHIFT_ASSETS.entities)[keyof typeof PROJECT_SHIFT_ASSETS.entities]
  | (typeof PROJECT_SHIFT_ASSETS.tiles)[keyof typeof PROJECT_SHIFT_ASSETS.tiles]
  | (typeof PROJECT_SHIFT_ASSETS.ui)[keyof typeof PROJECT_SHIFT_ASSETS.ui]
  | (typeof PROJECT_SHIFT_ASSETS.backgrounds)[keyof typeof PROJECT_SHIFT_ASSETS.backgrounds];

const assetBase = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/project-shift/assets`;

export function projectShiftAssetUrl(asset: ProjectShiftAssetPath, extension: 'webp' | 'png') {
  return `${assetBase}/${asset}.${extension}`;
}

export function GameAsset({
  asset,
  alt = '',
  className,
  ...props
}: {
  asset: ProjectShiftAssetPath;
  alt?: string;
  className?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>) {
  return (
    <picture className={className}>
      <source srcSet={projectShiftAssetUrl(asset, 'webp')} type="image/webp" />
      <img src={projectShiftAssetUrl(asset, 'png')} alt={alt} {...props} />
    </picture>
  );
}

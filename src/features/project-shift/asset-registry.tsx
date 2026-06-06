import type { ImgHTMLAttributes } from 'react';

export const PROJECT_SHIFT_ASSETS = {
  characters: {
    astronaut: 'characters/player-astronaut',
    drone: 'characters/player-drone',
    explorer: 'characters/player-explorer',
    geometric: 'characters/player-geometric'
  },
  entities: {
    box: 'entities/box',
    boxOnTarget: 'entities/box-on-target'
  },
  tiles: {
    floor: 'tiles/floor',
    wall: 'tiles/wall',
    target: 'tiles/target'
  }
} as const;

export type ProjectShiftAssetPath =
  | (typeof PROJECT_SHIFT_ASSETS.characters)[keyof typeof PROJECT_SHIFT_ASSETS.characters]
  | (typeof PROJECT_SHIFT_ASSETS.entities)[keyof typeof PROJECT_SHIFT_ASSETS.entities]
  | (typeof PROJECT_SHIFT_ASSETS.tiles)[keyof typeof PROJECT_SHIFT_ASSETS.tiles];

const assetBase = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/project-shift/assets`;

export function projectShiftAssetUrl(asset: ProjectShiftAssetPath, extension: 'svg' | 'webp' | 'png') {
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
  if (!asset.startsWith('characters/')) {
    return <img className={className} src={projectShiftAssetUrl(asset, 'svg')} alt={alt} {...props} />;
  }

  return (
    <picture className={className}>
      <source srcSet={projectShiftAssetUrl(asset, 'webp')} type="image/webp" />
      <img src={projectShiftAssetUrl(asset, 'png')} alt={alt} {...props} />
    </picture>
  );
}

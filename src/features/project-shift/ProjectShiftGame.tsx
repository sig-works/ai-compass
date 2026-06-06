import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import {
  GameAsset,
  PROJECT_SHIFT_ASSETS,
  projectShiftAssetUrl,
  type ProjectShiftAssetPath
} from './asset-registry.tsx';
import {
  areGoalsPowered,
  commitMove,
  createHistory,
  createInitialState,
  getOpenDoorChannels,
  move,
  redo,
  undo
} from './engine.ts';
import { getStage, PROJECT_SHIFT_STAGES } from './stages.ts';
import {
  completeStage,
  createDefaultSave,
  parseSave,
  PROJECT_SHIFT_STORAGE_KEY,
  saveRun
} from './storage.ts';
import type { Direction, GameHistory, Position, ProjectShiftSave, StageDefinition, Tile } from './types.ts';

const DIRECTION_LABELS: Record<Direction, string> = {
  up: '上へ移動',
  down: '下へ移動',
  left: '左へ移動',
  right: '右へ移動'
};

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right'
};

const PROJECT_SHIFT_TUTORIAL_KEY = 'project-shift-tutorial-seen';
const PROJECT_SHIFT_AVATAR_KEY = 'project-shift-avatar';
type PlayerAvatar = 'astronaut' | 'drone' | 'explorer' | 'geometric';

const PLAYER_AVATARS: Array<{ id: PlayerAvatar; name: string; description: string }> = [
  { id: 'astronaut', name: 'ASTRONAUT', description: '小型宇宙服' },
  { id: 'drone', name: 'DRONE', description: '浮遊探索機' },
  { id: 'explorer', name: 'EXPLORER', description: 'フード型探索者' },
  { id: 'geometric', name: 'AVATAR', description: '幾何学アバター' }
];

type IconName = 'undo' | 'redo' | 'restart' | 'grid' | 'arrow' | 'lock' | 'check' | 'help' | 'back';

const ICON_ASSETS: Record<IconName, ProjectShiftAssetPath> = {
  undo: PROJECT_SHIFT_ASSETS.ui.undo,
  redo: PROJECT_SHIFT_ASSETS.ui.redo,
  restart: PROJECT_SHIFT_ASSETS.ui.restart,
  grid: PROJECT_SHIFT_ASSETS.ui.stages,
  arrow: PROJECT_SHIFT_ASSETS.ui.arrow,
  lock: PROJECT_SHIFT_ASSETS.ui.lock,
  check: PROJECT_SHIFT_ASSETS.ui.check,
  help: PROJECT_SHIFT_ASSETS.ui.help,
  back: PROJECT_SHIFT_ASSETS.ui.back
};

function Icon({ name }: { name: IconName }) {
  return <GameAsset asset={ICON_ASSETS[name]} className="ps-icon" aria-hidden="true" />;
}

function DirectionIcon({ direction }: { direction: Direction }) {
  const assets: Record<Direction, ProjectShiftAssetPath> = {
    up: PROJECT_SHIFT_ASSETS.ui.directionUp,
    right: PROJECT_SHIFT_ASSETS.ui.directionRight,
    down: PROJECT_SHIFT_ASSETS.ui.directionDown,
    left: PROJECT_SHIFT_ASSETS.ui.directionLeft
  };
  return <GameAsset asset={assets[direction]} className="ps-direction-icon" aria-hidden="true" />;
}

type GuideIconName = 'player' | 'cube' | 'goal' | 'exit' | 'switch' | 'door' | 'oneWay' | 'warp' | 'ice' | 'history';

function playerAsset(avatar: PlayerAvatar): ProjectShiftAssetPath {
  return PROJECT_SHIFT_ASSETS.characters[avatar];
}

function GuideIcon({ name, avatar = 'astronaut' }: { name: GuideIconName; avatar?: PlayerAvatar }) {
  const assets: Record<Exclude<GuideIconName, 'player'>, ProjectShiftAssetPath> = {
    cube: PROJECT_SHIFT_ASSETS.entities.cube,
    goal: PROJECT_SHIFT_ASSETS.tiles.goal,
    exit: PROJECT_SHIFT_ASSETS.tiles.exitOpen,
    switch: PROJECT_SHIFT_ASSETS.tiles.switchOff,
    door: PROJECT_SHIFT_ASSETS.tiles.doorClosed,
    oneWay: PROJECT_SHIFT_ASSETS.tiles.oneWayRight,
    warp: PROJECT_SHIFT_ASSETS.tiles.warp,
    ice: PROJECT_SHIFT_ASSETS.tiles.ice,
    history: PROJECT_SHIFT_ASSETS.ui.undo
  };
  return (
    <GameAsset
      asset={name === 'player' ? playerAsset(avatar) : assets[name]}
      className={`ps-guide-icon ps-guide-icon--${name}`}
      aria-hidden="true"
    />
  );
}

function tileClass(tile: Tile, doorOpen: boolean, exitOpen: boolean) {
  return [
    'ps-cell',
    `ps-cell--${tile.kind.toLowerCase()}`,
    doorOpen ? 'ps-cell--open' : '',
    exitOpen ? 'ps-cell--powered' : ''
  ].filter(Boolean).join(' ');
}

function TileVisual({
  tile,
  doorOpen,
  exitOpen,
  occupied,
  active
}: {
  tile: Tile;
  doorOpen: boolean;
  exitOpen: boolean;
  occupied: boolean;
  active: boolean;
}) {
  let asset: ProjectShiftAssetPath = PROJECT_SHIFT_ASSETS.tiles.floor;
  if (tile.kind === 'wall') asset = PROJECT_SHIFT_ASSETS.tiles.wall;
  if (tile.kind === 'goal') asset = occupied ? PROJECT_SHIFT_ASSETS.tiles.goalActive : PROJECT_SHIFT_ASSETS.tiles.goal;
  if (tile.kind === 'exit') asset = exitOpen ? PROJECT_SHIFT_ASSETS.tiles.exitOpen : PROJECT_SHIFT_ASSETS.tiles.exitClosed;
  if (tile.kind === 'switch') asset = active ? PROJECT_SHIFT_ASSETS.tiles.switchOn : PROJECT_SHIFT_ASSETS.tiles.switchOff;
  if (tile.kind === 'door') asset = doorOpen ? PROJECT_SHIFT_ASSETS.tiles.doorOpen : PROJECT_SHIFT_ASSETS.tiles.doorClosed;
  if (tile.kind === 'warp') asset = PROJECT_SHIFT_ASSETS.tiles.warp;
  if (tile.kind === 'ice') asset = PROJECT_SHIFT_ASSETS.tiles.ice;
  if (tile.kind === 'oneWay') {
    asset = {
      up: PROJECT_SHIFT_ASSETS.tiles.oneWayUp,
      right: PROJECT_SHIFT_ASSETS.tiles.oneWayRight,
      down: PROJECT_SHIFT_ASSETS.tiles.oneWayDown,
      left: PROJECT_SHIFT_ASSETS.tiles.oneWayLeft
    }[tile.direction];
  }
  return <GameAsset asset={asset} className="ps-tile-art" aria-hidden="true" />;
}

function Entity({
  kind,
  position,
  powered = false,
  avatar = 'astronaut'
}: {
  kind: 'player' | 'cube';
  position: Position;
  powered?: boolean;
  avatar?: PlayerAvatar;
}) {
  const style = { '--ps-x': position.x, '--ps-y': position.y } as CSSProperties;
  const asset = kind === 'player'
    ? playerAsset(avatar)
    : powered
      ? PROJECT_SHIFT_ASSETS.entities.cubePowered
      : PROJECT_SHIFT_ASSETS.entities.cube;
  return (
    <div className={`ps-entity ps-entity--${kind}${powered ? ' ps-entity--powered' : ''}`} style={style}>
      <GameAsset asset={asset} className="ps-entity-art" aria-hidden="true" />
    </div>
  );
}

function Board({
  stage,
  history,
  onMove,
  avatar
}: {
  stage: StageDefinition;
  history: GameHistory;
  onMove: (direction: Direction) => void;
  avatar: PlayerAvatar;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const state = history.present;
  const openDoors = getOpenDoorChannels(stage, state);
  const exitOpen = areGoalsPowered(stage, state);
  const cubeAt = (x: number, y: number) => state.cubes.some((cube) => cube.x === x && cube.y === y);
  const goalAt = (position: Position) => {
    const tile = stage.tiles[position.y]?.[position.x];
    return tile?.kind === 'goal' || (tile?.kind === 'switch' && tile.goal);
  };
  const style = {
    '--ps-cols': stage.width,
    '--ps-rows': stage.height,
    '--ps-board-ratio': `${stage.width} / ${stage.height}`
  } as CSSProperties;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !window.matchMedia('(max-width: 760px)').matches) return;

    frame.scrollLeft = 0;
    const focusPlayer = window.requestAnimationFrame(() => {
      const player = frame.querySelector<HTMLElement>('.ps-entity--player');
      if (!player || frame.scrollWidth <= frame.clientWidth) return;
      frame.scrollLeft = Math.max(0, player.offsetLeft - (frame.clientWidth - player.offsetWidth) / 2);
    });

    return () => window.cancelAnimationFrame(focusPlayer);
  }, [stage.id]);

  return (
    <div className="ps-board-frame" ref={frameRef}>
      <div className="ps-board" style={style} role="img" aria-label={`${stage.name} のゲーム盤`}>
        <div className="ps-board-grid">
          {stage.tiles.flatMap((row, y) =>
            row.map((tile, x) => {
              const doorOpen = tile.kind === 'door' && openDoors.has(tile.channel);
              const deltaX = x - state.player.x;
              const deltaY = y - state.player.y;
              const candidateDirection =
                deltaX === 1 && deltaY === 0 ? 'right' :
                deltaX === -1 && deltaY === 0 ? 'left' :
                deltaX === 0 && deltaY === 1 ? 'down' :
                deltaX === 0 && deltaY === -1 ? 'up' :
                null;
              const direction = candidateDirection && move(stage, state, candidateDirection).changed
                ? candidateDirection
                : null;
              return (
                <button
                  className={[
                    tileClass(tile, doorOpen, tile.kind === 'exit' && exitOpen),
                    direction ? 'ps-cell--adjacent' : ''
                  ].filter(Boolean).join(' ')}
                  type="button"
                  disabled={!direction}
                  onClick={() => direction && onMove(direction)}
                  aria-label={direction ? `${DIRECTION_LABELS[direction]}：${tile.kind}` : undefined}
                  tabIndex={direction ? 0 : -1}
                  key={`${x}-${y}`}
                >
                  <TileVisual
                    tile={tile}
                    doorOpen={doorOpen}
                    exitOpen={exitOpen}
                    occupied={cubeAt(x, y)}
                    active={tile.kind === 'switch' && openDoors.has(tile.channel)}
                  />
                </button>
              );
            })
          )}
        </div>
        {state.cubes.map((cube, index) => (
          <Entity kind="cube" position={cube} powered={goalAt(cube)} key={`cube-${index}`} />
        ))}
        <Entity kind="player" position={state.player} avatar={avatar} />
      </div>
    </div>
  );
}

function StageSelect({
  save,
  activeStage,
  onSelect,
  onClose
}: {
  save: ProjectShiftSave;
  activeStage: StageDefinition;
  onSelect: (stage: StageDefinition) => void;
  onClose: () => void;
}) {
  const [selectedTier, setSelectedTier] = useState(activeStage.tier);
  const tiers = Array.from({ length: 10 }, (_, index) => index + 1);
  const visibleStages = PROJECT_SHIFT_STAGES.filter((stage) => stage.tier === selectedTier);

  return (
    <div className="ps-overlay" role="dialog" aria-modal="true" aria-labelledby="ps-stage-select-title">
      <div className="ps-modal ps-modal--wide">
        <div className="ps-modal-head">
          <div>
            <span className="ps-eyebrow">100 STAGES / 10 TIERS</span>
            <h2 className="ps-modal-title" id="ps-stage-select-title">ステージ選択</h2>
          </div>
          <button className="ps-close-button" type="button" onClick={onClose} aria-label="閉じる">×</button>
        </div>
        <div className="ps-tier-tabs" aria-label="Tier選択">
          {tiers.map((tier) => {
            const locked = (tier - 1) * 10 + 1 > save.unlocked;
            return (
              <button
                className={tier === selectedTier ? 'ps-tier-tab ps-tier-tab--active' : 'ps-tier-tab'}
                type="button"
                disabled={locked}
                onClick={() => setSelectedTier(tier)}
                key={tier}
              >
                <span>TIER</span>
                <strong>{String(tier).padStart(2, '0')}</strong>
                {locked && <Icon name="lock" />}
              </button>
            );
          })}
        </div>
        <div className="ps-stage-grid">
          {visibleStages.map((stage) => {
            const locked = stage.number > save.unlocked;
            const best = save.bestMoves[stage.id];
            const localNumber = ((stage.number - 1) % 10) + 1;
            return (
              <button
                className={[
                  'ps-stage-card',
                  activeStage.id === stage.id ? 'ps-stage-card--active' : '',
                  locked ? 'ps-stage-card--locked' : ''
                ].filter(Boolean).join(' ')}
                type="button"
                disabled={locked}
                onClick={() => onSelect(stage)}
                key={stage.id}
              >
                <span className="ps-stage-number">{String(localNumber).padStart(2, '0')}</span>
                <span className="ps-stage-card-copy">
                  <strong className="ps-stage-card-name">{stage.name}</strong>
                  <span className="ps-stage-card-meta">{best ? `BEST ${best} MOVES` : locked ? 'LOCKED' : 'UNSOLVED'}</span>
                </span>
                {locked ? <Icon name="lock" /> : best ? <Icon name="check" /> : <Icon name="arrow" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Tutorial({ avatar, onClose }: { avatar: PlayerAvatar; onClose: () => void }) {
  const mechanics = [
    { icon: 'player', title: '移動とボックス', description: '方向キー・WASD・画面下の方向パッドで移動します。ボックスは押せますが、引くことはできません。' },
    { icon: 'goal', title: 'ターゲットと出口', description: 'すべてのボックスをターゲットへ置くと出口が開きます。その後、プレイヤーが出口へ入るとクリアです。' },
    { icon: 'switch', title: '圧力スイッチとドア', description: 'プレイヤーかボックスがスイッチに載っている間だけ、同じ系統のドアが開きます。離れると閉じます。' },
    { icon: 'oneWay', title: '一方通行フィールド', description: '矢印と同じ方向にだけ進入・通過できます。入る前に戻り道とボックスの位置を確認してください。' },
    { icon: 'warp', title: 'ワープゲート', description: '同じ番号のゲート同士が接続されています。プレイヤーとボックスの両方が転送されます。' },
    { icon: 'ice', title: '氷床', description: '氷床へ入ると、壁や障害物に当たるまで同じ方向へ滑ります。滑走全体で1手です。' },
    { icon: 'history', title: 'Undo / Redo', description: 'UNDOで1手戻し、REDOで戻した操作をやり直せます。RESTARTではステージ開始時へ戻ります。' }
  ] satisfies Array<{ icon: GuideIconName; title: string; description: string }>;

  return (
    <div className="ps-overlay" role="dialog" aria-modal="true" aria-labelledby="ps-tutorial-title">
      <div className="ps-modal ps-tutorial-modal">
        <div className="ps-modal-head">
          <div>
            <span className="ps-eyebrow">HOW TO PLAY</span>
            <h2 className="ps-modal-title" id="ps-tutorial-title">ルールとギミック</h2>
          </div>
          <button className="ps-close-button" type="button" onClick={onClose} aria-label="閉じる">×</button>
        </div>

        <p className="ps-tutorial-goal">
          ボックスを動かして盤面の装置を起動し、最後にプレイヤーを出口まで導く思考型パズルです。
        </p>

        <div className="ps-mechanic-guide">
          {mechanics.map(({ icon, title, description }) => (
            <article className="ps-mechanic-guide-item" key={title}>
              <GuideIcon name={icon} avatar={avatar} />
              <span>
                <strong className="ps-tutorial-step-title">{title}</strong>
                <small>{description}</small>
              </span>
            </article>
          ))}
        </div>

        <button className="ps-primary-button" type="button" onClick={onClose}>
          ゲームへ戻る <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}

function AvatarSelect({
  selected,
  onSelect,
  onClose
}: {
  selected: PlayerAvatar;
  onSelect: (avatar: PlayerAvatar) => void;
  onClose: () => void;
}) {
  return (
    <div className="ps-overlay" role="dialog" aria-modal="true" aria-labelledby="ps-avatar-title">
      <div className="ps-modal ps-avatar-modal">
        <div className="ps-modal-head">
          <div>
            <span className="ps-eyebrow">PLAYER SELECT</span>
            <h2 className="ps-modal-title" id="ps-avatar-title">プレイヤーを選択</h2>
          </div>
          <button className="ps-close-button" type="button" onClick={onClose} aria-label="閉じる">×</button>
        </div>
        <div className="ps-avatar-grid">
          {PLAYER_AVATARS.map((avatar) => (
            <button
              className={avatar.id === selected ? 'ps-avatar-card ps-avatar-card--selected' : 'ps-avatar-card'}
              type="button"
              onClick={() => onSelect(avatar.id)}
              key={avatar.id}
            >
              <span className="ps-avatar-preview">
                <GameAsset asset={playerAsset(avatar.id)} className="ps-entity-art" aria-hidden="true" />
              </span>
              <strong>{avatar.name}</strong>
              <small>{avatar.description}</small>
              {avatar.id === selected && <span className="ps-avatar-selected"><Icon name="check" /></span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectShiftGame() {
  const [save, setSave] = useState<ProjectShiftSave>(createDefaultSave);
  const [history, setHistory] = useState(() => createHistory(createInitialState(PROJECT_SHIFT_STAGES[0])));
  const historyRef = useRef(history);
  const [hydrated, setHydrated] = useState(false);
  const [stageSelectOpen, setStageSelectOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [avatarSelectOpen, setAvatarSelectOpen] = useState(false);
  const [playerAvatar, setPlayerAvatar] = useState<PlayerAvatar>('astronaut');
  const stage = getStage(history.present.stageId) ?? PROJECT_SHIFT_STAGES[0];

  const replaceHistory = useCallback((next: GameHistory) => {
    historyRef.current = next;
    setHistory(next);
  }, []);

  useEffect(() => {
    const loaded = parseSave(window.localStorage.getItem(PROJECT_SHIFT_STORAGE_KEY));
    const storedAvatar = window.localStorage.getItem(PROJECT_SHIFT_AVATAR_KEY);
    const loadedStage = getStage(loaded.currentStageId) ?? PROJECT_SHIFT_STAGES[0];
    const snapshot = loaded.run?.stageId === loadedStage.id ? loaded.run.snapshot : createInitialState(loadedStage);
    setSave(loaded);
    if (PLAYER_AVATARS.some((avatar) => avatar.id === storedAvatar)) {
      setPlayerAvatar(storedAvatar as PlayerAvatar);
    }
    replaceHistory(createHistory(snapshot));
    setHydrated(true);
  }, [replaceHistory]);

  const selectAvatar = useCallback((avatar: PlayerAvatar) => {
    setPlayerAvatar(avatar);
    window.localStorage.setItem(PROJECT_SHIFT_AVATAR_KEY, avatar);
    setAvatarSelectOpen(false);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(PROJECT_SHIFT_STORAGE_KEY, JSON.stringify(save));
  }, [hydrated, save]);

  const loadStage = useCallback((nextStage: StageDefinition) => {
    replaceHistory(createHistory(createInitialState(nextStage)));
    setSave((current) => ({ ...current, currentStageId: nextStage.id, run: null }));
    setCompletionOpen(false);
    setStageSelectOpen(false);
  }, [replaceHistory]);

  const performMove = useCallback((direction: Direction) => {
    const current = historyRef.current;
    const currentStage = getStage(current.present.stageId);
    if (!currentStage) return;
    const result = move(currentStage, current.present, direction);
    if (!result.changed) return;

    replaceHistory(commitMove(current, result.state));
    setSave((currentSave) => result.completedNow
      ? completeStage(currentSave, currentStage.id, result.state.moves)
      : saveRun(currentSave, result.state));
    if (result.completedNow) setCompletionOpen(true);
  }, [replaceHistory]);

  const closeTutorial = useCallback(() => {
    window.localStorage.setItem(PROJECT_SHIFT_TUTORIAL_KEY, 'true');
    setTutorialOpen(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      const direction = KEY_DIRECTIONS[event.key];
      if (direction) {
        event.preventDefault();
        if (!stageSelectOpen && !completionOpen && !tutorialOpen && !avatarSelectOpen) performMove(direction);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        replaceHistory(event.shiftKey ? redo(historyRef.current) : undo(historyRef.current));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [avatarSelectOpen, completionOpen, performMove, replaceHistory, stageSelectOpen, tutorialOpen]);

  useEffect(() => {
    if (!hydrated || history.present.completed) return;
    setSave((current) => saveRun(current, history.present));
  }, [history.present, hydrated]);

  const best = save.bestMoves[stage.id];
  const nextStage = PROJECT_SHIFT_STAGES[stage.number];
  const movableDirections = useMemo(() => new Set(
    (['up', 'down', 'left', 'right'] as Direction[])
      .filter((direction) => move(stage, history.present, direction).changed)
  ), [history.present, stage]);
  const mechanics = useMemo(() => stage.mechanics.map((mechanic) => ({
    push: 'PUSH',
    switch: 'PRESSURE',
    oneWay: 'VECTOR',
    warp: 'WARP',
    ice: 'ICE'
  }[mechanic])), [stage.mechanics]);
  const shellStyle = {
    '--ps-game-background': `image-set(url("${projectShiftAssetUrl(PROJECT_SHIFT_ASSETS.backgrounds.gameSurface, 'webp')}") type("image/webp"), url("${projectShiftAssetUrl(PROJECT_SHIFT_ASSETS.backgrounds.gameSurface, 'png')}") type("image/png"))`
  } as CSSProperties;

  return (
    <section className="ps-shell" style={shellStyle}>
      <div className="ps-ambient ps-ambient--one" aria-hidden="true" />
      <div className="ps-ambient ps-ambient--two" aria-hidden="true" />

      <header className="ps-game-header">
        <div className="ps-title-block">
          <span className="ps-kicker">PROJECT</span>
          <h1 className="ps-title">SHIFT</h1>
          <span className="ps-build">ENGINE 01</span>
        </div>
        <div className="ps-header-actions">
          <a className="ps-tool-button" href={import.meta.env.BASE_URL}>
            <Icon name="back" />
            <span className="ps-tool-label">AI COMPASS</span>
          </a>
          <button className="ps-tool-button" type="button" onClick={() => setTutorialOpen(true)}>
            <Icon name="help" />
            <span className="ps-tool-label">HOW TO PLAY</span>
          </button>
          <button className="ps-tool-button" type="button" onClick={() => setStageSelectOpen(true)}>
            <Icon name="grid" />
            <span className="ps-tool-label">STAGES</span>
          </button>
        </div>
      </header>

      <div className="ps-game-layout">
        <aside className="ps-info-panel">
          <div className="ps-stage-index">
            <span className="ps-eyebrow">TIER {String(stage.tier).padStart(2, '0')} / STAGE</span>
            <strong className="ps-stage-index-value">{String(stage.number).padStart(3, '0')}<span className="ps-stage-total">/100</span></strong>
          </div>
          <div className="ps-stage-copy">
            <h2 className="ps-stage-name">{stage.name}</h2>
            <p className="ps-briefing">{stage.briefing}</p>
          </div>
          <div className="ps-mechanics" aria-label="使用ギミック">
            {mechanics.map((mechanic) => <span className="ps-mechanic-chip" key={mechanic}>{mechanic}</span>)}
          </div>
          <button className="ps-player-select-button" type="button" onClick={() => setAvatarSelectOpen(true)}>
            <span className="ps-player-select-preview">
              <GameAsset asset={playerAsset(playerAvatar)} className="ps-entity-art" aria-hidden="true" />
            </span>
            <span><small>PLAYER</small><strong>CHANGE</strong></span>
          </button>
          <dl className="ps-stats">
            <div className="ps-stat">
              <dt className="ps-stat-label">MOVES</dt>
              <dd className="ps-stat-value">{String(history.present.moves).padStart(3, '0')}</dd>
            </div>
            <div className="ps-stat">
              <dt className="ps-stat-label">BEST</dt>
              <dd className="ps-stat-value">{best ? String(best).padStart(3, '0') : '---'}</dd>
            </div>
            <div className="ps-stat">
              <dt className="ps-stat-label">PAR</dt>
              <dd className="ps-stat-value">{String(stage.par).padStart(3, '0')}</dd>
            </div>
          </dl>
          <div className="ps-desktop-help">
            <span className="ps-help-key">WASD</span>
            <span className="ps-help-separator">/</span>
            <span className="ps-help-key">ARROWS</span>
            <span className="ps-help-copy">TO NAVIGATE</span>
          </div>
        </aside>

        <main className="ps-play-area">
          <div className="ps-mobile-stage-bar">
            <div className="ps-mobile-stage-head">
              <strong>{String(stage.number).padStart(3, '0')}<span>/100</span></strong>
              <small>TIER {String(stage.tier).padStart(2, '0')}</small>
              <span>{stage.name}</span>
            </div>
            <div className="ps-mobile-stats">
              <span>MOVES <b>{String(history.present.moves).padStart(3, '0')}</b></span>
              <span>BEST <b>{best ? String(best).padStart(3, '0') : '---'}</b></span>
              <span>PAR <b>{String(stage.par).padStart(3, '0')}</b></span>
            </div>
            <button className="ps-mobile-avatar-button" type="button" onClick={() => setAvatarSelectOpen(true)} aria-label="プレイヤーを変更">
              <GameAsset asset={playerAsset(playerAvatar)} className="ps-entity-art" aria-hidden="true" />
            </button>
          </div>
          <div className="ps-board-status">
            <span className={areGoalsPowered(stage, history.present) ? 'ps-status-dot ps-status-dot--ready' : 'ps-status-dot'} />
            <span className="ps-status-copy ps-status-copy--desktop">
              {areGoalsPowered(stage, history.present)
                ? '出口が起動しました。プレイヤーを出口へ移動してください'
                : 'キューブを円形ノードへ押してください'}
            </span>
            <span className="ps-status-copy ps-status-copy--mobile">
              {areGoalsPowered(stage, history.present) ? '出口が開きました' : 'ボックスをターゲットへ'}
            </span>
          </div>
          <Board stage={stage} history={history} onMove={performMove} avatar={playerAvatar} />
          <div className="ps-board-legend" aria-label="盤面の見方">
            <span><GuideIcon name="player" avatar={playerAvatar} />プレイヤー</span>
            <span><GuideIcon name="cube" />ボックス</span>
            <span><GuideIcon name="goal" />ターゲット</span>
            <span><GuideIcon name="exit" />出口</span>
          </div>
          <div className="ps-control-caption">
            <span className="ps-control-caption-title">MOVE</span>
            <span>矢印をクリック、またはキーボードの方向キー / WASD</span>
          </div>
          <div className="ps-action-bar ps-action-bar--desktop">
            <button
              className="ps-action-button"
              type="button"
              disabled={history.past.length === 0}
              onClick={() => replaceHistory(undo(historyRef.current))}
            >
              <Icon name="undo" /><span>UNDO</span>
            </button>
            <button
              className="ps-action-button"
              type="button"
              disabled={history.future.length === 0}
              onClick={() => replaceHistory(redo(historyRef.current))}
            >
              <Icon name="redo" /><span>REDO</span>
            </button>
            <button className="ps-action-button" type="button" onClick={() => loadStage(stage)}>
              <Icon name="restart" /><span>RESTART</span>
            </button>
          </div>
        </main>
      </div>

      <div className="ps-mobile-control-dock">
        <div className="ps-mobile-action-bar">
          <button
            className="ps-action-button"
            type="button"
            aria-label="1手戻す"
            disabled={history.past.length === 0}
            onClick={() => replaceHistory(undo(historyRef.current))}
          >
            <Icon name="undo" /><span>UNDO</span>
          </button>
          <button
            className="ps-action-button"
            type="button"
            aria-label="やり直す"
            disabled={history.future.length === 0}
            onClick={() => replaceHistory(redo(historyRef.current))}
          >
            <Icon name="redo" /><span>REDO</span>
          </button>
          <button className="ps-action-button" type="button" aria-label="ステージを最初からやり直す" onClick={() => loadStage(stage)}>
            <Icon name="restart" /><span>RESTART</span>
          </button>
        </div>
        <nav className="ps-touch-controls" aria-label="プレイヤーの移動操作">
          <button className="ps-direction-button ps-direction-button--up" type="button" disabled={!movableDirections.has('up')} onClick={() => performMove('up')} aria-label={DIRECTION_LABELS.up}>
            <DirectionIcon direction="up" />
          </button>
          <button className="ps-direction-button ps-direction-button--left" type="button" disabled={!movableDirections.has('left')} onClick={() => performMove('left')} aria-label={DIRECTION_LABELS.left}>
            <DirectionIcon direction="left" />
          </button>
          <span className="ps-direction-center" aria-hidden="true" />
          <button className="ps-direction-button ps-direction-button--right" type="button" disabled={!movableDirections.has('right')} onClick={() => performMove('right')} aria-label={DIRECTION_LABELS.right}>
            <DirectionIcon direction="right" />
          </button>
          <button className="ps-direction-button ps-direction-button--down" type="button" disabled={!movableDirections.has('down')} onClick={() => performMove('down')} aria-label={DIRECTION_LABELS.down}>
            <DirectionIcon direction="down" />
          </button>
        </nav>
      </div>

      {stageSelectOpen && (
        <StageSelect save={save} activeStage={stage} onSelect={loadStage} onClose={() => setStageSelectOpen(false)} />
      )}

      {tutorialOpen && <Tutorial avatar={playerAvatar} onClose={closeTutorial} />}

      {avatarSelectOpen && (
        <AvatarSelect selected={playerAvatar} onSelect={selectAvatar} onClose={() => setAvatarSelectOpen(false)} />
      )}

      {completionOpen && (
        <div className="ps-overlay" role="dialog" aria-modal="true" aria-labelledby="ps-complete-title">
          <div className="ps-modal ps-complete-modal">
            <span className="ps-complete-mark"><Icon name="check" /></span>
            <span className="ps-eyebrow">SIGNAL STABILIZED</span>
            <h2 className="ps-complete-title" id="ps-complete-title">STAGE COMPLETE</h2>
            <p className="ps-complete-reason">
              すべてのボックスがターゲット上に配置されて出口が開き、プレイヤーが出口へ入ったためクリアです。
            </p>
            <p className="ps-complete-copy">{stage.name} を {history.present.moves} 手で突破しました。</p>
            <div className="ps-complete-stats">
              <span className="ps-complete-stat"><small className="ps-complete-label">MOVES</small>{history.present.moves}</span>
              <span className="ps-complete-stat"><small className="ps-complete-label">PAR</small>{stage.par}</span>
            </div>
            <div className="ps-complete-actions">
              {nextStage ? (
                <button className="ps-primary-button" type="button" onClick={() => loadStage(nextStage)}>
                  NEXT STAGE <Icon name="arrow" />
                </button>
              ) : (
                <button className="ps-primary-button" type="button" onClick={() => setCompletionOpen(false)}>
                  TIER COMPLETE <Icon name="check" />
                </button>
              )}
              <button
                className="ps-secondary-button"
                type="button"
                onClick={() => {
                  setCompletionOpen(false);
                  setStageSelectOpen(true);
                }}
              >
                STAGE SELECT
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

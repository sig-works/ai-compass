import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronRight,
  CircleHelp,
  CornerUpLeft,
  CornerUpRight,
  Gamepad2,
  Grid2X2,
  LockKeyhole,
  RefreshCcw,
  RotateCcw,
  UserRoundCog,
  type LucideIcon
} from 'lucide-react';

import { GameAsset, PROJECT_SHIFT_ASSETS } from './asset-registry.tsx';
import {
  commitMove,
  createHistory,
  createInitialState,
  isTarget,
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
import { isStageUnlocked, readTestMode, writeTestMode } from './test-mode.ts';
import type { Direction, GameHistory, Position, ProjectShiftSave, StageDefinition, Tile } from './types.ts';

const DIRECTION_LABELS: Record<Direction, string> = {
  up: '上へ移動',
  down: '下へ移動',
  left: '左へ移動',
  right: '右へ移動'
};
const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right'
};
const PROJECT_SHIFT_AVATAR_KEY = 'project-shift-avatar';
type PlayerAvatar = 'astronaut' | 'drone' | 'explorer' | 'geometric';
const PLAYER_AVATARS: Array<{ id: PlayerAvatar; name: string; description: string }> = [
  { id: 'astronaut', name: 'ASTRONAUT', description: '小型宇宙服' },
  { id: 'drone', name: 'DRONE', description: '浮遊探索機' },
  { id: 'explorer', name: 'EXPLORER', description: 'フード型探索者' },
  { id: 'geometric', name: 'AVATAR', description: '幾何学アバター' }
];

type IconName = 'undo' | 'redo' | 'restart' | 'grid' | 'arrow' | 'lock' | 'check' | 'help';
const ICONS: Record<IconName, LucideIcon> = {
  undo: CornerUpLeft,
  redo: CornerUpRight,
  restart: RefreshCcw,
  grid: Grid2X2,
  arrow: ChevronRight,
  lock: LockKeyhole,
  check: Check,
  help: CircleHelp
};

function Icon({ name }: { name: IconName }) {
  const IconComponent = ICONS[name];
  return <IconComponent className="ps-icon" aria-hidden="true" />;
}

function DirectionIcon({ direction }: { direction: Direction }) {
  const icons: Record<Direction, LucideIcon> = {
    up: ArrowUp,
    right: ArrowRight,
    down: ArrowDown,
    left: ArrowLeft
  };
  const DirectionComponent = icons[direction];
  return <DirectionComponent className="ps-direction-icon" aria-hidden="true" />;
}

function playerAsset(avatar: PlayerAvatar) {
  return PROJECT_SHIFT_ASSETS.characters[avatar];
}

type GuideIconName = 'player' | 'box' | 'target' | 'history';
function GuideIcon({ name, avatar = 'astronaut' }: { name: GuideIconName; avatar?: PlayerAvatar }) {
  if (name === 'history') {
    return <RotateCcw className="ps-guide-icon ps-guide-icon--history" aria-hidden="true" />;
  }
  const asset = name === 'player'
    ? playerAsset(avatar)
    : name === 'box'
      ? PROJECT_SHIFT_ASSETS.entities.box
      : PROJECT_SHIFT_ASSETS.tiles.target;
  return <GameAsset asset={asset} className={`ps-guide-icon ps-guide-icon--${name}`} aria-hidden="true" />;
}

function TileVisual({ tile }: { tile: Tile }) {
  const asset = tile.kind === 'wall'
    ? PROJECT_SHIFT_ASSETS.tiles.wall
    : tile.kind === 'target'
      ? PROJECT_SHIFT_ASSETS.tiles.target
      : PROJECT_SHIFT_ASSETS.tiles.floor;
  return <GameAsset asset={asset} className="ps-tile-art" aria-hidden="true" />;
}

function Entity({
  kind,
  position,
  onTarget = false,
  avatar = 'astronaut'
}: {
  kind: 'player' | 'box';
  position: Position;
  onTarget?: boolean;
  avatar?: PlayerAvatar;
}) {
  const style = { '--ps-x': position.x, '--ps-y': position.y } as CSSProperties;
  const asset = kind === 'player'
    ? playerAsset(avatar)
    : onTarget
      ? PROJECT_SHIFT_ASSETS.entities.boxOnTarget
      : PROJECT_SHIFT_ASSETS.entities.box;
  return (
    <div className={`ps-entity ps-entity--${kind}${onTarget ? ' ps-entity--powered' : ''}`} style={style}>
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
      if (player && frame.scrollWidth > frame.clientWidth) {
        frame.scrollLeft = Math.max(0, player.offsetLeft - (frame.clientWidth - player.offsetWidth) / 2);
      }
    });
    return () => window.cancelAnimationFrame(focusPlayer);
  }, [stage.id]);

  return (
    <div className="ps-board-frame" ref={frameRef}>
      <div className="ps-board" style={style} role="img" aria-label={`${stage.name} のゲーム盤`}>
        <div className="ps-board-grid">
          {stage.tiles.flatMap((row, y) => row.map((tile, x) => {
            const deltaX = x - state.player.x;
            const deltaY = y - state.player.y;
            const candidate =
              deltaX === 1 && deltaY === 0 ? 'right' :
              deltaX === -1 && deltaY === 0 ? 'left' :
              deltaX === 0 && deltaY === 1 ? 'down' :
              deltaX === 0 && deltaY === -1 ? 'up' : null;
            const direction = candidate && move(stage, state, candidate).changed ? candidate : null;
            return (
              <button
                className={`ps-cell ps-cell--${tile.kind}${direction ? ' ps-cell--adjacent' : ''}`}
                type="button"
                disabled={!direction}
                onClick={() => direction && onMove(direction)}
                aria-label={direction ? DIRECTION_LABELS[direction] : undefined}
                tabIndex={direction ? 0 : -1}
                key={`${x}-${y}`}
              >
                <TileVisual tile={tile} />
              </button>
            );
          }))}
        </div>
        {state.boxes.map((box, index) => (
          <Entity kind="box" position={box} onTarget={isTarget(stage, box)} key={`box-${index}`} />
        ))}
        <Entity kind="player" position={state.player} onTarget={isTarget(stage, state.player)} avatar={avatar} />
      </div>
    </div>
  );
}

function StageSelect({
  save,
  activeStage,
  testMode,
  onTestModeTap,
  onSelect,
  onClose
}: {
  save: ProjectShiftSave;
  activeStage: StageDefinition;
  testMode: boolean;
  onTestModeTap: () => void;
  onSelect: (stage: StageDefinition) => void;
  onClose: () => void;
}) {
  const [selectedTier, setSelectedTier] = useState(activeStage.tier);
  const visibleStages = PROJECT_SHIFT_STAGES.filter((stage) => stage.tier === selectedTier);
  return (
    <div className="ps-overlay" role="dialog" aria-modal="true" aria-labelledby="ps-stage-select-title">
      <div className="ps-modal ps-modal--wide">
        <div className="ps-modal-head">
          <div>
            <span className="ps-eyebrow">30 STAGES / 3 TIERS</span>
            <h2 className="ps-modal-title" id="ps-stage-select-title">
              <button className="ps-test-mode-trigger" type="button" onClick={onTestModeTap}>ステージ選択</button>
            </h2>
            {testMode && <span className="ps-test-mode-badge">TEST MODE</span>}
          </div>
          <button className="ps-close-button" type="button" onClick={onClose} aria-label="閉じる">×</button>
        </div>
        <div className="ps-tier-tabs" aria-label="Tier選択">
          {[1, 2, 3].map((tier) => {
            const locked = !testMode && (tier - 1) * 10 + 1 > save.unlocked;
            return (
              <button
                className={tier === selectedTier ? 'ps-tier-tab ps-tier-tab--active' : 'ps-tier-tab'}
                type="button"
                disabled={locked}
                onClick={() => setSelectedTier(tier)}
                key={tier}
              >
                <span>TIER</span><strong>{String(tier).padStart(2, '0')}</strong>{locked && <Icon name="lock" />}
              </button>
            );
          })}
        </div>
        <div className="ps-stage-grid">
          {visibleStages.map((stage) => {
            const locked = !isStageUnlocked(stage, save, testMode);
            const bestMoves = save.bestMoves[stage.id];
            const bestPushes = save.bestPushes[stage.id];
            const completed = Boolean(bestMoves);
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
                <span className="ps-stage-number">{String(((stage.number - 1) % 10) + 1).padStart(2, '0')}</span>
                <span className="ps-stage-card-copy">
                  <strong className="ps-stage-card-name">{stage.name}</strong>
                  <span className="ps-stage-card-meta">
                    {locked ? 'LOCKED' : completed ? `BEST ${bestMoves} MOVES / ${bestPushes} PUSHES` : 'UNSOLVED'}
                  </span>
                </span>
                {locked ? <Icon name="lock" /> : completed ? <Icon name="check" /> : <Icon name="arrow" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Tutorial({ avatar, onClose }: { avatar: PlayerAvatar; onClose: () => void }) {
  const rules = [
    { icon: 'player', title: '1マスずつ移動', description: '上下左右へ移動します。壁と箱は通り抜けられません。' },
    { icon: 'box', title: '箱は押すだけ', description: '箱は1個ずつ押せます。引くことや、2個まとめて押すことはできません。' },
    { icon: 'target', title: 'すべて指定位置へ', description: 'すべての箱を指定位置へ置いた瞬間にステージクリアです。' },
    { icon: 'history', title: 'やり直し', description: 'UNDOで1手戻し、REDOで戻した操作をやり直せます。RESTARTで最初へ戻ります。' }
  ] satisfies Array<{ icon: GuideIconName; title: string; description: string }>;
  return (
    <div className="ps-overlay" role="dialog" aria-modal="true" aria-labelledby="ps-tutorial-title">
      <div className="ps-modal ps-tutorial-modal">
        <div className="ps-modal-head">
          <div><span className="ps-eyebrow">HOW TO PLAY</span><h2 className="ps-modal-title" id="ps-tutorial-title">倉庫番のルール</h2></div>
          <button className="ps-close-button" type="button" onClick={onClose} aria-label="閉じる">×</button>
        </div>
        <p className="ps-tutorial-goal">箱を押す順序と回り込む経路を考え、すべての箱を指定位置へ運びます。</p>
        <div className="ps-mechanic-guide">
          {rules.map(({ icon, title, description }) => (
            <article className="ps-mechanic-guide-item" key={title}>
              <GuideIcon name={icon} avatar={avatar} />
              <span><strong className="ps-tutorial-step-title">{title}</strong><small>{description}</small></span>
            </article>
          ))}
        </div>
        <button className="ps-primary-button" type="button" onClick={onClose}>ゲームへ戻る <Icon name="arrow" /></button>
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
          <div><span className="ps-eyebrow">PLAYER SELECT</span><h2 className="ps-modal-title" id="ps-avatar-title">プレイヤーを選択</h2></div>
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
              <span className="ps-avatar-preview"><GameAsset asset={playerAsset(avatar.id)} className="ps-entity-art" aria-hidden="true" /></span>
              <strong>{avatar.name}</strong><small>{avatar.description}</small>
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
  const [testMode, setTestMode] = useState(false);
  const [playerAvatar, setPlayerAvatar] = useState<PlayerAvatar>('astronaut');
  const testModeTapsRef = useRef<number[]>([]);
  const stage = getStage(history.present.stageId) ?? PROJECT_SHIFT_STAGES[0];

  const replaceHistory = useCallback((next: GameHistory) => {
    historyRef.current = next;
    setHistory(next);
  }, []);

  useEffect(() => {
    const loaded = parseSave(window.localStorage.getItem(PROJECT_SHIFT_STORAGE_KEY));
    const loadedStage = getStage(loaded.currentStageId) ?? PROJECT_SHIFT_STAGES[0];
    const snapshot = loaded.run?.stageId === loadedStage.id ? loaded.run.snapshot : createInitialState(loadedStage);
    setSave(loaded);
    setTestMode(readTestMode(window.sessionStorage));
    const avatar = window.localStorage.getItem(PROJECT_SHIFT_AVATAR_KEY);
    if (PLAYER_AVATARS.some((candidate) => candidate.id === avatar)) setPlayerAvatar(avatar as PlayerAvatar);
    replaceHistory(createHistory(snapshot));
    setHydrated(true);
  }, [replaceHistory]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(PROJECT_SHIFT_STORAGE_KEY, JSON.stringify(save));
  }, [hydrated, save]);

  const selectAvatar = useCallback((avatar: PlayerAvatar) => {
    setPlayerAvatar(avatar);
    window.localStorage.setItem(PROJECT_SHIFT_AVATAR_KEY, avatar);
    setAvatarSelectOpen(false);
  }, []);

  const handleTestModeTap = useCallback(() => {
    const now = Date.now();
    const taps = [...testModeTapsRef.current.filter((timestamp) => now - timestamp <= 2_000), now];
    if (taps.length < 5) {
      testModeTapsRef.current = taps;
      return;
    }
    testModeTapsRef.current = [];
    setTestMode((enabled) => {
      const next = !enabled;
      writeTestMode(window.sessionStorage, next);
      if (!next) {
        const savedStage = getStage(save.currentStageId) ?? PROJECT_SHIFT_STAGES[0];
        const snapshot = save.run?.stageId === savedStage.id ? save.run.snapshot : createInitialState(savedStage);
        replaceHistory(createHistory(snapshot));
        setCompletionOpen(false);
      }
      return next;
    });
  }, [replaceHistory, save]);

  const loadStage = useCallback((nextStage: StageDefinition) => {
    replaceHistory(createHistory(createInitialState(nextStage)));
    if (!testMode) setSave((current) => ({ ...current, currentStageId: nextStage.id, run: null }));
    setCompletionOpen(false);
    setStageSelectOpen(false);
  }, [replaceHistory, testMode]);

  const performMove = useCallback((direction: Direction) => {
    const current = historyRef.current;
    const currentStage = getStage(current.present.stageId);
    if (!currentStage) return;
    const result = move(currentStage, current.present, direction);
    if (!result.changed) return;
    replaceHistory(commitMove(current, result.state));
    if (!testMode) {
      setSave((currentSave) => result.completedNow
        ? completeStage(currentSave, currentStage.id, result.state.moves, result.state.pushes)
        : saveRun(currentSave, result.state));
    }
    if (result.completedNow) setCompletionOpen(true);
  }, [replaceHistory, testMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const direction = KEY_DIRECTIONS[event.key];
      if (direction) {
        event.preventDefault();
        if (!stageSelectOpen && !completionOpen && !tutorialOpen && !avatarSelectOpen) performMove(direction);
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        replaceHistory(event.shiftKey ? redo(historyRef.current) : undo(historyRef.current));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [avatarSelectOpen, completionOpen, performMove, replaceHistory, stageSelectOpen, tutorialOpen]);

  useEffect(() => {
    if (!hydrated || testMode || history.present.completed) return;
    setSave((current) => saveRun(current, history.present));
  }, [history.present, hydrated, testMode]);

  const movableDirections = useMemo(() => new Set(
    (['up', 'down', 'left', 'right'] as Direction[]).filter((direction) => move(stage, history.present, direction).changed)
  ), [history.present, stage]);
  const nextStage = PROJECT_SHIFT_STAGES[stage.number];
  const bestMoves = save.bestMoves[stage.id];
  const bestPushes = save.bestPushes[stage.id];
  return (
    <section className="ps-shell">
      <div className="ps-ambient ps-ambient--one" aria-hidden="true" />
      <div className="ps-ambient ps-ambient--two" aria-hidden="true" />
      <header className="ps-game-header">
        <div className="ps-title-block">
          <span className="ps-title-icon" aria-hidden="true"><Gamepad2 className="ps-title-icon-art" /></span>
          <div>
            <h1 className="ps-title">Game</h1>
            <p className="ps-title-description">倉庫番パズル</p>
          </div>
        </div>
        <div className="ps-header-actions">
          <button className="ps-tool-button ps-mobile-avatar-button" type="button" onClick={() => setAvatarSelectOpen(true)} aria-label="キャラクターを変更">
            <GameAsset asset={playerAsset(playerAvatar)} className="ps-mobile-avatar-image" aria-hidden="true" />
            <UserRoundCog className="ps-mobile-avatar-mark" aria-hidden="true" />
          </button>
          <button className="ps-tool-button" type="button" onClick={() => setTutorialOpen(true)}><Icon name="help" /><span className="ps-tool-label">HOW TO PLAY</span></button>
          <button className="ps-tool-button" type="button" onClick={() => setStageSelectOpen(true)}><Icon name="grid" /><span className="ps-tool-label">STAGES</span></button>
        </div>
      </header>

      <div className="ps-game-layout">
        <aside className="ps-info-panel">
          <div className="ps-stage-index">
            <span className="ps-eyebrow">TIER {String(stage.tier).padStart(2, '0')} / STAGE</span>
            <strong className="ps-stage-index-value">{stage.number}<span className="ps-stage-total">/30</span></strong>
          </div>
          <div className="ps-stage-copy"><h2 className="ps-stage-name">{stage.name}</h2><p className="ps-briefing">{stage.concept}</p></div>
          <button className="ps-player-select-button" type="button" onClick={() => setAvatarSelectOpen(true)}>
            <span className="ps-player-select-preview"><GameAsset asset={playerAsset(playerAvatar)} className="ps-entity-art" aria-hidden="true" /></span>
            <span><small>PLAYER</small><strong>CHANGE</strong></span>
          </button>
          <dl className="ps-stats">
            <div className="ps-stat"><dt className="ps-stat-label">MOVES</dt><dd className="ps-stat-value">{String(history.present.moves).padStart(3, '0')}</dd></div>
            <div className="ps-stat"><dt className="ps-stat-label">PUSHES</dt><dd className="ps-stat-value">{String(history.present.pushes).padStart(3, '0')}</dd></div>
            <div className="ps-stat"><dt className="ps-stat-label">BEST M</dt><dd className="ps-stat-value">{bestMoves ? String(bestMoves).padStart(3, '0') : '---'}</dd></div>
            <div className="ps-stat"><dt className="ps-stat-label">BEST P</dt><dd className="ps-stat-value">{bestPushes ? String(bestPushes).padStart(3, '0') : '---'}</dd></div>
          </dl>
        </aside>

        <main className="ps-play-area">
          <div className="ps-mobile-stage-bar">
            <div className="ps-mobile-stage-head"><strong>{stage.number}<span>/30</span></strong><small>TIER {String(stage.tier).padStart(2, '0')}</small><span>{stage.name}</span></div>
            <div className="ps-mobile-stats">
              <span>MOVES <b>{history.present.moves}</b></span><span>PUSHES <b>{history.present.pushes}</b></span>
              <span>BEST <b>{bestMoves ?? '-'}/{bestPushes ?? '-'}</b></span>
            </div>
          </div>
          <Board stage={stage} history={history} onMove={performMove} avatar={playerAvatar} />
          <div className="ps-board-legend" aria-label="盤面の見方">
            <span><GuideIcon name="player" avatar={playerAvatar} />プレイヤー</span>
            <span><GuideIcon name="box" />箱</span>
            <span><GuideIcon name="target" />指定位置</span>
          </div>
          <div className="ps-control-caption"><span className="ps-control-caption-title">MOVE</span><span>矢印をクリック、または方向キー / WASD</span></div>
          <div className="ps-action-bar ps-action-bar--desktop">
            <button className="ps-action-button" type="button" disabled={history.past.length === 0} onClick={() => replaceHistory(undo(historyRef.current))}><Icon name="undo" /><span>UNDO</span></button>
            <button className="ps-action-button" type="button" disabled={history.future.length === 0} onClick={() => replaceHistory(redo(historyRef.current))}><Icon name="redo" /><span>REDO</span></button>
            <button className="ps-action-button" type="button" onClick={() => loadStage(stage)}><Icon name="restart" /><span>RESTART</span></button>
          </div>
        </main>
      </div>

      <div className="ps-mobile-control-dock">
        <div className="ps-mobile-action-bar" aria-label="履歴とリセット操作">
          <button className="ps-action-button" type="button" disabled={history.past.length === 0} onClick={() => replaceHistory(undo(historyRef.current))}><Icon name="undo" /><span>1手戻す</span></button>
          <button className="ps-action-button" type="button" disabled={history.future.length === 0} onClick={() => replaceHistory(redo(historyRef.current))}><Icon name="redo" /><span>1手進む</span></button>
          <button className="ps-action-button ps-action-button--restart" type="button" onClick={() => loadStage(stage)}><Icon name="restart" /><span>リセット</span></button>
        </div>
        <nav className="ps-touch-controls" aria-label="プレイヤーの移動操作">
          <button className="ps-direction-button ps-direction-button--up" type="button" disabled={!movableDirections.has('up')} onClick={() => performMove('up')} aria-label={DIRECTION_LABELS.up}><DirectionIcon direction="up" /></button>
          <button className="ps-direction-button ps-direction-button--left" type="button" disabled={!movableDirections.has('left')} onClick={() => performMove('left')} aria-label={DIRECTION_LABELS.left}><DirectionIcon direction="left" /></button>
          <span className="ps-direction-center" aria-hidden="true" />
          <button className="ps-direction-button ps-direction-button--right" type="button" disabled={!movableDirections.has('right')} onClick={() => performMove('right')} aria-label={DIRECTION_LABELS.right}><DirectionIcon direction="right" /></button>
          <button className="ps-direction-button ps-direction-button--down" type="button" disabled={!movableDirections.has('down')} onClick={() => performMove('down')} aria-label={DIRECTION_LABELS.down}><DirectionIcon direction="down" /></button>
        </nav>
      </div>

      {stageSelectOpen && <StageSelect save={save} activeStage={stage} testMode={testMode} onTestModeTap={handleTestModeTap} onSelect={loadStage} onClose={() => setStageSelectOpen(false)} />}
      {tutorialOpen && <Tutorial avatar={playerAvatar} onClose={() => setTutorialOpen(false)} />}
      {avatarSelectOpen && <AvatarSelect selected={playerAvatar} onSelect={selectAvatar} onClose={() => setAvatarSelectOpen(false)} />}
      {completionOpen && (
        <div className="ps-overlay" role="dialog" aria-modal="true" aria-labelledby="ps-complete-title">
          <div className="ps-modal ps-complete-modal">
            <span className="ps-complete-mark"><Icon name="check" /></span>
            <span className="ps-eyebrow">ALL BOXES PLACED</span>
            <h2 className="ps-complete-title" id="ps-complete-title">STAGE COMPLETE</h2>
            <p className="ps-complete-reason">すべての箱を指定位置へ配置しました。</p>
            <div className="ps-complete-stats">
              <span className="ps-complete-stat"><small className="ps-complete-label">MOVES</small>{history.present.moves}</span>
              <span className="ps-complete-stat"><small className="ps-complete-label">PUSHES</small>{history.present.pushes}</span>
            </div>
            <div className="ps-complete-actions">
              {nextStage ? (
                <button className="ps-primary-button" type="button" onClick={() => loadStage(nextStage)}>NEXT STAGE <Icon name="arrow" /></button>
              ) : (
                <button className="ps-primary-button" type="button" onClick={() => setCompletionOpen(false)}>ALL STAGES COMPLETE <Icon name="check" /></button>
              )}
              <button className="ps-secondary-button" type="button" onClick={() => { setCompletionOpen(false); setStageSelectOpen(true); }}>STAGE SELECT</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

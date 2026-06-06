import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const stageDirectory = join(process.cwd(), 'src', 'features', 'project-shift', 'stages');
mkdirSync(stageDirectory, { recursive: true });

const bases = {
  push: {
    map: ['########', '#...G.E#', '#.C....#', '#..P...#', '#......#', '########'],
    solution: 'LULURRDRRUR',
    mechanics: ['push'],
    legend: {}
  },
  twin: {
    map: ['########', '#P.....#', '#.C.G..#', '#.C.G.E#', '#......#', '########'],
    solution: 'DRRLLDRRDRRUR',
    mechanics: ['push'],
    legend: {}
  },
  pressure: {
    map: ['##########', '#P.CG#..E#', '#..C.D...#', '#....#...#', '#..S.#...#', '##########'],
    solution: 'RRDDURRRURR',
    mechanics: ['push', 'switch'],
    legend: {
      S: { kind: 'switch', channel: 'alpha', goal: true },
      D: { kind: 'door', channel: 'alpha' }
    }
  },
  relay: {
    map: ['###########', '#P..C.G#..#', '#.C.S..D.E#', '#......#..#', '###########'],
    solution: 'DRRURRDRRRR',
    mechanics: ['push', 'switch'],
    legend: {
      S: { kind: 'switch', channel: 'alpha', goal: true },
      D: { kind: 'door', channel: 'alpha' }
    }
  },
  vectorEntry: {
    map: ['##########', '#P.CG#...#', '#....>>>E#', '#....#...#', '##########'],
    solution: 'RRDRRRRR',
    mechanics: ['push', 'oneWay'],
    legend: {}
  },
  vectorLock: {
    map: ['############', '#P..C..G#..#', '#...#..>...#', '#...#..#E..#', '#..........#', '############'],
    solution: 'RRRRRDRRD',
    mechanics: ['push', 'oneWay'],
    legend: {}
  },
  fold: {
    map: ['##########', '#P.C1#..E#', '#...##...#', '#..1.G...#', '#........#', '##########'],
    solution: 'RRDLDRLRRDRRUUURR',
    mechanics: ['push', 'warp'],
    legend: {
      1: { kind: 'warp', channel: 'alpha' }
    }
  },
  doubleFold: {
    map: ['############', '#P..C1#..GE#', '#....##....#', '#..1.C.G...#', '#..........#', '############'],
    solution: 'RRRDDRRRRDLLLLLLURLRRRRDRRRUURU',
    mechanics: ['push', 'warp'],
    legend: {
      1: { kind: 'warp', channel: 'alpha' }
    }
  },
  ice: {
    map: ['############', '#P..CIII.GE#', '#..........#', '############'],
    solution: 'RRRRDRRU',
    mechanics: ['push', 'ice'],
    legend: {}
  },
  convergence: {
    map: [
      '#################',
      '#P.CG..#...#...E#',
      '#..C.S.D>..#....#',
      '#......#..##....#',
      '#......#.I1#1...#',
      '#......#..##....#',
      '#################'
    ],
    solution: 'RRLDRRDRRURRRDLDRUUURRR',
    mechanics: ['push', 'switch', 'oneWay', 'warp', 'ice'],
    legend: {
      S: { kind: 'switch', channel: 'alpha', goal: true },
      D: { kind: 'door', channel: 'alpha' },
      1: { kind: 'warp', channel: 'alpha' }
    }
  }
};

const tierPlans = [
  { bases: ['push'], label: '基礎搬送', mechanic: '箱を押す順序と回り込み' },
  { bases: ['twin'], label: '複数搬送', mechanic: '複数の箱とデッドロック回避' },
  { bases: ['pressure'], label: '圧力回路', mechanic: 'スイッチでドアを維持する手順' },
  { bases: ['relay'], label: '連動制御', mechanic: '箱の役割分担とドア制御' },
  { bases: ['vectorEntry', 'vectorLock'], label: '一方通行', mechanic: '戻れない経路の先読み' },
  { bases: ['fold', 'doubleFold'], label: '空間転送', mechanic: 'プレイヤーと箱の転送経路' },
  { bases: ['ice'], label: '氷床制御', mechanic: '停止位置から逆算する移動' },
  { bases: ['convergence'], label: '二重機構', mechanic: '複数ギミックの接続関係' },
  { bases: ['convergence'], label: '複合回路', mechanic: '不可逆操作を含む複合問題' },
  { bases: ['convergence'], label: '最終試験', mechanic: '全ギミックを通した盤面読解' }
];

const stageSuffixes = [
  '導入',
  '確認',
  '分岐',
  '反転',
  '迂回',
  '連鎖',
  '交差',
  '収束',
  '難問',
  '総合'
];

const swapHorizontal = { '<': '>', '>': '<' };
const swapVertical = { '^': 'v', v: '^' };

function transform(base, variant) {
  const horizontal = variant % 2 === 1;
  const vertical = variant % 4 >= 2;
  let map = [...base.map];
  let solution = base.solution;

  if (horizontal) {
    map = map.map((row) => [...row].reverse().map((symbol) => swapHorizontal[symbol] ?? symbol).join(''));
    solution = [...solution].map((code) => ({ L: 'R', R: 'L' }[code] ?? code)).join('');
  }
  if (vertical) {
    map = map.reverse().map((row) => [...row].map((symbol) => swapVertical[symbol] ?? symbol).join(''));
    solution = [...solution].map((code) => ({ U: 'D', D: 'U' }[code] ?? code)).join('');
  }

  if (variant > 0) {
    const playerY = map.findIndex((row) => row.includes('P'));
    const playerX = map[playerY].indexOf('P');
    const candidates = [];
    const directions = [
      { code: 'U', x: 0, y: -1 },
      { code: 'D', x: 0, y: 1 },
      { code: 'L', x: -1, y: 0 },
      { code: 'R', x: 1, y: 0 }
    ];

    for (let y = 0; y < map.length; y += 1) {
      for (let x = 0; x < map[y].length; x += 1) {
        if (map[y][x] !== '.') continue;
        const queue = [{ x, y, route: '' }];
        const visited = new Set([`${x},${y}`]);
        let route = null;

        while (queue.length > 0 && route === null) {
          const current = queue.shift();
          if (current.x === playerX && current.y === playerY) {
            route = current.route;
            break;
          }
          for (const direction of directions) {
            const nextX = current.x + direction.x;
            const nextY = current.y + direction.y;
            const symbol = map[nextY]?.[nextX];
            const key = `${nextX},${nextY}`;
            if ((symbol !== '.' && symbol !== 'P') || visited.has(key)) continue;
            visited.add(key);
            queue.push({ x: nextX, y: nextY, route: current.route + direction.code });
          }
        }

        if (route) candidates.push({ x, y, route });
      }
    }

    candidates.sort((left, right) => left.route.length - right.route.length);
    if (candidates.length > 0) {
      const rank = Math.min(candidates.length - 1, Math.floor(((variant - 1) / 8) * candidates.length));
      const candidate = candidates[rank];
      map = map.map((row, y) =>
        [...row].map((symbol, x) => {
          if (symbol === 'P') return '.';
          if (x === candidate.x && y === candidate.y) return 'P';
          return symbol;
        }).join('')
      );
      solution = candidate.route + solution;
    }
  }

  const verticalPadding = Math.min(Math.floor(variant / 4), Math.floor((12 - map.length) / 2));
  const horizontalPadding = Math.min(
    Math.floor(variant / 4),
    Math.floor((18 - map[0].length) / 2)
  );
  const paddedWidth = map[0].length + horizontalPadding * 2;
  map = map.map((row) => '#'.repeat(horizontalPadding) + row + '#'.repeat(horizontalPadding));
  for (let index = 0; index < verticalPadding; index += 1) {
    map.unshift('#'.repeat(paddedWidth));
    map.push('#'.repeat(paddedWidth));
  }

  return { map, solution };
}

for (let tier = 1; tier <= 10; tier += 1) {
  const plan = tierPlans[tier - 1];
  for (let localNumber = 1; localNumber <= 10; localNumber += 1) {
    const globalNumber = (tier - 1) * 10 + localNumber;
    const baseName = plan.bases.length === 1 ? plan.bases[0] : plan.bases[localNumber <= 4 ? 0 : 1];
    const base = bases[baseName];
    const transformed = transform(base, localNumber - 1);
    const stage = {
      id: `t${String(tier).padStart(2, '0')}-${String(localNumber).padStart(2, '0')}`,
      tier,
      number: globalNumber,
      name: `${plan.label} ${stageSuffixes[localNumber - 1]}`,
      briefing: `${plan.mechanic}を扱うステージです。操作を確定する前に、箱を押した後の退路まで確認してください。`,
      difficulty: tier,
      mechanics: base.mechanics,
      map: transformed.map,
      legend: base.legend,
      solution: transformed.solution
    };
    const file = `${stage.id}.json`;
    writeFileSync(join(stageDirectory, file), `${JSON.stringify(stage, null, 2)}\n`, 'utf8');
  }
}

console.log('Scaffolded 100 Project SHIFT stage JSON files.');

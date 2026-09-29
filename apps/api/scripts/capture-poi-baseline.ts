import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Fixed real routes, chosen from READY records. Capture is read-only.
const cases = [
  { name: 'short', id: '4911f453-9cd2-4859-b068-e07a16fae5cc' },
  { name: 'medium', id: '8fe8ed04-443e-45b6-aec9-c19658294f8c' },
  { name: 'long', id: '19b6d7c0-5b84-4f15-aa52-56c7942cfe65' },
  { name: 'sparse', id: '234bda91-99c5-4086-a487-44c3502b148f' },
];
const root = resolve('test/fixtures/poi-baseline-v2');
const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');

async function main() {
  await mkdir(resolve('test/fixtures'), { recursive: true });
  // Refuse overwrites: a baseline must remain frozen after capture.
  await mkdir(root, { recursive: false });
  const sources = {};
  for (const [name, path] of Object.entries({
    'selector.ts.txt': 'src/modules/routes/mappers/featured-route-pois.ts',
    'constants.ts.txt': 'src/modules/routes/constants/index.ts',
    'types.ts.txt': 'src/modules/routes/types/featured-pois.ts',
  })) {
    const contents = await readFile(path, 'utf8');
    await writeFile(resolve(root, name), contents, { flag: 'wx' });
    sources[name] = { path, sha256: hash(contents) };
  }
  const entries = [];
  for (const item of cases) {
    const out = resolve(root, item.name);
    execFileSync(
      process.execPath,
      [
        require.resolve('ts-node/dist/bin.js'),
        '--transpile-only',
        '-r',
        'tsconfig-paths/register',
        'scripts/debug-pois.ts',
        '--route',
        item.id,
        '--out',
        out,
      ],
      { stdio: 'inherit' },
    );
    const fixtureText = await readFile(resolve(out, 'fixture.json'), 'utf8');
    const resultText = await readFile(resolve(out, 'result.json'), 'utf8');
    const fixture = JSON.parse(fixtureText);
    const result = JSON.parse(resultText);
    if (fixture.route.status !== 'READY')
      throw new Error(`${item.name} is not READY`);
    // Replay the frozen input to verify capture reproducibility.
    const replay = resolve('.poi-debug/baseline-verification', item.name);
    execFileSync(
      process.execPath,
      [
        require.resolve('ts-node/dist/bin.js'),
        '--transpile-only',
        '-r',
        'tsconfig-paths/register',
        'scripts/debug-pois.ts',
        '--fixture',
        resolve(out, 'fixture.json'),
        '--out',
        replay,
      ],
      { stdio: 'pipe' },
    );
    if (
      (await readFile(resolve(replay, 'result.json'), 'utf8')) !== resultText
    ) {
      throw new Error(`Replay differs for ${item.name}`);
    }
    entries.push({
      ...item,
      distanceM: fixture.route.distanceM,
      candidateCount: fixture.pois.length,
      featuredCount: result.featuredCount,
      fixtureSha256: hash(fixtureText),
      resultSha256: hash(resultText),
      selectedIds: result.featuredPois.map((p) => p.id),
      replayVerified: true,
    });
  }
  await writeFile(
    resolve(root, 'manifest.json'),
    JSON.stringify(
      {
        version: 1,
        capturedAt: new Date().toISOString(),
        sources,
        cases: entries,
      },
      null,
      2,
    ),
    { flag: 'wx' },
  );
  console.log(`Baseline captured and replay-verified: ${root}`);
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'Baseline capture failed',
  );
  process.exitCode = 1;
});

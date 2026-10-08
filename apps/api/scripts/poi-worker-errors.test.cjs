// node --test apps/api/scripts/poi-worker-errors.test.cjs
const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
require('reflect-metadata');
const apiRoot = path.resolve(__dirname, '..');
require('ts-node').register({
  project: path.join(apiRoot, 'tsconfig.json'),
  transpileOnly: true,
  preferTsExts: true,
  experimentalResolver: true,
});
require('tsconfig-paths').register({
  baseUrl: apiRoot,
  paths: { 'src/*': ['src/*'] },
});
const { UnrecoverableError } = require('bullmq');
const {
  EnrichmentPoisConsumer,
} = require('../src/modules/poi-enrichment/consumers/enrichment.worker.ts');
const {
  OverpassClientService,
} = require('../src/modules/poi-enrichment/overpass-client.service.ts');
const {
  PoiEnrichmentService,
} = require('../src/modules/poi-enrichment/poi-enrichment.service.ts');
const {
  POI_ENRICHMENT_JOB_NAME,
} = require('../src/modules/poi-enrichment/constants/index.ts');
const logger = { log() {}, warn() {}, error() {} };

test('failed event only persists terminal failures and handles missing jobs / DB errors', async () => {
  const writes = [];
  const consumer = new EnrichmentPoisConsumer({
    markRouteEnrichmentFailed: async (...args) => {
      writes.push(args);
    },
  });
  consumer.logger = logger;
  const job = {
    id: 'job',
    name: POI_ENRICHMENT_JOB_NAME,
    data: { routeId: 'route' },
    attemptsMade: 1,
    opts: { attempts: 3 },
  };
  await consumer.onWorkerFailed(job, new Error('temporary'));
  assert.equal(writes.length, 0);
  await consumer.onWorkerFailed(job, new UnrecoverableError('bad request'));
  assert.equal(writes.length, 1);
  await consumer.onWorkerFailed(
    { ...job, attemptsMade: 3 },
    new Error('exhausted'),
  );
  await consumer.onWorkerFailed(
    { ...job, attemptsMade: 4 },
    new Error('exhausted'),
  );
  await consumer.onWorkerFailed(
    { ...job, opts: {} },
    new Error('default attempt'),
  );
  assert.equal(writes.length, 4);
  await consumer.onWorkerFailed(undefined, new Error('missing job'));
  assert.equal(writes.length, 4);
  let logged = false;
  consumer.poiEnrichmentService.markRouteEnrichmentFailed = async () => {
    throw new Error('DB unavailable');
  };
  consumer.logger = {
    ...logger,
    error() {
      logged = true;
    },
  };
  await assert.doesNotReject(
    consumer.onWorkerFailed(job, new UnrecoverableError('terminal')),
  );
  assert.equal(logged, true);
});

test('Overpass distinguishes temporary transport errors from invalid requests / JSON', async (t) => {
  const client = new OverpassClientService({
    buildPoiQueryForBbox: () => 'query',
  });
  client.logger = logger;
  const bbox = { south: 0, west: 0, north: 1, east: 1 };
  let failure;
  const fetchMock = t.mock.method(global, 'fetch', async () => {
    throw failure;
  });
  for (const code of [
    'ECONNRESET',
    'ECONNREFUSED',
    'EAI_AGAIN',
    'ETIMEDOUT',
    'UND_ERR_SOCKET',
    'UND_ERR_BODY_TIMEOUT',
  ]) {
    failure = new TypeError('fetch failed', {
      cause: Object.assign(new Error(code), { code }),
    });
    await assert.rejects(
      client.fetchPoiElements(bbox),
      (error) =>
        !(error instanceof UnrecoverableError) && error.cause === failure,
    );
  }
  failure = new TypeError('fetch failed', {
    cause: new AggregateError([
      Object.assign(new Error('reset'), { code: 'ECONNRESET' }),
      Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' }),
    ]),
  });
  await assert.rejects(
    client.fetchPoiElements(bbox),
    (error) => !(error instanceof UnrecoverableError),
  );
  failure = new TypeError('invalid URL');
  await assert.rejects(client.fetchPoiElements(bbox), UnrecoverableError);
  fetchMock.mock.mockImplementation(
    async () => new Response('', { status: 504 }),
  );
  await assert.rejects(
    client.fetchPoiElements(bbox),
    (error) =>
      !(error instanceof UnrecoverableError) && error.cause.cause === 504,
  );
  fetchMock.mock.mockImplementation(
    async () => new Response('', { status: 400 }),
  );
  await assert.rejects(client.fetchPoiElements(bbox), UnrecoverableError);
  fetchMock.mock.mockImplementation(
    async () => new Response('invalid json', { status: 200 }),
  );
  await assert.rejects(client.fetchPoiElements(bbox), UnrecoverableError);
  fetchMock.mock.mockImplementation(async () => ({
    ok: true,
    json: async () => {
      throw new TypeError('terminated', {
        cause: Object.assign(new Error('socket closed'), {
          code: 'UND_ERR_SOCKET',
        }),
      });
    },
  }));
  await assert.rejects(
    client.fetchPoiElements(bbox),
    (error) => !(error instanceof UnrecoverableError),
  );
  // Trigger the actual attempt timer without waiting 27 seconds.
  t.mock.method(global, 'setTimeout', (callback) => {
    queueMicrotask(callback);
    return 0;
  });
  fetchMock.mock.mockImplementation(async (_url, { signal }) => {
    await Promise.resolve();
    signal.throwIfAborted();
  });
  await assert.rejects(
    client.fetchPoiElements(bbox),
    (error) =>
      !(error instanceof UnrecoverableError) &&
      error.cause.name === 'AbortError',
  );
});

test('persisting FAILED tolerates a deleted route and bounds the error text', async () => {
  const service = Object.create(PoiEnrichmentService.prototype);
  service.prisma = {
    route: {
      updateMany: async ({ where, data }) => {
        assert.equal(where.id, 'deleted');
        assert.equal(data.poiEnrichmentStatus, 'FAILED');
        assert.equal(data.poiEnrichmentError.length, 500);
        return { count: 0 };
      },
    },
  };
  await service.markRouteEnrichmentFailed(
    'deleted',
    new Error('x'.repeat(700)),
  );
});

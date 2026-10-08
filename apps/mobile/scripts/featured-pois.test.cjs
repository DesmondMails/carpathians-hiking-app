// Run from the repository root: node --test apps/mobile/scripts/featured-pois.test.cjs
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { AxiosError } = require('axios')

require('ts-node').register({
  transpileOnly: true,
  preferTsExts: true,
  compilerOptions: { module: 'CommonJS', moduleResolution: 'Node' },
})

// Isolate the store from the native API client; control response ordering.
const requests = []
const retryRequests = []
const apiPath = require.resolve('../src/features/route/api/route-info.api.ts')
require.cache[apiPath] = {
  id: apiPath,
  filename: apiPath,
  loaded: true,
  exports: {
    routeInfoApi: {
      reEnrichRoutePois: (routeId) =>
        new Promise((resolve, reject) => {
          retryRequests.push({ routeId, resolve, reject })
        }),
      getFeaturedRoutePois: (routeId, signal) =>
        new Promise((resolve, reject) => {
          requests.push({ routeId, signal, resolve, reject })
        }),
    },
  },
}
const {
  useRouteStore: store,
} = require('../src/features/route/store/route.store.ts')
const state = () => store.getState()
const load = (id, signal) => state().loadFeaturedRoutePois(id, signal)
const activate = (id) => state().setActiveRouteId(id)
const ready = (id) => ({ status: 'READY', poiMarkers: [{ id }] })

test('featured POI state preserves data and rejects stale work', async (t) => {
  await t.test(
    'network errors preserve markers/status, success clears the error',
    async () => {
      activate('network')
      store.setState({
        poiStatus: 'PENDING',
        featuredPoiMarkers: [{ id: 'cached' }],
      })
      const pending = load('network')
      requests.shift().reject(new AxiosError('offline', 'ERR_NETWORK'))
      assert.deepEqual(await pending, { kind: 'error', retryable: true })
      assert.equal(state().poiStatus, 'PENDING')
      assert.deepEqual(state().featuredPoiMarkers, [{ id: 'cached' }])
      assert.ok(state().featuredPoisError)
      assert.equal(state().isFeaturedPoisLoading, false)
      const retry = load('network')
      requests.shift().resolve(ready('fresh'))
      await retry
      assert.equal(state().featuredPoisError, null)
      assert.equal(state().poiStatus, 'READY')
    },
  )

  await t.test(
    '404 stops retries without marking enrichment FAILED',
    async () => {
      activate('missing')
      const pending = load('missing')
      requests.shift().reject(
        new AxiosError('missing', 'ERR_BAD_REQUEST', undefined, undefined, {
          status: 404,
        }),
      )
      assert.deepEqual(await pending, { kind: 'error', retryable: false })
      assert.equal(state().poiStatus, 'PENDING')
    },
  )

  await t.test(
    'older completion cannot clear a newer request loading flag',
    async () => {
      activate('same')
      const old = load('same')
      const oldRequest = requests.shift()
      const latest = load('same')
      const latestRequest = requests.shift()
      oldRequest.resolve(ready('old'))
      assert.deepEqual(await old, { kind: 'cancelled' })
      assert.equal(state().isFeaturedPoisLoading, true)
      assert.deepEqual(state().featuredPoiMarkers, [])
      latestRequest.resolve(ready('latest'))
      await latest
      assert.equal(state().featuredPoiMarkers[0].id, 'latest')
      assert.equal(state().isFeaturedPoisLoading, false)
    },
  )

  await t.test(
    'A → B → A ignores both stale success and stale failure',
    async () => {
      activate('A')
      const first = load('A')
      const firstRequest = requests.shift()
      activate('B')
      const second = load('B')
      const secondRequest = requests.shift()
      activate('A')
      const current = load('A')
      const currentRequest = requests.shift()
      firstRequest.resolve(ready('stale-A'))
      secondRequest.reject(new AxiosError('offline', 'ERR_NETWORK'))
      assert.deepEqual(await first, { kind: 'cancelled' })
      assert.deepEqual(await second, { kind: 'cancelled' })
      assert.equal(state().featuredPoisError, null)
      assert.equal(state().isFeaturedPoisLoading, true)
      currentRequest.resolve(ready('current-A'))
      await current
      assert.equal(state().featuredPoiMarkers[0].id, 'current-A')
    },
  )

  await t.test('aborted responses never update markers or errors', async () => {
    activate('abort')
    const controller = new AbortController()
    const pending = load('abort', controller.signal)
    const request = requests.shift()
    assert.equal(request.signal, controller.signal)
    controller.abort()
    request.resolve(ready('ignored'))
    assert.deepEqual(await pending, { kind: 'cancelled' })
    assert.deepEqual(state().featuredPoiMarkers, [])
    assert.equal(state().featuredPoisError, null)
    assert.equal(state().isFeaturedPoisLoading, false)
  })
})

test('polling schedules bounded retries and stops on READY or cleanup', async (t) => {
  let cleanup
  const reactPath = require.resolve('react')
  const storePath =
    require.resolve('../src/features/route/store/route.store.ts')
  const originalReact = require.cache[reactPath].exports
  const originalStore = require.cache[storePath].exports
  require.cache[reactPath].exports = {
    ...originalReact,
    useEffect: (effect, deps) => {
      assert.ok(
        deps.includes(state().featuredPoisPollVersion),
        'polling observes explicit restart version',
      )
      assert.ok(
        deps.includes(state().isReEnriching),
        'polling observes POST lifecycle',
      )
      cleanup = effect()
    },
  }
  require.cache[storePath].exports = {
    useRouteStore: (selector) => selector(state()),
  }
  const {
    useFeaturedPoisPolling,
  } = require('../src/features/route/hooks/useFeaturedPoisPolling.ts')
  const timers = []
  t.mock.method(global, 'setTimeout', (callback, delay) => {
    const timer = { callback, delay }
    timers.push(timer)
    return timer
  })
  t.mock.method(global, 'clearTimeout', (timer) => {
    const index = timers.indexOf(timer)
    if (index >= 0) timers.splice(index, 1)
  })
  const flush = () => new Promise(setImmediate)
  try {
    activate('poll')
    useFeaturedPoisPolling('poll')
    assert.equal(requests.length, 1, 'first request starts immediately')
    for (let failure = 1; failure <= 3; failure++) {
      requests.shift().reject(new AxiosError('offline', 'ERR_NETWORK'))
      await flush()
      if (failure < 3) {
        assert.equal(timers.length, 1)
        const timer = timers.shift()
        assert.equal(timer.delay, 3000 * 2 ** failure)
        timer.callback()
      }
    }
    assert.equal(timers.length, 0, 'third consecutive error stops polling')
    cleanup()

    useFeaturedPoisPolling('poll')
    requests.shift().resolve({ status: 'PENDING', poiMarkers: [] })
    await flush()
    assert.equal(timers[0].delay, 3000)
    timers.shift().callback()
    requests.shift().resolve(ready('done'))
    await flush()
    assert.equal(timers.length, 0, 'READY stops polling')
    cleanup()

    useFeaturedPoisPolling('poll')
    const request = requests.shift()
    cleanup()
    assert.equal(request.signal.aborted, true)
    request.resolve({ status: 'PENDING', poiMarkers: [] })
    await flush()
    assert.equal(timers.length, 0, 'cleanup prevents rescheduling')
  } finally {
    require.cache[reactPath].exports = originalReact
    require.cache[storePath].exports = originalStore
  }
})

test('accepted retry restarts preview polling and tolerates the queued job still showing old FAILED', async () => {
  activate('retry-flow')
  const failedAt = '2026-10-08T10:00:00.000Z'
  const initial = load('retry-flow')
  requests
    .shift()
    .resolve({
      status: 'FAILED',
      poiEnrichedFailedAt: failedAt,
      poiMarkers: [],
    })
  await initial
  assert.equal(state().poiEnrichedFailedAt, failedAt)
  const stale = load('retry-flow')
  const staleRequest = requests.shift()
  const version = state().featuredPoisPollVersion
  const retry = state().reEnrichRoutePois('retry-flow')
  await state().reEnrichRoutePois('retry-flow')
  assert.equal(retryRequests.length, 1, 'coalesces concurrent POSTs')
  retryRequests.shift().resolve()
  await retry
  assert.equal(state().poiStatus, 'PENDING')
  assert.equal(state().featuredPoisPollVersion, version + 1)
  staleRequest.resolve({
    status: 'FAILED',
    poiEnrichedFailedAt: failedAt,
    poiMarkers: [],
  })
  assert.deepEqual(await stale, { kind: 'cancelled' })
  const queued = load('retry-flow')
  requests
    .shift()
    .resolve({
      status: 'FAILED',
      poiEnrichedFailedAt: failedAt,
      poiMarkers: [],
    })
  assert.deepEqual(await queued, { kind: 'success', status: 'PENDING' })
  const final = load('retry-flow')
  requests
    .shift()
    .resolve({
      status: 'FAILED',
      poiEnrichedFailedAt: '2026-10-08T10:15:00.000Z',
      poiMarkers: [],
    })
  assert.deepEqual(await final, { kind: 'success', status: 'FAILED' })
})

test('POST failures are handled and obsolete completions do not mutate another route', async () => {
  activate('post-error')
  store.setState({ poiStatus: 'FAILED', poiEnrichedFailedAt: null })
  const retry = state().reEnrichRoutePois('post-error')
  retryRequests.shift().reject(new AxiosError('offline', 'ERR_NETWORK'))
  await assert.doesNotReject(retry)
  assert.equal(state().poiStatus, 'FAILED')
  assert.equal(state().isReEnriching, false)
  assert.ok(state().reEnrichmentError)
  const old = state().reEnrichRoutePois('post-error')
  const oldRequest = retryRequests.shift()
  activate('other')
  const version = state().featuredPoisPollVersion
  oldRequest.resolve()
  await old
  assert.equal(state().featuredPoisPollVersion, version)
  assert.equal(state().reEnrichmentError, null)
})

test('auto retry respects cooldown, late ownership, route changes and one POST per failure', async (t) => {
  const reactPath = require.resolve('react')
  const storePath =
    require.resolve('../src/features/route/store/route.store.ts')
  const hookPath =
    require.resolve('../src/features/route/hooks/usePoiEnrichmentRetry.ts')
  const originalReact = require.cache[reactPath].exports
  const originalStore = require.cache[storePath].exports
  const ref = { current: new Set() }
  let cleanup
  require.cache[reactPath].exports = {
    ...originalReact,
    useRef: () => ref,
    useEffect: (effect) => {
      cleanup?.()
      cleanup = effect()
    },
  }
  require.cache[storePath].exports = {
    useRouteStore: (selector) => selector(state()),
  }
  delete require.cache[hookPath]
  const { usePoiEnrichmentRetry } = require(hookPath)
  const timers = []
  let now = Date.parse('2026-10-08T10:09:00.000Z')
  t.mock.method(Date, 'now', () => now)
  t.mock.method(global, 'setTimeout', (callback, delay) => {
    const timer = { callback, delay }
    timers.push(timer)
    return timer
  })
  t.mock.method(global, 'clearTimeout', (timer) => {
    const index = timers.indexOf(timer)
    if (index >= 0) timers.splice(index, 1)
  })
  try {
    activate('auto')
    store.setState({
      poiStatus: 'FAILED',
      poiEnrichedFailedAt: '2026-10-08T10:00:00.000Z',
    })
    usePoiEnrichmentRetry('auto', false)
    assert.equal(timers.length, 0)
    usePoiEnrichmentRetry('auto', true)
    assert.equal(timers[0].delay, 60000)
    activate('elsewhere')
    usePoiEnrichmentRetry('auto', true)
    assert.equal(timers.length, 0, 'route change cancels timer')
    activate('auto')
    store.setState({
      poiStatus: 'FAILED',
      poiEnrichedFailedAt: '2026-10-08T10:00:00.000Z',
    })
    now += 60000
    usePoiEnrichmentRetry('auto', true)
    assert.equal(timers[0].delay, 0, 'eligible exactly at 10 minutes')
    timers.shift().callback()
    assert.equal(retryRequests.length, 1)
    retryRequests.shift().reject(new AxiosError('offline', 'ERR_NETWORK'))
    await new Promise(setImmediate)
    usePoiEnrichmentRetry('auto', true)
    assert.equal(timers.length, 0, 'no repeated POST loop after rejection')
    store.setState({ poiEnrichedFailedAt: '2026-10-08T10:10:00.000Z' })
    usePoiEnrichmentRetry('auto', true)
    assert.equal(timers[0].delay, 600000, 'fresh failure has a fresh cooldown')
    cleanup()
    assert.equal(timers.length, 0)
  } finally {
    require.cache[reactPath].exports = originalReact
    require.cache[storePath].exports = originalStore
    delete require.cache[hookPath]
  }
})

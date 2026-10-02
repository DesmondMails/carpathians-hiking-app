import { useEffect } from 'react'

import { RoutePoiEnrichmentStatusOptions } from '@hiking/shared'

import { useRouteStore } from '../store/route.store'

const POLL_INTERVAL_MS = 3000
const MAX_CONSECUTIVE_ERRORS = 3

export function useFeaturedPoisPolling(routeId: string) {
  const activeRouteId = useRouteStore((state) => state.activeRouteId)

  const loadFeaturedRoutePois = useRouteStore(
    (state) => state.loadFeaturedRoutePois,
  )

  useEffect(() => {
    if (!routeId || activeRouteId !== routeId) return

    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    let consecutiveErrors = 0

    const poll = async () => {
      const result = await loadFeaturedRoutePois(routeId, controller.signal)
      if (controller.signal.aborted || result.kind === 'cancelled') return

      if (result.kind === 'error') {
        consecutiveErrors += 1
        if (!result.retryable || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS)
          return
      } else {
        consecutiveErrors = 0
        if (result.status !== RoutePoiEnrichmentStatusOptions.PENDING) return
      }

      timer = setTimeout(
        () => void poll(),
        POLL_INTERVAL_MS * 2 ** consecutiveErrors,
      )
    }

    void poll()

    return () => {
      controller.abort()

      clearTimeout(timer)
    }
  }, [routeId, activeRouteId, loadFeaturedRoutePois])
}

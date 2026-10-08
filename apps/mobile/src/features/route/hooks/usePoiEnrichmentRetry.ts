import { useEffect, useRef } from 'react'

import { useRouteStore } from '../store/route.store'

const RETRY_COOLDOWN_MS = 10 * 60 * 1000

export function usePoiEnrichmentRetry(routeId: string, isOwner: boolean) {
  const activeRouteId = useRouteStore((state) => state.activeRouteId)
  const status = useRouteStore((state) => state.poiStatus)
  const failedAt = useRouteStore((state) => state.poiEnrichedFailedAt)
  const isReEnriching = useRouteStore((state) => state.isReEnriching)
  const retry = useRouteStore((state) => state.reEnrichRoutePois)
  // Do not loop POST requests after a rejection or an unchanged FAILED response.
  const attemptedFailures = useRef(new Set<string>())

  useEffect(() => {
    if (
      !routeId ||
      activeRouteId !== routeId ||
      !isOwner ||
      status !== 'FAILED' ||
      isReEnriching
    )
      return

    const failureKey = JSON.stringify([routeId, failedAt])
    if (attemptedFailures.current.has(failureKey)) return

    // Legacy failures without a timestamp follow the server's immediate-retry rule.
    const retryAt =
      failedAt === null ? Date.now() : Date.parse(failedAt) + RETRY_COOLDOWN_MS
    if (!Number.isFinite(retryAt)) return

    const timer = setTimeout(
      () => {
        attemptedFailures.current.add(failureKey)
        void retry(routeId)
      },
      Math.max(0, retryAt - Date.now()),
    )

    return () => clearTimeout(timer)
  }, [routeId, activeRouteId, isOwner, status, failedAt, isReEnriching, retry])
}

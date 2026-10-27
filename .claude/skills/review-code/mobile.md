# Mobile Review — React Native & Expo

Review changes in apps/mobile.

## Component architecture

- Check component responsibilities.
- Avoid unnecessary complexity.
- Check prop and state ownership.
- Identify excessive re-renders.
- Avoid premature memoization.

## State management

- Review Zustand subscriptions and selectors.
- Check stale state and race conditions.
- Check consistency between server and local state.
- Verify cleanup of subscriptions and listeners.

## React hooks

- Check effect dependencies.
- Detect stale closures.
- Check async cleanup and cancellation.
- Review unnecessary effects.

## Navigation

- Review Expo Router navigation behavior.
- Check deep links and route parameters.
- Check authentication flow and redirects.
- Verify navigation after app restart.

## Native behavior

- Check iOS and Android differences.
- Verify safe areas and keyboard behavior.
- Consider app foreground/background transitions.
- Check runtime permissions.
- Review file picking and upload failures.

## Maps & Location

- Review MapLibre performance.
- Check large GeoJSON datasets.
- Detect unnecessary map re-renders.
- Check location permission handling.
- Review coordinate ordering.
- Check cleanup of location subscriptions.
- Consider offline and poor-network behavior.

## Performance

- Check FlatList and long-list performance.
- Look for unnecessary expensive calculations.
- Review image loading and caching.
- Check potential memory leaks.

## UX & Reliability

- Verify loading, empty and error states.
- Check API failure handling.
- Review user feedback for async operations.
- Consider slow network and app interruptions.

## Testing

Identify missing platform-specific cases.

Prioritize correctness and real performance
issues over stylistic preferences.

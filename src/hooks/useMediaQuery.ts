import { useCallback, useSyncExternalStore } from 'react'

/**
 * Tracks a CSS media query from JS. Needed when layout state has to be known to
 * React itself — a Tailwind breakpoint class can hide a panel, but it cannot
 * tell the component whether that panel should count as open.
 *
 * `matchMedia` is an external store, so it is read through
 * `useSyncExternalStore` rather than mirrored into state from an effect.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', onStoreChange)
      return () => mediaQuery.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

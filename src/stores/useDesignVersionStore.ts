import { create } from 'zustand'

export type DesignVersion = 'v1' | 'v2'

interface DesignVersionState {
  /**
   * Keyed rather than one flat value: a page can carry more than one
   * independently-versioned surface (e.g. User Management's Invite dialog
   * and Request Seats dialog switch separately from each other).
   */
  versions: Record<string, DesignVersion>
  setVersion: (key: string, version: DesignVersion) => void
}

export const useDesignVersionStore = create<DesignVersionState>((set) => ({
  versions: {},
  setVersion: (key, version) => set((state) => ({ versions: { ...state.versions, [key]: version } })),
}))

/**
 * For surfaces that aren't a separate route — a dialog, a panel — so they
 * can still offer the same "prototype only" V1/V2 switch the header already
 * does for whole pages, without needing a URL to hang it on.
 */
export function useDesignVersion(key: string): DesignVersion {
  return useDesignVersionStore((state) => state.versions[key] ?? 'v1')
}

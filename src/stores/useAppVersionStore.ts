import { create } from 'zustand'

/**
 * The whole app's version, distinct from the per-page "V1/V2 design"
 * switcher (`useDesignVersionStore`): that one swaps one page's layout,
 * this one decides whether a handful of newer features (Shifts, Business
 * Plan, Integration) exist in the product at all. V1 is the original
 * feature set; V2 adds them back plus whatever design a page itself offers.
 */
export type AppVersion = 'v1' | 'v2'

interface AppVersionState {
  version: AppVersion
  setVersion: (version: AppVersion) => void
}

export const useAppVersionStore = create<AppVersionState>((set) => ({
  version: 'v1',
  setVersion: (version) => set({ version }),
}))

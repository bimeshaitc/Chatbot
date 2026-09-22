import { LayoutTemplate } from 'lucide-react'
import { useAppVersionStore, type AppVersion } from '@/stores/useAppVersionStore'

interface RequireAppVersionProps {
  minVersion: AppVersion
  children: React.ReactNode
}

/**
 * Route-level gate for the global app-version switch — mirrors
 * `RequirePermission`'s shape, but checks `useAppVersionStore` instead of a
 * role. Blocks the URL, not just the sidebar link, for the same reason
 * `RequirePermission` does: a hidden-but-still-served route is a hole.
 */
export function RequireAppVersion({ minVersion, children }: RequireAppVersionProps) {
  const version = useAppVersionStore((state) => state.version)

  if (minVersion === 'v2' && version === 'v1') {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center">
        <LayoutTemplate className="h-6 w-6 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">Not available in V1</p>
        <p className="max-w-md text-xs text-[#6E7678]">
          This feature ships in V2. Switch the app version in the header to reach it.
        </p>
      </div>
    )
  }

  return <>{children}</>
}

import { channelCanAny, type Permission } from '@/config/roles'
import { useChannels, useTicketAccess, useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { PermissionDenied } from './PermissionDenied'

interface RequirePermissionProps {
  /** An array means "any of these". */
  permission: Permission | Permission[]
  children: React.ReactNode
}

/**
 * Route-level gate.
 *
 * Renders a denied card rather than redirecting: a `<Navigate>` would need an
 * effect, would lose the URL the person typed, and would leave them wondering
 * what happened. Showing the page's own frame with an explanation is both
 * simpler and clearer.
 */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const role = useWorkspaceRoleStore((state) => state.role)
  const channels = useChannels()
  const ticketAccess = useTicketAccess()
  const required = Array.isArray(permission) ? permission : [permission]

  if (!channelCanAny(role, channels, required, ticketAccess)) {
    return (
      <div className="p-4">
        <PermissionDenied permission={required} />
      </div>
    )
  }

  return <>{children}</>
}

import { ShieldAlert } from 'lucide-react'
import { lowestRoleWith, ROLE_DESCRIPTIONS, type Permission } from '@/config/roles'
import { PERMISSION_LABELS } from '@/config/permissionCatalog'
import { useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'

interface PermissionDeniedProps {
  title?: string
  /** When given, the notice names what is missing and who has it. */
  permission?: Permission | Permission[]
}

/**
 * The one "not available for your role" state, shared by every gated surface.
 *
 * It names the missing permission and the least-privileged role that holds it,
 * because a denial that does not say what is missing reads as a bug.
 */
export function PermissionDenied({ title = 'Not available for your role', permission }: PermissionDeniedProps) {
  const role = useWorkspaceRoleStore((state) => state.role)

  const required = permission ? (Array.isArray(permission) ? permission : [permission]) : []
  const firstRequired = required[0]
  const grantedTo = firstRequired ? lowestRoleWith(firstRequired) : null

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center">
      <ShieldAlert className="h-6 w-6 text-gray-300" />
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="max-w-md text-xs text-[#6E7678]">{ROLE_DESCRIPTIONS[role]}</p>

      {firstRequired && (
        <p className="max-w-md text-xs text-[#6E7678]">
          This needs <span className="font-medium text-gray-700">{PERMISSION_LABELS[firstRequired]}</span>
          {grantedTo && (
            <>
              , which <span className="font-medium text-gray-700">{grantedTo}</span> and above hold
            </>
          )}
          . Use the role picker in the header to switch.
        </p>
      )}
    </div>
  )
}

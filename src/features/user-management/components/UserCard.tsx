import { Mail, MailCheck, MoreVertical, Pencil, RotateCw, ShieldOff, UserMinus, UserCheck, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { AppUser } from '../types'
import { availabilityMeta, channelLabel, roleMeta, statusMeta, ticketAccessMeta } from '../utils/userMeta'

interface UserCardProps {
  user: AppUser
  isSelf: boolean
  canEdit: boolean
  canSuspend: boolean
  canRemove: boolean
  /** Blocked when this is the workspace's only Owner. */
  demotionBlockedReason: string | null
  onEdit: (user: AppUser) => void
  onSuspend: (user: AppUser) => void
  onReactivate: (user: AppUser) => void
  onRemove: (user: AppUser) => void
  onResendInvite: (user: AppUser) => void
  onRevokeInvite: (user: AppUser) => void
}

export function UserCard({
  user,
  isSelf,
  canEdit,
  canSuspend,
  canRemove,
  demotionBlockedReason,
  onEdit,
  onSuspend,
  onReactivate,
  onRemove,
  onResendInvite,
  onRevokeInvite,
}: UserCardProps) {
  const role = roleMeta[user.role]
  const status = statusMeta[user.status]
  const availability = availabilityMeta[user.availability]
  const isInvited = user.status === 'invited'
  const isSuspended = user.status === 'suspended'
  const atCapacity = user.activeChats >= user.chatLimit
  const loadPercent = user.chatLimit === 0 ? 0 : Math.min((user.activeChats / user.chatLimit) * 100, 100)

  // An action menu with nothing in it is worse than no menu at all.
  const hasActions = canEdit || canSuspend || canRemove

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border border-transparent bg-[#F7F7F8] p-4 transition-colors',
        isSuspended && 'border-rose-100 bg-rose-50/40',
        isInvited && 'border-amber-100 bg-amber-50/30',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className={cn('h-11 w-11 rounded-full object-cover', isSuspended && 'grayscale')}
              />
            ) : (
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold',
                  user.avatarColor,
                  isSuspended && 'grayscale',
                )}
              >
                {user.initials}
              </span>
            )}
            <span
              title={availability.label}
              className={cn('absolute right-0 bottom-0 h-3 w-3 rounded-full ring-2 ring-white', availability.dot)}
            />
          </span>

          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-900">
              {user.firstName} {user.lastName}
              {isSelf && <span className="shrink-0 text-[11px] font-medium text-gray-400">(you)</span>}
            </p>
            <p className="truncate text-xs text-[#6E7678]">{user.jobTitle}</p>
          </div>
        </div>

        {hasActions && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions for ${user.firstName} ${user.lastName}`}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-gray-600"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-52">
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Pencil className="h-4 w-4" />
                  Edit role &amp; access
                </DropdownMenuItem>
              )}

              {isInvited ? (
                <>
                  <DropdownMenuItem onClick={() => onResendInvite(user)}>
                    <MailCheck className="h-4 w-4" />
                    Resend invitation
                  </DropdownMenuItem>
                  {canRemove && (
                    <DropdownMenuItem variant="destructive" onClick={() => onRevokeInvite(user)}>
                      <X className="h-4 w-4" />
                      Revoke invitation
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                <>
                  {canSuspend && <DropdownMenuSeparator />}
                  {canSuspend &&
                    (isSuspended ? (
                      <DropdownMenuItem onClick={() => onReactivate(user)}>
                        <RotateCw className="h-4 w-4" />
                        Restore access
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={Boolean(demotionBlockedReason)}
                        onClick={() => onSuspend(user)}
                      >
                        <ShieldOff className="h-4 w-4" />
                        Suspend access
                      </DropdownMenuItem>
                    ))}
                  {canRemove && (
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={Boolean(demotionBlockedReason)}
                      onClick={() => onRemove(user)}
                    >
                      <UserMinus className="h-4 w-4" />
                      Remove from workspace
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        <Badge className={role.className}>{role.label}</Badge>
        {/* Only badge the exceptions. "Active" on six of eight cards is noise
            that makes the two that need attention harder to spot. */}
        {user.status !== 'active' && <Badge className={status.className}>{status.label}</Badge>}
        {atCapacity && !isInvited && !isSuspended && <Badge className="bg-rose-50 text-rose-700">At capacity</Badge>}
        {/* Same "only badge the exception" rule: silent when a CSR works both
            channels (the default), badged when an Owner/CSR Admin has narrowed it. */}
        {user.role === 'CSR' && user.channels && user.channels.length === 1 && (
          <Badge variant="blue">{channelLabel(user.channels)}</Badge>
        )}
        {/* Same rule again: silent when a ticket-channel CSR can edit (the
            default), badged when narrowed to view-only. */}
        {user.role === 'CSR' && user.channels?.includes('tickets') && user.ticketAccess === 'view' && (
          <Badge variant="amber">Tickets: {ticketAccessMeta.view.label.toLowerCase()}</Badge>
        )}
      </div>

      {isInvited ? (
        <div className="rounded-lg border border-amber-100 bg-white px-3 py-2 text-xs text-amber-700">
          Invited {user.invitedOn}. Waiting for them to sign in with their Mercury account.
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className={cn('flex items-center gap-1.5 font-medium', availability.textColor)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', availability.dot)} />
              {availability.label}
            </span>
            <span className={cn('font-medium', atCapacity ? 'text-rose-600' : 'text-gray-500')}>
              {user.activeChats}/{user.chatLimit} chats
            </span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn('h-full rounded-full', atCapacity ? 'bg-rose-500' : 'bg-[#1B5E20]')}
              style={{ width: `${loadPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {user.groups.length === 0 ? (
          <span className="text-xs text-gray-400">No groups assigned</span>
        ) : (
          user.groups.map((group) => (
            <Badge key={group} variant="gray">
              {group}
            </Badge>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-200 pt-3 text-xs text-gray-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{user.email}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <UserCheck className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          {user.lastActive}
        </span>
      </div>

      {demotionBlockedReason && (
        <p className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] text-gray-500">{demotionBlockedReason}</p>
      )}
    </div>
  )
}

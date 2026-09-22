import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { ALL_CHANNELS, ROLE_DESCRIPTIONS, type TicketAccessLevel, type WorkChannel } from '@/config/roles'
import { cn } from '@/lib/utils'
import { availabilityOptions, chatLimitOptions, roleOptions } from '../data/mockUserManagementData'
import type { AgentAvailability, AppUser, UserRole } from '../types'
import { availabilityMeta, roleMeta, ticketAccessMeta } from '../utils/userMeta'
import type { UserAccessChanges } from './EditUserDialog'

const CHANNEL_OPTIONS: { value: WorkChannel[]; label: string }[] = [
  { value: ['chat', 'tickets'], label: 'Chat + Tickets' },
  { value: ['chat'], label: 'Chat only' },
  { value: ['tickets'], label: 'Tickets only' },
]

const TICKET_ACCESS_OPTIONS: TicketAccessLevel[] = ['edit', 'view']

function sameChannels(a: WorkChannel[], b: WorkChannel[]) {
  return a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index])
}

interface EditUserDialogV2Props {
  user: AppUser
  canChangeRole: boolean
  canSetCapacity: boolean
  canManageGroups: boolean
  /** Set when this person's role must not change (e.g. the only Owner). */
  roleLockedReason: string | null
  assignableRoles: UserRole[]
  groupOptions: string[]
  onClose: () => void
  onSave: (changes: UserAccessChanges) => void
}

/**
 * V2 visual redesign of Edit role & access — role picked from a row of
 * compact pills instead of full description cards (same trade as Invite V2),
 * and groups/channel/ticket permission/capacity/availability folded into two
 * panels ("Access" and "Capacity") instead of five stacked sections.
 */
export function EditUserDialogV2({
  user,
  canChangeRole,
  canSetCapacity,
  canManageGroups,
  roleLockedReason,
  assignableRoles,
  groupOptions,
  onClose,
  onSave,
}: EditUserDialogV2Props) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [groups, setGroups] = useState<string[]>(user.groups)
  const [chatLimit, setChatLimit] = useState(user.chatLimit)
  const [availability, setAvailability] = useState<AgentAvailability>(user.availability)
  const [channels, setChannels] = useState<WorkChannel[]>(user.channels ?? ALL_CHANNELS)
  const [ticketAccess, setTicketAccess] = useState<TicketAccessLevel>(user.ticketAccess ?? 'edit')

  const roleEditable = canChangeRole && !roleLockedReason

  function toggleGroup(group: string) {
    setGroups((prev) => (prev.includes(group) ? prev.filter((entry) => entry !== group) : [...prev, group]))
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>
            {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          <p className="text-xs text-[#6E7678]">
            {user.email} · {user.jobTitle}
          </p>

          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              Role
              {!roleEditable && <Lock className="h-3 w-3 text-gray-400" />}
            </span>
            {roleEditable ? (
              <div className="flex flex-wrap gap-1.5">
                {roleOptions
                  .filter((option) => assignableRoles.includes(option))
                  .map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      title={ROLE_DESCRIPTIONS[option]}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        role === option
                          ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      {roleMeta[option].label}
                    </button>
                  ))}
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', roleMeta[role].className)}>
                  {roleMeta[role].label}
                </span>
                <p className="mt-1 text-xs text-[#6E7678]">
                  {roleLockedReason ?? 'Your role cannot change roles in this workspace.'}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 p-3.5">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Access</p>

            <div className="mt-3 flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                Groups
                {!canManageGroups && <Lock className="h-3 w-3 text-gray-400" />}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {groupOptions.map((group) => (
                  <button
                    key={group}
                    type="button"
                    disabled={!canManageGroups}
                    onClick={() => toggleGroup(group)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                      groups.includes(group)
                        ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {role === 'CSR' && (
              <>
                <div className="mt-3 flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    Channel access
                    {!canManageGroups && <Lock className="h-3 w-3 text-gray-400" />}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CHANNEL_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        disabled={!canManageGroups}
                        onClick={() => setChannels(option.value)}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                          sameChannels(channels, option.value)
                            ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {channels.includes('tickets') && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-gray-500">Ticket permission</span>
                    <div className="flex flex-wrap gap-1.5">
                      {TICKET_ACCESS_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          disabled={!canManageGroups}
                          onClick={() => setTicketAccess(option)}
                          title={ticketAccessMeta[option].description}
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                            ticketAccess === option
                              ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                          )}
                        >
                          {ticketAccessMeta[option].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 p-3.5">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Capacity</p>

            <div className="mt-3 flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                Concurrent chat limit
                {!canSetCapacity && <Lock className="h-3 w-3 text-gray-400" />}
              </span>
              <div className="flex flex-wrap gap-1">
                {chatLimitOptions.map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    disabled={!canSetCapacity}
                    onClick={() => setChatLimit(limit)}
                    className={cn(
                      'h-7 w-7 rounded-md border text-xs font-medium transition-colors disabled:opacity-50',
                      chatLimit === limit
                        ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {limit}
                  </button>
                ))}
              </div>
              {chatLimit < user.activeChats && (
                <p className="text-xs text-amber-600">
                  They already have {user.activeChats} chats open. Existing chats stay put; the new limit applies to
                  routing.
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                Availability
                {!canSetCapacity && <Lock className="h-3 w-3 text-gray-400" />}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availabilityOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={!canSetCapacity}
                    onClick={() => setAvailability(option)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                      availability === option ? 'border-gray-900 bg-white text-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', availabilityMeta[option].dot)} />
                    {availabilityMeta[option].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton
            className="w-auto px-6"
            onClick={() => onSave({ role, groups, chatLimit, availability, channels, ticketAccess })}
          >
            Save changes
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

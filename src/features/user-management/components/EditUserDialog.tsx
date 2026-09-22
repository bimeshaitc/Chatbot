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
import { ALL_CHANNELS, type TicketAccessLevel, type WorkChannel } from '@/config/roles'
import { cn } from '@/lib/utils'
import { availabilityOptions } from '../data/mockUserManagementData'
import type { AgentAvailability, AppUser, UserRole } from '../types'
import { availabilityMeta, ticketAccessMeta } from '../utils/userMeta'

export interface UserAccessChanges {
  role: UserRole
  groups: string[]
  chatLimit: number
  availability: AgentAvailability
  /** Ignored unless `role` ends up `CSR` — see `AppUser.channels`. */
  channels: WorkChannel[]
  /** Ignored unless `channels` ends up including `'tickets'` — see `AppUser.ticketAccess`. */
  ticketAccess: TicketAccessLevel
}

const CHANNEL_OPTIONS: { value: WorkChannel[]; label: string }[] = [
  { value: ['chat', 'tickets'], label: 'Chat + Tickets' },
  { value: ['chat'], label: 'Chat only' },
  { value: ['tickets'], label: 'Tickets only' },
]

const TICKET_ACCESS_OPTIONS: TicketAccessLevel[] = ['edit', 'view']

function sameChannels(a: WorkChannel[], b: WorkChannel[]) {
  return a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index])
}

interface EditUserDialogProps {
  user: AppUser
  canSetCapacity: boolean
  canManageGroups: boolean
  groupOptions: string[]
  onClose: () => void
  onSave: (changes: UserAccessChanges) => void
}

/**
 * Role and concurrent chat limit moved to `EditUserDialogV2` — see the
 * header's "Edit design" switcher. This v1 dialog no longer changes either;
 * it submits them back unchanged so `onSave` still gets a complete
 * `UserAccessChanges`.
 */
export function EditUserDialog({
  user,
  canSetCapacity,
  canManageGroups,
  groupOptions,
  onClose,
  onSave,
}: EditUserDialogProps) {
  const role = user.role
  const chatLimit = user.chatLimit
  const [groups, setGroups] = useState<string[]>(user.groups)
  const [availability, setAvailability] = useState<AgentAvailability>(user.availability)
  const [channels, setChannels] = useState<WorkChannel[]>(user.channels ?? ALL_CHANNELS)
  const [ticketAccess, setTicketAccess] = useState<TicketAccessLevel>(user.ticketAccess ?? 'edit')

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
      <DialogContent size="xl">
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
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50',
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
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                Channel access
                {!canManageGroups && <Lock className="h-3 w-3 text-gray-400" />}
              </span>
              <p className="text-xs text-[#6E7678]">Which queue this CSR works. CSR Admin and up always work both.</p>
              <div className="flex flex-wrap gap-1.5">
                {CHANNEL_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    disabled={!canManageGroups}
                    onClick={() => setChannels(option.value)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                      sameChannels(channels, option.value)
                        ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {channels.includes('tickets') && (
                <div className="mt-1 flex flex-col gap-1.5 border-t border-gray-100 pt-3">
                  <span className="text-xs font-medium text-gray-700">Ticket permission</span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {TICKET_ACCESS_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        disabled={!canManageGroups}
                        onClick={() => setTicketAccess(option)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-50',
                          ticketAccess === option
                            ? 'border-[#1B5E20] bg-[#1B5E20]/5'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        )}
                      >
                        <span className="block text-xs font-medium text-gray-900">{ticketAccessMeta[option].label}</span>
                        <span className="mt-0.5 block text-[11px] text-[#6E7678]">
                          {ticketAccessMeta[option].description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
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
                    'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                    availability === option ? 'border-gray-900 bg-white text-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', availabilityMeta[option].dot)} />
                  {availabilityMeta[option].label}
                </button>
              ))}
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

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { chatLimitOptions, roleOptions } from '../data/mockUserManagementData'
import type { InviteUserInput, UserRole } from '../types'
import { roleMeta } from '../utils/userMeta'

interface InviteUserDialogV2Props {
  seatsRemaining: number
  totalSeats: number
  assignableRoles: UserRole[]
  existingEmails: string[]
  /** Emails with an existing Mercury platform account — invite is only valid against one of these. */
  knownAccountEmails: string[]
  groupOptions: string[]
  onClose: () => void
  onInvite: (input: InviteUserInput) => void
}

/**
 * V2 visual redesign of Invite to workspace — a seat-usage bar up top instead
 * of a text note, role picked from a row of compact pills instead of full
 * description cards, and groups/chat limit folded into one "Defaults" panel
 * so the form reads as three questions instead of five.
 */
export function InviteUserDialogV2({
  seatsRemaining,
  totalSeats,
  assignableRoles,
  existingEmails,
  knownAccountEmails,
  groupOptions,
  onClose,
  onInvite,
}: InviteUserDialogV2Props) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('CSR')
  const [jobTitle, setJobTitle] = useState('')
  const [groups, setGroups] = useState<string[]>([])
  const [chatLimit, setChatLimit] = useState(3)
  const [error, setError] = useState<string | null>(null)

  const seatsUsed = totalSeats - seatsRemaining
  const usagePct = totalSeats > 0 ? Math.min(100, Math.round((seatsUsed / totalSeats) * 100)) : 0

  function toggleGroup(group: string) {
    setGroups((prev) => (prev.includes(group) ? prev.filter((entry) => entry !== group) : [...prev, group]))
  }

  function handleSubmit() {
    const trimmed = email.trim().toLowerCase()

    if (!trimmed) {
      setError('Enter the email on their Mercury account.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('That does not look like an email address.')
      return
    }
    if (existingEmails.some((existing) => existing.toLowerCase() === trimmed)) {
      setError('That account is already in this workspace.')
      return
    }
    if (!knownAccountEmails.some((known) => known.toLowerCase() === trimmed)) {
      setError('No Mercury account exists for this email. They need to create one before you can invite them.')
      return
    }
    if (seatsRemaining <= 0) {
      setError('No seats available. Ask the Mercury admin for more first.')
      return
    }

    setError(null)
    onInvite({ email: trimmed, role, groups, jobTitle: jobTitle.trim() || 'Support Agent', chatLimit })
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
          <DialogTitle>Invite to workspace</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          <div className="rounded-xl border border-gray-100 bg-[#F7F7F8] p-3.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-gray-700">Seats in use</span>
              <span className="text-gray-500">
                {seatsUsed} of {totalSeats}
                {seatsRemaining <= 0 && <span className="ml-1 font-medium text-rose-600">· full</span>}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn('h-full rounded-full', seatsRemaining <= 0 ? 'bg-rose-500' : 'bg-[#1B5E20]')}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>

          <Input
            label="Mercury account email *"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Role *</span>
            <div className="flex flex-wrap gap-1.5">
              {roleOptions
                .filter((option) => assignableRoles.includes(option))
                .map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
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
          </div>

          <div className="rounded-xl border border-gray-100 p-3.5">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Defaults</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Job title" placeholder="Support Agent" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500">Concurrent chat limit</span>
                <div className="flex flex-wrap gap-1">
                  {chatLimitOptions.map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setChatLimit(limit)}
                      className={cn(
                        'h-7 w-7 rounded-md border text-xs font-medium transition-colors',
                        chatLimit === limit
                          ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      {limit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-500">Groups</span>
              <div className="flex flex-wrap gap-1.5">
                {groupOptions.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
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
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton className="w-auto px-6" disabled={seatsRemaining <= 0} onClick={handleSubmit}>
            Send invitation
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

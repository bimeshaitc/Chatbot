import { useState } from 'react'
import { Info } from 'lucide-react'
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
import { ROLE_DESCRIPTIONS } from '@/config/roles'
import { cn } from '@/lib/utils'
import { chatLimitOptions, roleOptions } from '../data/mockUserManagementData'
import type { InviteUserInput, UserRole } from '../types'
import { roleMeta } from '../utils/userMeta'

interface InviteUserDialogProps {
  seatsRemaining: number
  /** Roles the current viewer is allowed to hand out. */
  assignableRoles: UserRole[]
  existingEmails: string[]
  /** Emails with an existing Mercury platform account — invite is only valid against one of these. */
  knownAccountEmails: string[]
  groupOptions: string[]
  onClose: () => void
  onInvite: (input: InviteUserInput) => void
}

export function InviteUserDialog({
  seatsRemaining,
  assignableRoles,
  existingEmails,
  knownAccountEmails,
  groupOptions,
  onClose,
  onInvite,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('CSR')
  const [jobTitle, setJobTitle] = useState('')
  const [groups, setGroups] = useState<string[]>([])
  const [chatLimit, setChatLimit] = useState(3)
  const [error, setError] = useState<string | null>(null)

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
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Invite to workspace</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          <p className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-[#6E7678]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
            The Mercury admin creates accounts. Invite one that already exists and it takes one of your{' '}
            <span className="font-medium text-gray-700">{seatsRemaining} remaining</span> seats.
          </p>

          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            <Input
              label="Mercury account email *"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
            />
            <Input
              label="Job title"
              placeholder="Support Agent"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Role *</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {roleOptions
                .filter((option) => assignableRoles.includes(option))
                .map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left transition-colors',
                      role === option
                        ? 'border-[#1B5E20] bg-[#1B5E20]/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    )}
                  >
                    <span
                      className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', roleMeta[option].className)}
                    >
                      {roleMeta[option].label}
                    </span>
                    <span className="mt-1 block text-xs text-[#6E7678]">{ROLE_DESCRIPTIONS[option]}</span>
                  </button>
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Groups</span>
            <div className="flex flex-wrap gap-1.5">
              {groupOptions.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    groups.includes(group)
                      ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {group}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">Groups decide which chats route to them. None means every group.</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Concurrent chat limit</span>
            <div className="flex flex-wrap gap-1.5">
              {chatLimitOptions.map((limit) => (
                <button
                  key={limit}
                  type="button"
                  onClick={() => setChatLimit(limit)}
                  className={cn(
                    'h-8 w-8 rounded-lg border text-xs font-medium transition-colors',
                    chatLimit === limit
                      ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {limit}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">3 suits a new agent; raise it to 6 once they are experienced.</p>
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

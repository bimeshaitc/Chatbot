import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
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
import { useCategories } from '@/features/category'
import type { NewTicketInput, TicketPriority } from '../types'
import { ticketAgents } from '../data/mockTicketsData'
import { priorityMeta, ticketPriorities } from '../utils/ticketMeta'
import { eligibleTicketAssignees } from '../utils/assigneeEligibility'

const UNASSIGNED = 'unassigned'

interface CreateTicketDialogProps {
  onClose: () => void
  onCreate: (input: NewTicketInput, requester: { name: string; email: string }) => void
}

export function CreateTicketDialog({ onClose, onCreate }: CreateTicketDialogProps) {
  const { activeCategories } = useCategories()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [requesterEmail, setRequesterEmail] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('medium')
  const [categoryId, setCategoryId] = useState(activeCategories[0]?.id ?? '')
  const [assigneeId, setAssigneeId] = useState(UNASSIGNED)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!subject.trim()) {
      setError('Give the ticket a subject.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail.trim())) {
      setError('Enter a valid requester email.')
      return
    }

    setError(null)
    onCreate(
      {
        subject: subject.trim(),
        description: description.trim(),
        priority,
        categoryId,
        assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
      },
      { name: requesterName.trim(), email: requesterEmail.trim() },
    )
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
          <DialogTitle>New ticket</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          <Input
            label="Subject *"
            placeholder="E.g, Invoice missing VAT number"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            <Input
              label="Requester name"
              placeholder="Leave blank if you only have an email"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
            />
            <Input
              label="Requester email *"
              placeholder="name@company.com"
              value={requesterEmail}
              onChange={(e) => setRequesterEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">First message</span>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context for whoever picks this up. Saved as an internal note."
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Priority</span>
            <div className="flex flex-wrap gap-1.5">
              {ticketPriorities.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    priority === value
                      ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {priorityMeta[value].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Category</span>
              <div className="flex flex-wrap gap-1.5">
                {activeCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(category.id)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      categoryId === category.id
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Assignee</span>
              <div className="flex flex-wrap gap-1.5">
                {[{ id: UNASSIGNED, name: 'Unassigned' }, ...eligibleTicketAssignees(ticketAgents)].map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setAssigneeId(agent.id)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      assigneeId === agent.id
                        ? 'border-gray-900 bg-gray-50 text-gray-900'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {agent.name}
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
          <DialogPrimaryButton className="w-auto px-6" onClick={handleSubmit}>
            Create ticket
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

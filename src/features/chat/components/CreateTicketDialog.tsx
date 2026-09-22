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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { agents } from '../data/mockChatData'
import type { NewTicketInput, TicketPriority } from '@/features/tickets'
import { useCategories } from '@/features/category'
import type { Conversation } from '../types'

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const UNASSIGNED = 'unassigned'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CreateTicketDialogProps {
  conversation: Conversation
  /** Already on file — from a real CRM record or an earlier ticket. `null` means still unknown. */
  knownEmail: string | null
  isSubmitting?: boolean
  onClose: () => void
  /**
   * `email` is only passed when this dialog just collected it fresh — the
   * caller is the one who decides whether that's worth remembering on the
   * conversation, this component only knows it was asked for.
   */
  onCreate: (input: NewTicketInput, email?: string) => void
}

export function CreateTicketDialog({
  conversation,
  knownEmail,
  isSubmitting = false,
  onClose,
  onCreate,
}: CreateTicketDialogProps) {
  const { activeCategories } = useCategories()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('medium')
  // Seeded from the conversation so the common case is a two-click create.
  const [categoryId, setCategoryId] = useState(conversation.categoryId)
  const [assigneeId, setAssigneeId] = useState(conversation.assignedAgentId || UNASSIGNED)
  const [emailDraft, setEmailDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!subject.trim()) {
      setError('Subject is required.')
      return
    }
    // A ticket is async by nature — someone has to be reachable after this
    // chat ends, so this is the one thing here that can't be skipped.
    if (!knownEmail && !EMAIL_PATTERN.test(emailDraft.trim())) {
      setError('Enter a valid email so our team can follow up.')
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
      knownEmail ? undefined : emailDraft.trim(),
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Ticket</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <p className="text-xs text-gray-500">
            Raising a ticket for the chat with <span className="font-medium text-gray-700">{conversation.customer}</span>.
          </p>

          {/* Only asked when nothing is on file — a ticket needs a reply
              channel, so this is the one moment identity can't stay optional.
              Skipped entirely once we already have an email, from anywhere. */}
          {knownEmail ? (
            <p className="text-xs text-gray-500">
              We'll send updates to <span className="font-medium text-gray-700">{knownEmail}</span>.
            </p>
          ) : (
            <Input
              label="Customer email *"
              placeholder="Ask them, then enter it here"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
            />
          )}

          <Input
            label="Subject *"
            placeholder="E.g, Card declined at checkout"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any context that will help whoever picks this up"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Priority</span>
              <Select value={priority} onValueChange={(value) => setPriority(value as TicketPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Category</span>
              <Select value={categoryId} onValueChange={(value) => setCategoryId(value as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Assignee</span>
            <Select value={assigneeId} onValueChange={(value) => setAssigneeId(value as string)}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton className="w-auto px-6" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
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
import { agents } from '../data/mockChatData'
import { CHAT_INELIGIBLE_LABEL, chatIneligibilityReason } from '../utils/agentEligibility'
import type { Conversation } from '../types'

interface TransferChatDialogProps {
  conversation: Conversation
  onClose: () => void
  onTransfer: (agentId: string, note: string) => void
}

export function TransferChatDialog({ conversation, onClose, onTransfer }: TransferChatDialogProps) {
  const [agentId, setAgentId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Transferring to whoever already holds the chat is a no-op, so keep them out.
  const options = agents
    .filter((agent) => agent.id !== conversation.assignedAgentId)
    .map((agent) => ({ agent, ineligible: chatIneligibilityReason(agent) }))
  const hasEligibleOption = options.some((option) => !option.ineligible)
  const currentAgent = agents.find((agent) => agent.id === conversation.assignedAgentId)

  function handleSubmit() {
    if (!agentId) {
      setError('Choose who should take this chat.')
      return
    }
    onTransfer(agentId, note.trim())
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Transfer Chat</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <p className="text-xs text-gray-500">
            Currently with <span className="font-medium text-gray-700">{currentAgent?.name ?? 'nobody'}</span>. Pick who
            should pick it up.
          </p>

          {options.length === 0 ? (
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              No other agent is available to take this chat.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {options.map(({ agent, ineligible }) => {
                const initials = agent.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')

                return (
                  <button
                    key={agent.id}
                    type="button"
                    disabled={Boolean(ineligible)}
                    onClick={() => {
                      setAgentId(agent.id)
                      setError(null)
                    }}
                    title={ineligible ? CHAT_INELIGIBLE_LABEL[ineligible] : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors',
                      ineligible
                        ? 'cursor-not-allowed border-gray-100 opacity-60'
                        : agentId === agent.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[11px] font-semibold text-sky-700">
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-gray-900">{agent.name}</span>
                    {ineligible && (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        {CHAT_INELIGIBLE_LABEL[ineligible]}
                      </span>
                    )}
                  </button>
                )
              })}
              {!hasEligibleOption && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  No eligible agent can take this chat right now — it will stay with the current handler until one becomes available.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Note for the next agent</span>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional context to hand over"
              rows={3}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton className="w-auto px-6" disabled={!hasEligibleOption} onClick={handleSubmit}>
            Transfer
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { Sparkles } from 'lucide-react'
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
import type { Conversation } from '../types'

interface NewAssignmentModalProps {
  conversation: Conversation
  onDismiss: () => void
  onViewChat: () => void
}

/**
 * Interrupts, on purpose. The ring/badge on the list row and the strip in the
 * header only work if you happen to be looking at that part of the screen —
 * this is the version that finds you wherever you are in the app, the moment
 * a chat lands on you.
 *
 * "Dismiss" only stops this popup from reappearing for this chat; it does not
 * clear the list badge or the header banner — those stay until the chat is
 * actually opened, same as before. Popping up is "notice this"; opening it is
 * "handled it".
 */
export function NewAssignmentModal({ conversation, onDismiss, onViewChat }: NewAssignmentModalProps) {
  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onDismiss()
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
            New chat assigned to you
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${conversation.avatarColor}`}
            >
              {conversation.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{conversation.customer}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{conversation.lastMessage}</p>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            Dismiss
          </Button>
          <DialogPrimaryButton className="w-auto px-6" onClick={onViewChat}>
            View chat
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

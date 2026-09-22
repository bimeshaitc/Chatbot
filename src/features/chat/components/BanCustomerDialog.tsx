import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Conversation } from '../types'

interface BanCustomerDialogProps {
  conversation: Conversation
  onClose: () => void
  onConfirm: (reason: string) => void
}

export function BanCustomerDialog({ conversation, onClose, onConfirm }: BanCustomerDialogProps) {
  const [reason, setReason] = useState('')

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ban this customer?</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div className="flex gap-2.5 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <p className="text-xs text-rose-700">
              <span className="font-medium">{conversation.customer}</span> will no longer be able to message you, and
              this chat becomes read-only. You can lift the ban from this chat afterwards.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Reason</span>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional, recorded in the chat history"
              rows={3}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" className="px-6" onClick={() => onConfirm(reason.trim())}>
            Ban customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

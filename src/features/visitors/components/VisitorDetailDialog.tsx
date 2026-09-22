import { Globe, Laptop, MapPin, MessageSquare, Radar, Ticket as TicketIcon, UserRound } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Visitor, VisitorMatchType } from '../types'

/**
 * How a linked conversation/ticket was matched to this visitor (BE-14 §5/§7).
 * Shown next to every history chip so a `best-effort` match — commonly a
 * name-only match — is never mistaken for a confirmed identity.
 */
const matchTypeMeta: Record<VisitorMatchType, { label: string; variant: VariantProps<typeof badgeVariants>['variant'] }> = {
  direct: { label: 'Session', variant: 'blue' },
  identified: { label: 'Identified', variant: 'emerald' },
  'best-effort': { label: 'Best-effort match', variant: 'amber' },
}

function SignalTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-lg bg-[#F7F7F8] px-2 py-1.5">
      <p className="truncate text-[10px] font-medium tracking-wide text-gray-400 uppercase">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function InfoRow({ icon: Icon, value }: { icon: typeof MapPin; value: string }) {
  return (
    <li className="flex items-start gap-2 text-xs">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
      <span className="min-w-0 break-words text-gray-700">{value}</span>
    </li>
  )
}

interface VisitorDetailDialogProps {
  visitor: Visitor
  onClose: () => void
}

export function VisitorDetailDialog({ visitor, onClose }: VisitorDetailDialogProps) {
  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="sr-only">{visitor.name || 'Anonymous visitor'}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="relative shrink-0">
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold',
                  visitor.avatarColor,
                )}
              >
                {visitor.initials || <UserRound className="h-5 w-5" />}
              </span>
              {visitor.isOnline && (
                <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </span>
            <div className="min-w-0">
              <p className={cn('truncate text-base font-semibold', visitor.isIdentified ? 'text-gray-900' : 'text-gray-500 italic')}>
                {visitor.name || 'Anonymous visitor'}
              </p>
              <p className="truncate text-xs text-gray-500">{visitor.email || 'No email on file'}</p>
            </div>
            <Badge variant={visitor.isIdentified ? 'emerald' : 'gray'} className="ml-auto shrink-0">
              {visitor.isIdentified ? 'Identified' : 'Anonymous'}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <SignalTile label="Visits" value={visitor.totalVisits} />
            <SignalTile label="Chats" value={visitor.totalConversations} />
            <SignalTile label="Tickets" value={visitor.totalTickets} />
          </div>

          <div className="rounded-xl border border-gray-100 p-3">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Session</p>
            <ul className="flex flex-col gap-1.5">
              <InfoRow icon={MapPin} value={visitor.location} />
              <InfoRow icon={Laptop} value={`${visitor.device} · ${visitor.browser}`} />
              <InfoRow icon={Globe} value={`Arrived via ${visitor.referrer}`} />
              <InfoRow icon={Radar} value={`First seen ${visitor.firstSeen} · last seen ${visitor.lastSeen}`} />
            </ul>
          </div>

          {(visitor.conversations.length > 0 || visitor.tickets.length > 0) && (
            <div className="rounded-xl border border-gray-100 p-3">
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">History</p>
              <div className="flex flex-col gap-1.5">
                {visitor.conversations.map((association) => (
                  <div key={association.id} className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="blue" className="gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Chat #{association.id}
                    </Badge>
                    <Badge variant={matchTypeMeta[association.matchType].variant}>
                      {matchTypeMeta[association.matchType].label}
                    </Badge>
                  </div>
                ))}
                {visitor.tickets.map((association) => (
                  <div key={association.id} className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="violet" className="gap-1">
                      <TicketIcon className="h-3 w-3" />
                      {association.id.replace('t-', 'TKT-')}
                    </Badge>
                    <Badge variant={matchTypeMeta[association.matchType].variant}>
                      {matchTypeMeta[association.matchType].label}
                    </Badge>
                  </div>
                ))}
              </div>
              {(visitor.conversations.some((a) => a.matchType === 'best-effort') ||
                visitor.tickets.some((a) => a.matchType === 'best-effort')) && (
                <p className="mt-2 text-[11px] text-amber-600">
                  Best-effort matches are not a confirmed identity — verify before treating them as this visitor's history.
                </p>
              )}
            </div>
          )}

          {visitor.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visitor.tags.map((tag) => (
                <Badge key={tag} variant="gray">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

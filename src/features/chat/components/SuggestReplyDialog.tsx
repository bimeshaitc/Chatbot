import { useMemo, useState } from 'react'
import { BookOpen, PencilLine, Sparkles, TriangleAlert } from 'lucide-react'
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
import { buildReplyDraft, replyQueryFrom, searchArticles, WEAK_MATCH } from '@/features/knowledge-base'
import { cn } from '@/lib/utils'

interface SuggestReplyDialogProps {
  customerName: string
  /** The customer's last message — carries the intent to search on. */
  lastCustomerMessage: string
  tags: string[]
  category: string
  /** Limits retrieval to articles this agent may read. */
  viewerGroups?: string[]
  onClose: () => void
  /** Puts the edited draft in the composer. Never sends it. */
  onUseDraft: (draft: string) => void
}

/**
 * Drafts a reply from the internal knowledge base.
 *
 * The draft is always editable and never sent from here — internal articles are
 * written for staff, so their wording usually needs softening before a customer
 * sees it. The source passage sits beside the draft precisely so the agent can
 * check what it was built from.
 */
export function SuggestReplyDialog({
  customerName,
  lastCustomerMessage,
  tags,
  category,
  viewerGroups,
  onClose,
  onUseDraft,
}: SuggestReplyDialogProps) {
  const result = useMemo(() => {
    const query = replyQueryFrom(lastCustomerMessage, tags, category)
    const matches = searchArticles(query, { viewerGroups, limit: 3 })
    return buildReplyDraft(customerName, matches)
  }, [lastCustomerMessage, tags, category, viewerGroups, customerName])

  const [draft, setDraft] = useState(result.draft)

  const best = result.sources[0]
  const foundNothing = !best || best.score < WEAK_MATCH

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Suggested reply</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <p className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-[#6E7678]">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />
            Drafted from your internal knowledge base, matched against what{' '}
            <span className="font-medium text-gray-700">{customerName.split(' ')[0]}</span> last asked. Edit it before
            sending — nothing is sent from here.
          </p>

          {foundNothing ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                No article covers this yet
              </p>
              <p className="mt-1 text-xs text-amber-700">
                There is nothing in the internal knowledge base close enough to draft from. Worth adding an article once
                you have answered it, so the next person is not stuck.
              </p>
            </div>
          ) : (
            <>
              {result.needsRewrite && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
                    <PencilLine className="h-3.5 w-3.5 shrink-0" />
                    This passage is written for staff
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    It mentions internal process or approval limits. Reword it before sending — a customer should not
                    read our escalation rules.
                  </p>
                </div>
              )}

              {result.hasShakySource && (
                <p className="flex items-start gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    The best match is marked <span className="font-medium">{best.article.reviewStatus}</span>. Confirm
                    it with {best.article.owner.name} before quoting it.
                  </span>
                </p>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Draft</span>
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={7} />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Built from</span>
                {result.sources.map((match) => (
                  <div
                    key={match.article.id}
                    className={cn(
                      'rounded-xl border px-3 py-2.5',
                      match.isShaky ? 'border-amber-100 bg-amber-50/50' : 'border-gray-100 bg-white',
                    )}
                  >
                    <p className="flex items-center gap-1.5 text-xs font-medium text-gray-800">
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="min-w-0 truncate">{match.article.title}</span>
                      <span className="ml-auto shrink-0 text-[11px] text-gray-400">
                        {Math.round(match.score * 100)}% match
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-600">{match.snippet}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <DialogPrimaryButton
            className="w-auto px-6"
            disabled={foundNothing || !draft.trim()}
            onClick={() => onUseDraft(draft)}
          >
            Put in composer
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

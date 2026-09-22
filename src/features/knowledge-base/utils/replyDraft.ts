import type { ArticleMatch } from './knowledgeSearch'

/**
 * Turns internal knowledge into a *draft* customer reply.
 *
 * The important constraint: the internal knowledge base is explicitly staff-only
 * — its articles say things like "escalate to Finance" and "CSRs may refund up
 * to $150 without approval". Pasting that to a customer would leak internal
 * policy. So this never produces a send-ready message:
 *
 *   - the draft is always editable before it goes anywhere,
 *   - the source passage is shown separately so the agent can check it,
 *   - passages carrying internal-only language are flagged for rewriting,
 *   - an out-of-date source is called out rather than quoted silently.
 */

/** Words that mean a passage is written for staff, not for a customer. */
const INTERNAL_MARKERS = [
  'escalate',
  'escalation',
  'internal',
  'approval',
  'approver',
  'authority',
  'csr',
  'agent',
  'team lead',
  'do not tell',
  'logistics',
  'finance team',
  'sla',
]

export interface ReplyDraft {
  /** Editable text placed in the composer. */
  draft: string
  sources: ArticleMatch[]
  /** True when the passage reads as internal policy and needs rewording. */
  needsRewrite: boolean
  /** True when the best source is stale or a draft. */
  hasShakySource: boolean
}

export function buildReplyDraft(customerName: string, matches: ArticleMatch[]): ReplyDraft {
  if (matches.length === 0) {
    return { draft: '', sources: [], needsRewrite: false, hasShakySource: false }
  }

  const best = matches[0]
  const firstName = customerName.split(' ')[0]
  const passage = best.snippet.trim()

  const needsRewrite = INTERNAL_MARKERS.some((marker) => passage.toLowerCase().includes(marker))

  // Deliberately plain. A confident-sounding template would encourage sending
  // it unread, which is the exact failure mode to avoid here.
  const draft = [`Hi ${firstName},`, '', passage, '', 'Let me know if that helps and I can go from there.'].join('\n')

  return {
    draft,
    sources: matches,
    needsRewrite,
    hasShakySource: best.isShaky,
  }
}

/**
 * The query for a suggestion: the customer's own words carry the intent, with
 * tags and category as weaker context.
 */
export function replyQueryFrom(lastCustomerMessage: string, tags: string[], category: string): string {
  return [lastCustomerMessage, ...tags, category].filter(Boolean).join(' ')
}

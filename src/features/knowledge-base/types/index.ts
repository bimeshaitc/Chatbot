/**
 * The staff-facing knowledge base: playbooks, procedures and reference notes
 * agents read while handling a chat.
 *
 * Deliberately separate from `features/bot-training`. Nothing here is fed to
 * the chatbot or reachable by a customer, so the concerns are different too —
 * this side cares about review freshness and which teams may read a page,
 * where the bot side cares about indexing state and answer coverage.
 */

/**
 * One shared list for both Internal and Public knowledge, rather than a
 * separate list per `KnowledgeVisibility`. Splitting by visibility would mean
 * remapping every existing item's category whenever it toggles between
 * Internal and Public, and clearing/re-validating the field in the edit
 * dialogs — a real maintenance cost for a problem a longer, mixed list
 * already solves: the first five read as staff workflow (a Playbook or an
 * Escalation is never customer-facing), the rest as customer topics (nobody
 * writing a public "Shipping" article would reach for "Onboarding").
 */
export type ArticleCategory =
  | 'Playbook'
  | 'Procedure'
  | 'Escalation'
  | 'Policy'
  | 'Onboarding'
  | 'Shipping'
  | 'Billing'
  | 'Account'
  | 'Product'
  | 'General'

/** How much a page can be trusted right now. */
export type ReviewStatus = 'current' | 'due' | 'stale' | 'draft'

/**
 * Internal (BE-16's default, and everything here used to be) is staff-only —
 * never reachable by a customer or the chatbot. Public is approved for
 * customer-facing use and *eligible* for Chatbot Knowledge to import, though
 * being Public alone does not feed the chatbot — see `features/bot-training`,
 * which only offers Public items as a source and immediately drops one the
 * moment it flips back to Internal.
 */
export type KnowledgeVisibility = 'internal' | 'public'

export interface ArticleAuthor {
  name: string
  role: string
  avatarColor: string
  initials: string
}

export interface InternalArticle {
  id: string
  title: string
  /** One-line summary shown in the list. */
  summary: string
  body: string
  category: ArticleCategory
  /** Agent groups allowed to read it; empty means the whole workspace. */
  groups: string[]
  visibility: KnowledgeVisibility
  reviewStatus: ReviewStatus
  lastReviewedOn: string
  /** Who owns keeping it accurate. */
  owner: ArticleAuthor
  updatedOn: string
  views: number
  /** Pinned pages surface first for everyone. */
  isPinned: boolean
}

export interface InternalDocument {
  id: string
  name: string
  sizeLabel: string
  category: ArticleCategory
  groups: string[]
  visibility: KnowledgeVisibility
  owner: ArticleAuthor
  addedOn: string
}

/**
 * A staff-facing reference link — a wiki page, a shared doc, a vendor's help
 * page, whatever an agent would otherwise have bookmarked. There is no crawl
 * or index behind this (that machinery belongs to `features/bot-training`,
 * where a URL feeds the chatbot); this is just a link with the same
 * visibility and ownership fields as everything else in here.
 */
export interface InternalLink {
  id: string
  label: string
  url: string
  category: ArticleCategory
  groups: string[]
  visibility: KnowledgeVisibility
  owner: ArticleAuthor
  addedOn: string
}

export type KnowledgeBaseTab = 'articles' | 'documents' | 'links'

/**
 * One page found while scanning a site in the Add website link dialog,
 * before it becomes a real `InternalLink`. `preview` is a lightweight
 * stand-in for "how this page rendered" (word count, a form/table detected)
 * — not real DOM inspection, just enough to help someone decide whether a
 * page is worth bookmarking. Mirrors `features/bot-training`'s own
 * `ScrapedPage` — duplicated rather than imported, same tradeoff as the
 * rest of this app's cross-feature "same shape, no shared barrel" fields.
 */
export interface ScrapedPage {
  path: string
  title: string
  preview: string
}

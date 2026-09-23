/**
 * Sources the AI chatbot is trained on. Everything here is bot-facing: if a
 * document is only for staff to read, it belongs in `features/knowledge-base`
 * instead. That split is why the old `internalOnly` flag is gone — the section
 * a source lives in now carries that meaning.
 */

/** Whether the source has made it into the bot's index yet. */
export type TrainingStatus = 'indexed' | 'indexing' | 'queued' | 'failed'

/** Who the answer may be shown to once the bot uses this source. */
export type SourceAudience = 'public' | 'signed-in'

export interface SourceAuthor {
  name: string
  role: string
  avatarColor: string
  initials: string
}

/** Fields every trainable source shares. */
interface TrainableSource {
  id: string
  status: TrainingStatus
  audience: SourceAudience
  /** Off means the bot keeps the source but stops answering from it. */
  isEnabled: boolean
  /** Retrievable chunks produced from this source. */
  chunks: number
  /** How many chats the bot has answered using it. */
  answersServed: number
  lastTrainedOn: string
  /** Set when `status` is 'failed'. */
  failureReason?: string
  author: SourceAuthor
  addedOn: string
}

export interface SourceDocument extends TrainableSource {
  name: string
  sizeLabel: string
}

export interface SourceUrl extends TrainableSource {
  label: string
  url: string
  sizeLabel: string
  /** Whether this source came from one page or a multi-page site crawl. */
  pageMode: 'single' | 'multiple'
}

/**
 * One page found while scanning a site in the Add URL dialog, before it
 * becomes a real `SourceUrl`. `preview` is a lightweight stand-in for "how
 * this page rendered" (word count, a form/table detected) — not real DOM
 * inspection, just enough to help someone decide whether the page is worth
 * indexing.
 */
export interface ScrapedPage {
  path: string
  title: string
  preview: string
}

export type FaqCategory = 'Product' | 'Technical' | 'Billing' | 'General'

export interface SourceFaq {
  id: string
  category: FaqCategory
  question: string
  answer: string
  isEnabled: boolean
  answersServed: number
  author: SourceAuthor
  addedOn: string
  /**
   * The bot intents this FAQ answers, e.g. `orders.shipping_delay`. Lets the
   * chat feature surface "what the bot would say" for a conversation without
   * guessing from keywords — the tag is how a real retrieval index would mark
   * indexed content as belonging to a topic in the first place.
   */
  matchedIntents?: string[]
}

export type BotTrainingTab = 'documents' | 'urls' | 'faqs'

/** Aliases kept so the shared table/dialog components read naturally. */
export type KnowledgeAuthor = SourceAuthor
export type KnowledgeDocument = SourceDocument
export type WebsiteUrlEntry = SourceUrl
export type FaqEntry = SourceFaq
export type KnowledgeBaseTab = BotTrainingTab

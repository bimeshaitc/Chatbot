import type { InternalArticle } from '../types'
import { initialArticles } from '../data/mockKnowledgeBaseData'

/**
 * Retrieval over the internal knowledge base.
 *
 * There is no language model in this prototype — this is deterministic term
 * scoring, and the UI says so. Everything that reads "AI" in the interface is
 * powered by this function plus templating, which is honest about what it is
 * and keeps the whole thing verifiable without a backend.
 */

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can', 'did', 'do', 'does', 'for', 'from', 'had',
  'has', 'have', 'how', 'i', 'if', 'in', 'is', 'it', 'its', 'me', 'my', 'no', 'not', 'of', 'on', 'or', 'our', 'so',
  'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'to', 'up', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with', 'you', 'your',
])

/** Review states that should not be quoted with confidence. */
const SHAKY_REVIEW: InternalArticle['reviewStatus'][] = ['stale', 'draft']

export interface ArticleMatch {
  article: InternalArticle
  /** 0-1. Below `WEAK_MATCH` the answer should not be trusted. */
  score: number
  /** The most relevant sentence, for citation. */
  snippet: string
  /** True when the source is out of date or a draft. */
  isShaky: boolean
}

/** Under this, treat the result as "nothing useful found" rather than a guess. */
export const WEAK_MATCH = 0.18

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
}

function sentencesOf(body: string): string[] {
  return body
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

/** The sentence carrying the most query terms — what gets cited. */
export function snippetFor(article: InternalArticle, terms: string[]): string {
  const sentences = sentencesOf(article.body)
  if (sentences.length === 0) return article.summary

  let best = sentences[0]
  let bestHits = -1
  for (const sentence of sentences) {
    const haystack = sentence.toLowerCase()
    const hits = terms.filter((term) => haystack.includes(term)).length
    if (hits > bestHits) {
      bestHits = hits
      best = sentence
    }
  }
  return bestHits > 0 ? best : article.summary
}

interface SearchOptions {
  /** Groups the reader belongs to. An article with no groups is open to all. */
  viewerGroups?: string[]
  limit?: number
}

export function searchArticles(query: string, options: SearchOptions = {}): ArticleMatch[] {
  const { viewerGroups, limit = 3 } = options
  const terms = tokenize(query)
  if (terms.length === 0) return []

  const readable = initialArticles.filter((article) => {
    if (!viewerGroups) return true
    // No groups means workspace-wide, so it is readable by everyone.
    return article.groups.length === 0 || article.groups.some((group) => viewerGroups.includes(group))
  })

  return readable
    .map((article) => {
      const title = article.title.toLowerCase()
      const summary = article.summary.toLowerCase()
      const body = article.body.toLowerCase()
      const category = article.category.toLowerCase()

      // A term in the title is a far stronger signal than one buried in prose,
      // so the fields are weighted rather than concatenated.
      let hits = 0
      for (const term of terms) {
        if (title.includes(term)) hits += 3
        else if (summary.includes(term)) hits += 2
        else if (category.includes(term)) hits += 1.5
        else if (body.includes(term)) hits += 1
      }

      // Normalise by the best possible score so it reads as a confidence.
      let score = hits / (terms.length * 3)
      if (article.isPinned) score *= 1.1
      // An out-of-date article may still be the only answer, but it should not
      // outrank a current one.
      if (SHAKY_REVIEW.includes(article.reviewStatus)) score *= 0.6

      return {
        article,
        score: Math.min(score, 1),
        snippet: snippetFor(article, terms),
        isShaky: SHAKY_REVIEW.includes(article.reviewStatus),
      }
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

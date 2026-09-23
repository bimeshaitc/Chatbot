import type { SourceArticle } from '@/features/bot-training'

/**
 * Orders the bot's trained articles so the one it would already have used for
 * this conversation's intent sits first, tagged `isSuggested`. Disabled or
 * not-yet-indexed articles are excluded — the bot itself would never answer
 * from one, so offering it to an agent as "from the knowledge base" would be
 * misleading.
 */
export function rankArticlesForIntent(
  articles: SourceArticle[],
  botIntent: string,
): (SourceArticle & { isSuggested: boolean })[] {
  return articles
    .filter((article) => article.isEnabled && article.status === 'indexed')
    .map((article) => ({ ...article, isSuggested: article.matchedIntents?.includes(botIntent) ?? false }))
    .sort((a, b) => Number(b.isSuggested) - Number(a.isSuggested))
}

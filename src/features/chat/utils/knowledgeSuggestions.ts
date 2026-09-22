import type { SourceFaq } from '@/features/bot-training'

/**
 * Orders the bot's trained FAQs so the one it would already have used for this
 * conversation's intent sits first, tagged `isSuggested`. Disabled FAQs are
 * excluded — the bot itself would never answer from one, so offering it to an
 * agent as "from the knowledge base" would be misleading.
 */
export function rankFaqsForIntent(faqs: SourceFaq[], botIntent: string): (SourceFaq & { isSuggested: boolean })[] {
  return faqs
    .filter((faq) => faq.isEnabled)
    .map((faq) => ({ ...faq, isSuggested: faq.matchedIntents?.includes(botIntent) ?? false }))
    .sort((a, b) => Number(b.isSuggested) - Number(a.isSuggested))
}

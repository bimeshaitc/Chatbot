import type { ChatMessage } from '../types'

/**
 * A short, quotable recap of a chat thread — captured once, at the moment a
 * ticket is raised from it, and stored on the ticket itself (`linkedChatSummary`)
 * rather than looked up live. That means it can drift from the chat if the
 * conversation keeps going afterwards, which is the right trade here: a reply
 * quoting it is referencing "what led to this ticket", not "the chat right now".
 *
 * Excludes internal notes and system messages on purpose — those were never
 * shown to the customer, so they have no place surfacing in a reply headed
 * back to them.
 */
export function summarizeChatMessages(messages: ChatMessage[]): string {
  const exchange = messages.filter((message) => message.sender !== 'system' && !message.isNote)
  if (exchange.length === 0) return 'No messages were exchanged before this ticket was raised.'

  return exchange
    .map((message) => {
      const speaker = message.sender === 'customer' ? 'Customer' : (message.authorName ?? 'Agent')
      return `${speaker}: ${message.text}`
    })
    .join('\n')
}

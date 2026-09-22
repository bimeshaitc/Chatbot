import { useState } from 'react'
import { BookOpen, CornerDownLeft, Search, Sparkles, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchArticles, WEAK_MATCH, type ArticleMatch } from '../utils/knowledgeSearch'

/** Starting points, so an empty panel is not a dead end. */
const EXAMPLE_QUESTIONS = [
  'How much can I refund without approval?',
  'When do I escalate a stuck shipment?',
  'What do I do with a card decline?',
]

interface Exchange {
  id: string
  question: string
  matches: ArticleMatch[]
}

interface AskKnowledgePanelProps {
  /** Restricts answers to what this person is allowed to read. */
  viewerGroups?: string[]
  onClose: () => void
}

/**
 * An internal assistant over the knowledge base, reachable from the top bar.
 *
 * Scoped to organisation knowledge on purpose: it answers "what is our policy"
 * and never "what did this customer say". It cites the article behind every
 * answer, because an unsourced answer about company policy is worse than no
 * answer — the agent cannot tell whether to trust it.
 */
export function AskKnowledgePanel({ viewerGroups, onClose }: AskKnowledgePanelProps) {
  const [question, setQuestion] = useState('')
  const [exchanges, setExchanges] = useState<Exchange[]>([])

  function ask(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setExchanges((prev) => [
      ...prev,
      {
        id: `ask-${Date.now()}`,
        question: trimmed,
        matches: searchArticles(trimmed, { viewerGroups, limit: 3 }),
      },
    ])
    setQuestion('')
  }

  return (
    <>
      <button type="button" aria-label="Close assistant" onClick={onClose} className="fixed inset-0 z-40" />
      <div className="absolute right-0 z-50 mt-2 flex max-h-[32rem] w-[22rem] flex-col rounded-2xl border border-gray-100 bg-white shadow-xl sm:w-[26rem]">
        <div className="flex items-start justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              Ask the knowledge base
            </p>
            <p className="mt-0.5 text-xs text-[#6E7678]">
              Company policy and playbooks only. It cannot see customers or chats.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {exchanges.length === 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#6E7678]">Try one of these:</p>
              {EXAMPLE_QUESTIONS.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => ask(example)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-left text-xs text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  {example}
                </button>
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {exchanges.map((exchange) => {
                const best = exchange.matches[0]
                const isWeak = !best || best.score < WEAK_MATCH

                return (
                  <li key={exchange.id} className="flex flex-col gap-2">
                    <p className="self-end rounded-2xl rounded-tr-sm bg-gray-100 px-3 py-1.5 text-sm text-gray-800">
                      {exchange.question}
                    </p>

                    {isWeak ? (
                      <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
                          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                          Nothing in the knowledge base covers that
                        </p>
                        <p className="mt-1 text-xs text-amber-700">
                          Rather than guess: ask your team lead, and consider adding an article so the next person finds
                          it.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm leading-relaxed text-gray-800">{best.snippet}</p>

                        {best.isShaky && (
                          <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800">
                            <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
                            <span>
                              This comes from an article marked{' '}
                              <span className="font-medium">{best.article.reviewStatus}</span> — check with its owner
                              before relying on it.
                            </span>
                          </p>
                        )}

                        <div className="flex flex-col gap-1">
                          <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">Sources</p>
                          {exchange.matches.map((match) => (
                            <span
                              key={match.article.id}
                              className="flex items-center gap-1.5 text-xs text-gray-600"
                              title={match.article.summary}
                            >
                              <BookOpen className="h-3 w-3 shrink-0 text-gray-400" />
                              <span className="min-w-0 truncate">{match.article.title}</span>
                              <span className="shrink-0 text-[11px] text-gray-400">
                                {Math.round(match.score * 100)}%
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-100 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') ask(question)
              }}
              placeholder="Ask about a policy or playbook"
              aria-label="Ask the knowledge base"
              className="h-9 w-full rounded-lg border border-gray-200 pr-9 pl-9 text-sm outline-none focus:border-[#1B5E20]"
            />
            <button
              type="button"
              onClick={() => ask(question)}
              disabled={!question.trim()}
              aria-label="Ask"
              className={cn(
                'absolute top-1/2 right-1.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md',
                question.trim() ? 'text-[#1B5E20] hover:bg-gray-50' : 'text-gray-300',
              )}
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

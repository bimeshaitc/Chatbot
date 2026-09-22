/**
 * A deterministic, rule-based stand-in for the AI, so the Live Preview can
 * demonstrate the customer-facing troubleshoot-then-escalate flow without a
 * real model behind it. There is no LLM here — same honesty this app already
 * uses for the internal knowledge-base search (see `knowledgeSearch.ts`).
 *
 * The shape of the flow follows the standard support-widget pattern: try to
 * answer, check whether it helped, give it a second attempt, and only then
 * offer a way out — a live agent or a ticket — rather than looping forever.
 */

export type SimSender = 'bot' | 'user' | 'system' | 'agent'

export interface SimMessage {
  id: string
  from: SimSender
  text: string
}

/** What the panel is asking the customer for right now. */
export type SimStage =
  | 'pre-chat-form'
  | 'chatting'
  | 'awaiting-feedback'
  | 'escalation-menu'
  | 'ticket-form'
  | 'connecting-agent'
  | 'agent-connected'
  | 'post-chat-form'
  | 'ended'

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function botMessage(text: string): SimMessage {
  return { id: id('bot'), from: 'bot', text }
}

export function userMessage(text: string): SimMessage {
  return { id: id('user'), from: 'user', text }
}

export function systemMessage(text: string): SimMessage {
  return { id: id('system'), from: 'system', text }
}

export function agentMessage(text: string): SimMessage {
  return { id: id('agent'), from: 'agent', text }
}

/** Phrases that should reach a human immediately — never gated behind attempts. */
const EXPLICIT_AGENT_PATTERNS = /\b(agent|human|representative|real person|talk to (a )?(person|someone))\b/i

/** Topics too sensitive for a bot to keep trying on — bypass straight to a human. */
const HIGH_RISK_PATTERNS = /\b(fraud|hacked|security breach|lawsuit|legal|suicide|threat|unauthori[sz]ed)\b/i

/**
 * Requests that need a human to actually change something on the backend —
 * the bot can gather the details, but it cannot itself issue a refund or edit
 * an account, so there is nothing left for it to "try". These go straight to
 * a ticket rather than the 3-option menu: it is not a fallback after failing,
 * it is simply the right channel for the request from the start.
 */
const BACKEND_ACTION_PATTERNS =
  /\b(refund|charge ?back|dispute (this|the) charge|cancel (my )?(order|subscription)|change my address|update my (billing|payment)|close my account)\b/i

/** Regulatory/data requests that route to a specific team, not general support. */
const PRIVACY_REQUEST_PATTERNS = /\b(delete my data|gdpr|ccpa|forget me|right to be forgotten|opt out of (data|tracking))\b/i

export type TriggerReason = 'explicit-request' | 'high-risk' | 'backend-action' | 'privacy-request' | null

/**
 * Order matters. An explicit ask to speak to a person wins over everything
 * else — it is the customer's own words, not an inference — except a
 * high-risk topic, which the bot should never keep chatting through even if
 * the customer didn't ask for a human by name. Backend/privacy requests are
 * checked last since they are the least urgent of the four.
 */
export function detectTrigger(text: string): TriggerReason {
  if (HIGH_RISK_PATTERNS.test(text)) return 'high-risk'
  if (EXPLICIT_AGENT_PATTERNS.test(text)) return 'explicit-request'
  if (PRIVACY_REQUEST_PATTERNS.test(text)) return 'privacy-request'
  if (BACKEND_ACTION_PATTERNS.test(text)) return 'backend-action'
  return null
}

/** Canned "attempt" replies, loosely topic-matched so two failures don't repeat the same line. */
const TOPIC_ATTEMPTS: { pattern: RegExp; attempts: string[] }[] = [
  {
    pattern: /\b(password|log ?in|sign ?in|locked out)\b/i,
    attempts: [
      "I've sent a password reset link to the email on file. Can you try logging in with that?",
      'Let me try another way — can you tell me the exact error message you see when you log in?',
    ],
  },
  {
    pattern: /\b(refund|charge|payment|billing|invoice|card)\b/i,
    attempts: [
      'I can see the transaction on your account. Refunds usually settle back within 5-7 business days — has it been longer than that?',
      "Let's double check the payment method on file — sometimes a declined-then-retried charge shows twice for a few hours before it corrects itself. Is that what you're seeing?",
    ],
  },
  {
    pattern: /\b(order|shipping|delivery|package|parcel|tracking)\b/i,
    attempts: [
      'Your order shows as in transit. Carriers sometimes go a day or two without scanning it — has it been longer than 3 days since the last update?',
      "I've flagged the parcel for a re-scan with the carrier. Can you check the tracking page once more in a few minutes?",
    ],
  },
]

const GENERIC_ATTEMPTS = [
  "Here's what I found in our help articles — could you tell me a bit more about what you're seeing so I can narrow it down?",
  "Let me try a different angle. Can you walk me through exactly what happens, step by step?",
]

/** The bot's next attempt at an answer — attempt 0 is the first try, 1 is the second. */
export function generateAttempt(userText: string, attemptIndex: number): string {
  const topic = TOPIC_ATTEMPTS.find((entry) => entry.pattern.test(userText))
  const bank = topic?.attempts ?? GENERIC_ATTEMPTS
  return bank[Math.min(attemptIndex, bank.length - 1)]
}

/** A short, ticket-style summary of the conversation so far — what an agent would want first. */
export function summarizeConversation(messages: SimMessage[]): string {
  const firstUserMessage = messages.find((message) => message.from === 'user')?.text
  const attempts = messages.filter((message) => message.from === 'bot').length
  if (!firstUserMessage) return 'Customer started a chat but has not described the issue yet.'
  return `Customer reports: "${firstUserMessage}". The assistant attempted ${attempts} time${attempts === 1 ? '' : 's'} without resolving it.`
}

/** A short subject line drafted the same way an agent-facing ticket would get one. */
export function draftSubject(userText: string): string {
  const trimmed = userText.trim().replace(/\s+/g, ' ')
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed
}

export function generateTicketNumber(): string {
  return `#${Math.floor(10000 + Math.random() * 90000)}`
}

const MOCK_AGENT_NAMES = ['Priya', 'Sam', 'Alex', 'Jordan']

export function pickAgentName(): string {
  return MOCK_AGENT_NAMES[Math.floor(Math.random() * MOCK_AGENT_NAMES.length)]
}

export function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/**
 * Plays a short, synthesised tone — no bundled audio file, same reasoning as
 * everywhere else in this simulator: nothing here should need an asset it
 * doesn't generate itself. Swallows failures silently; a missed notification
 * sound is not worth surfacing an error over, and some browsers block audio
 * before the visitor has interacted with the page at all.
 */
export function playNotificationTone() {
  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 720
    gain.gain.setValueAtTime(0.05, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.2)
  } catch {
    // Autoplay policies or an unsupported browser — a beep is not essential.
  }
}

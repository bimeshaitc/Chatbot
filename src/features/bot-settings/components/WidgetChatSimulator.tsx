import { useEffect, useRef, useState } from 'react'
import { FileText, Headset, LogOut, Send, ThumbsDown, ThumbsUp, Ticket as TicketIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BotSettings } from '../types'
import {
  botMessage,
  detectTrigger,
  draftSubject,
  generateAttempt,
  generateTicketNumber,
  initialsFromName,
  pickAgentName,
  playNotificationTone,
  summarizeConversation,
  systemMessage,
  userMessage,
  type SimMessage,
  type SimStage,
} from '../utils/widgetSimulator'
import { PostChatSurveyPanel } from './PostChatSurveyPanel'
import { PreChatFormPanel } from './PreChatFormPanel'

interface WidgetChatSimulatorProps {
  settings: BotSettings
  onClose: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The customer-facing side of the widget — header included, since who the
 * header shows (company vs. the connected agent) depends on conversation
 * state only this component tracks. Greets, tries to help, checks whether it
 * worked, and — after a couple of misses, an explicit "talk to a person," a
 * high-risk topic, a backend/privacy request, or simply being unavailable —
 * offers a live agent or a ticket instead of looping forever.
 *
 * This is a preview: nothing here reaches the real Tickets store, and the
 * ticket number, transcript email and survey submission are all illustrative.
 */
export function WidgetChatSimulator({ settings, onClose }: WidgetChatSimulatorProps) {
  const { appearance, content, availability, behavior, preChatForm, postChatForm } = settings
  const primaryColor = appearance.primaryColor
  const fallbackGreeting = 'Hi, how can I help?'

  const [messages, setMessages] = useState<SimMessage[]>(() =>
    preChatForm.enabled ? [] : [botMessage(content.greetingMessage || fallbackGreeting)],
  )
  const [stage, setStage] = useState<SimStage>(() => (preChatForm.enabled ? 'pre-chat-form' : 'chatting'))
  const [attemptCount, setAttemptCount] = useState(0)
  const [draft, setDraft] = useState('')
  const [agentName, setAgentName] = useState<string | null>(null)
  const [openTicketNumber, setOpenTicketNumber] = useState<string | null>(null)
  const [ticketDraft, setTicketDraft] = useState({ subject: '', description: '', name: '', email: '' })
  const [ticketError, setTicketError] = useState<string | null>(null)
  const [awaitingTranscriptEmail, setAwaitingTranscriptEmail] = useState(false)
  /**
   * The visitor starts anonymous — no pre-chat form by default, no login here
   * — and stays that way until a ticket actually needs a way to reply. Once
   * given, remembered for the rest of this session: a second ticket in the
   * same chat pre-fills it rather than asking again.
   */
  const [visitorEmail, setVisitorEmail] = useState<string | null>(null)
  const [visitorName, setVisitorName] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages.length, stage])

  useEffect(() => {
    return () => {
      if (connectTimerRef.current) clearTimeout(connectTimerRef.current)
    }
  }, [])

  function push(...next: SimMessage[]) {
    setMessages((prev) => [...prev, ...next])
    if (behavior.soundNotifications && next.some((message) => message.from === 'bot' || message.from === 'agent')) {
      playNotificationTone()
    }
  }

  function handlePreChatSubmit(values: { name: string; email: string }) {
    if (values.name) setVisitorName(values.name)
    if (values.email) setVisitorEmail(values.email)
    setStage('chatting')
    // The one payoff of asking for a name up front: the AI can actually use
    // it, rather than the form having asked for nothing.
    const greeting = content.greetingMessage || fallbackGreeting
    push(botMessage(values.name ? `Hi ${values.name.split(' ')[0]}! ${greeting}` : greeting))
  }

  function finishConnectingAgent() {
    const name = pickAgentName()
    setAgentName(name)
    push(
      systemMessage(`You're now connected with ${name}.`),
      {
        id: `agent-intro-${Date.now()}`,
        from: 'agent',
        text: "Hi, I'm reading back through the conversation now — give me just a moment and I'll pick up from here.",
      },
    )
    setStage('agent-connected')
  }

  /**
   * The one place "is a human actually reachable right now" gets decided. If
   * agents are always available, this just connects. Otherwise it asks for an
   * email instead — the same ticket flow used everywhere else, not a second
   * mechanism to explain.
   */
  function connectToAgent() {
    const isAway = !availability.alwaysAvailable && !availability.previewAgentsOnline
    if (isAway) {
      const lastUserText = [...messages].reverse().find((message) => message.from === 'user')?.text ?? ''
      openTicketForm(lastUserText, summarizeConversation(messages), content.awayMessage)
      return
    }

    setStage('connecting-agent')
    push(systemMessage('Connecting you to a support specialist. Please hold on...'))
    connectTimerRef.current = setTimeout(finishConnectingAgent, 1400)
  }

  /**
   * Opens the ticket form. `subjectSource` drafts the subject line; `description`
   * is passed separately because it differs by how we got here — the customer's
   * own words for a direct trigger, an AI summary of the whole exchange when
   * this is the fallback after failed attempts (see `summarizeConversation`).
   *
   * Name and email are both collected here — this is the one point in the
   * flow that asks for identity, deliberately: the chat itself stays
   * anonymous throughout (no pre-chat form by default, nothing asked while
   * troubleshooting), but a ticket is a named, async request someone has to
   * act on, so it's the moment that actually needs both.
   */
  function openTicketForm(subjectSource: string, description: string, openingLine: string) {
    push(botMessage(openingLine))
    // Pre-fill from what we already know rather than asking a second time.
    setTicketDraft({ subject: draftSubject(subjectSource), description, name: visitorName ?? '', email: visitorEmail ?? '' })
    setTicketError(null)
    setStage('ticket-form')
  }

  function handleSend() {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    push(userMessage(text))

    if (awaitingTranscriptEmail) {
      if (!EMAIL_PATTERN.test(text)) {
        push(botMessage("That doesn't look like a valid email — mind trying again?"))
        return
      }
      setVisitorEmail(text)
      setAwaitingTranscriptEmail(false)
      push(botMessage(`Sent a copy of this conversation to ${text}.`))
      return
    }

    if (stage === 'agent-connected') {
      // A live agent is "handling it" from here — no more bot logic to run.
      push({ id: `agent-ack-${Date.now()}`, from: 'agent', text: 'Got it, thanks — one moment.' })
      return
    }

    const trigger = detectTrigger(text)
    if (trigger === 'explicit-request') {
      push(botMessage('Sure, connecting you with a person now.'))
      connectToAgent()
      return
    }
    if (trigger === 'high-risk') {
      push(botMessage('This sounds serious — let me get you straight to our team rather than trying to solve it myself.'))
      connectToAgent()
      return
    }
    if (trigger === 'privacy-request') {
      openTicketForm(text, text, "That needs to go to our privacy team directly — let's get a ticket started for them.")
      return
    }
    if (trigger === 'backend-action') {
      openTicketForm(
        text,
        text,
        "That's something our team needs to action on your account, not something I can do myself. Let's file a ticket for it.",
      )
      return
    }

    const attempt = generateAttempt(text, attemptCount)
    push(botMessage(attempt))
    setAttemptCount((prev) => prev + 1)
    setStage('awaiting-feedback')
  }

  function handleFeedback(helped: boolean) {
    if (helped) {
      const name = visitorName ? `, ${visitorName.split(' ')[0]}` : ''
      push(botMessage(`Glad that helped${name}! Let me know if anything else comes up.`))
      setAttemptCount(0)
      setStage('chatting')
      return
    }

    if (attemptCount >= 2) {
      push(botMessage("I'm sorry, I'm not getting this one solved. Here's how you'd like to proceed:"))
      setStage('escalation-menu')
      return
    }

    const lastUserText = [...messages].reverse().find((message) => message.from === 'user')?.text ?? ''
    push(botMessage(generateAttempt(lastUserText, attemptCount)))
    setAttemptCount((prev) => prev + 1)
  }

  function handleEscalationChoice(choice: 'agent' | 'ticket' | 'continue') {
    if (choice === 'agent') {
      connectToAgent()
      return
    }
    if (choice === 'continue') {
      push(botMessage("Sure — tell me a bit more and I'll take another look."))
      setAttemptCount(0)
      setStage('chatting')
      return
    }
    const firstUserText = messages.find((message) => message.from === 'user')?.text ?? ''
    openTicketForm(
      firstUserText,
      summarizeConversation(messages),
      "Let's get a ticket started so someone can dig into this properly.",
    )
  }

  function handleSubmitTicket() {
    const name = ticketDraft.name.trim()
    const email = ticketDraft.email.trim()
    if (!name) {
      setTicketError('Enter a name so our team knows who they\'re helping.')
      return
    }
    if (!email || !EMAIL_PATTERN.test(email)) {
      setTicketError('Enter a valid email so our team can follow up.')
      return
    }
    // Remembered for the rest of the session — the next ticket, if any, won't
    // ask again.
    setVisitorName(name)
    setVisitorEmail(email)
    const ticketNumber = generateTicketNumber()
    setOpenTicketNumber(ticketNumber)
    push(
      botMessage(
        `Thanks, ${name.split(' ')[0]} — ticket ${ticketNumber} created. We'll email updates to ${email}. Is there anything else I can help with?`,
      ),
    )
    setAttemptCount(0)
    setStage('chatting')
  }

  function handleRequestTranscript() {
    if (visitorEmail) {
      push(botMessage(`Sent a copy of this conversation to ${visitorEmail}.`))
      return
    }
    push(botMessage("What's your email? I'll send a copy there."))
    setAwaitingTranscriptEmail(true)
  }

  function handleEndChat() {
    if (postChatForm.enabled) {
      setStage('post-chat-form')
      return
    }
    push(botMessage('Thanks for chatting with us!'))
    setStage('ended')
  }

  function handlePostChatSubmit() {
    push(botMessage('Thanks for your feedback — it helps us improve.'))
    setStage('ended')
  }

  const senderStyle: Record<SimMessage['from'], string> = {
    bot: 'self-start bg-gray-100 text-gray-800',
    user: 'self-end text-white',
    agent: 'self-start bg-emerald-50 text-emerald-900 border border-emerald-100',
    system: 'self-center bg-transparent text-gray-400',
  }

  const canEndChat = !['pre-chat-form', 'post-chat-form', 'ended'].includes(stage)
  const canShowTranscript =
    behavior.letCustomersGetTranscripts && messages.some((message) => message.from === 'user') && canEndChat
  const isComposerLocked =
    !awaitingTranscriptEmail &&
    (stage === 'escalation-menu' ||
      stage === 'ticket-form' ||
      stage === 'connecting-agent' ||
      stage === 'pre-chat-form' ||
      stage === 'post-chat-form' ||
      stage === 'ended')

  const headerAvatar =
    behavior.showAgentAvatarOnHandoff && agentName && (stage === 'agent-connected' || stage === 'post-chat-form' || stage === 'ended') ? (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold text-white">
        {initialsFromName(agentName)}
      </span>
    ) : content.logoUrl ? (
      <img src={content.logoUrl} alt="" className="h-6 w-6 rounded-full bg-white object-contain" />
    ) : (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs text-white">
        {content.companyName.charAt(0) || 'C'}
      </span>
    )

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 text-white" style={{ backgroundColor: primaryColor }}>
        {headerAvatar}
        <div className="flex-1 leading-tight">
          <p className="text-xs font-semibold">
            {behavior.showAgentAvatarOnHandoff && agentName && stage !== 'pre-chat-form' ? agentName : content.companyName || 'Support Chat'}
          </p>
          <p className="text-[10px] opacity-90">{content.headerText || 'Always Active'}</p>
        </div>
        {canEndChat && (
          <button
            type="button"
            onClick={handleEndChat}
            title="End chat"
            className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] opacity-90 hover:bg-white/10"
          >
            <LogOut className="h-3 w-3" />
            End
          </button>
        )}
        <button type="button" onClick={onClose} aria-label="Close chat" className="rounded-full p-0.5 hover:bg-white/10">
          <X className="h-3.5 w-3.5 opacity-80" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: appearance.secondaryColor }}>
        {stage === 'pre-chat-form' ? (
          <PreChatFormPanel
            askName={preChatForm.askName}
            askEmail={preChatForm.askEmail}
            accentColor={primaryColor}
            onSubmit={handlePreChatSubmit}
          />
        ) : stage === 'post-chat-form' ? (
          <PostChatSurveyPanel askRating={behavior.letCustomersRateAgents} accentColor={primaryColor} onSubmit={handlePostChatSubmit} />
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
              {openTicketNumber && (
                <div className="mb-2 flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
                  <TicketIcon className="h-3 w-3 shrink-0" />
                  Ticket {openTicketNumber} open
                </div>
              )}

              <div className="flex flex-col gap-2">
                {messages.map((message) =>
                  message.from === 'system' ? (
                    <p key={message.id} className={cn('px-2 py-0.5 text-center text-[10px]', senderStyle.system)}>
                      {message.text}
                    </p>
                  ) : (
                    <div
                      key={message.id}
                      className={cn(
                        'flex max-w-[85%] flex-col gap-0.5',
                        message.from === 'user' ? 'items-end self-end' : 'items-start self-start',
                      )}
                    >
                      {message.from === 'agent' && agentName && (
                        <span className="px-1 text-[9px] font-medium text-emerald-600">{agentName} · Support</span>
                      )}
                      <p
                        className={cn('rounded-2xl px-3 py-1.5 text-xs leading-relaxed', senderStyle[message.from])}
                        style={message.from === 'user' ? { backgroundColor: primaryColor } : undefined}
                      >
                        {message.text}
                      </p>
                    </div>
                  ),
                )}

                {stage === 'awaiting-feedback' && (
                  <div className="flex items-center gap-1.5 self-start pl-1">
                    <button
                      type="button"
                      onClick={() => handleFeedback(true)}
                      className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <ThumbsUp className="h-2.5 w-2.5" />
                      That helped
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedback(false)}
                      className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <ThumbsDown className="h-2.5 w-2.5" />
                      Still stuck
                    </button>
                  </div>
                )}

                {stage === 'escalation-menu' && (
                  <div className="flex flex-col gap-1.5 self-start pl-1">
                    <button
                      type="button"
                      onClick={() => handleEscalationChoice('agent')}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-left text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Headset className="h-3 w-3 shrink-0 text-gray-500" />
                      Talk to an agent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEscalationChoice('ticket')}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-left text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <TicketIcon className="h-3 w-3 shrink-0 text-gray-500" />
                      Create a support ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEscalationChoice('continue')}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-left text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Continue with the assistant
                    </button>
                  </div>
                )}

                {stage === 'ticket-form' && (
                  <div className="flex flex-col gap-1.5 self-start rounded-lg border border-gray-200 bg-white p-2.5">
                    <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">New ticket</p>
                    <input
                      value={ticketDraft.subject}
                      onChange={(e) => setTicketDraft((prev) => ({ ...prev, subject: e.target.value }))}
                      className="rounded-md border border-gray-200 px-2 py-1 text-[11px] outline-none focus:border-gray-400"
                      placeholder="Subject"
                    />
                    <textarea
                      value={ticketDraft.description}
                      onChange={(e) => setTicketDraft((prev) => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="resize-none rounded-md border border-gray-200 px-2 py-1 text-[11px] outline-none focus:border-gray-400"
                      placeholder="What's going on?"
                    />
                    <input
                      value={ticketDraft.name}
                      onChange={(e) => setTicketDraft((prev) => ({ ...prev, name: e.target.value }))}
                      className="rounded-md border border-gray-200 px-2 py-1 text-[11px] outline-none focus:border-gray-400"
                      placeholder="Your name"
                    />
                    <input
                      value={ticketDraft.email}
                      onChange={(e) => setTicketDraft((prev) => ({ ...prev, email: e.target.value }))}
                      className="rounded-md border border-gray-200 px-2 py-1 text-[11px] outline-none focus:border-gray-400"
                      placeholder="Your email, for updates"
                    />
                    {!visitorEmail && !visitorName && (
                      <p className="text-[10px] leading-relaxed text-gray-400">
                        Only used to follow up on this ticket. This chat may be reviewed for quality.
                      </p>
                    )}
                    {ticketError && <p className="text-[10px] text-red-600">{ticketError}</p>}
                    <button
                      type="button"
                      onClick={handleSubmitTicket}
                      className="mt-0.5 rounded-md px-2 py-1 text-[11px] font-medium text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Submit ticket
                    </button>
                  </div>
                )}
              </div>
            </div>

            {stage === 'ended' ? (
              <p className="border-t border-gray-100 px-3 py-3 text-center text-xs text-gray-500">This chat has ended.</p>
            ) : (
              <div className="flex items-center gap-1.5 border-t border-gray-100 p-2">
                {canShowTranscript && (
                  <button
                    type="button"
                    onClick={handleRequestTranscript}
                    title="Email me a transcript"
                    aria-label="Email me a transcript"
                    className="shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                )}
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isComposerLocked}
                  placeholder={
                    awaitingTranscriptEmail
                      ? 'Enter your email...'
                      : isComposerLocked
                        ? 'Choose an option above...'
                        : 'Type a message...'
                  }
                  className="min-w-0 flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isComposerLocked}
                  aria-label="Send"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

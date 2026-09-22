import type { BotSettings } from '../types'

/**
 * Every default here follows the same standard the widget flow itself was
 * built on: defer, don't gate. The pre-chat form defaults off and a live
 * agent is reachable any time rather than behind office hours — an admin who
 * genuinely wants the gated version can still turn each on, but nothing
 * starts a visitor off with more friction than necessary.
 */
export const defaultBotSettings: BotSettings = {
  appearance: {
    primaryColor: '#1B5E20',
    secondaryColor: '#EAF2FD',
    launcherIcon: 'bubble',
    customLauncherIcon: null,
    widgetPosition: 'right',
  },
  content: {
    companyName: 'Support Chat',
    headerText: 'Always Active',
    greetingMessage: 'Hello, how can i help you.',
    awayMessage: "We're away right now, but leave your email and we'll get back to you.",
    logoUrl: null,
  },
  visibility: {
    mode: 'always',
  },
  availability: {
    alwaysAvailable: true,
    previewAgentsOnline: true,
  },
  behavior: {
    showAgentAvatarOnHandoff: true,
    soundNotifications: false,
    letCustomersRateAgents: true,
    letCustomersGetTranscripts: true,
  },
  preChatForm: {
    enabled: false,
    askName: true,
    askEmail: true,
  },
  postChatForm: {
    enabled: true,
  },
}

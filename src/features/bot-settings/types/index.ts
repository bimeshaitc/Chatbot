export type WidgetPosition = 'left' | 'right'
export type LauncherPreset = 'bubble' | 'circle'

export interface BotAppearanceSettings {
  primaryColor: string
  secondaryColor: string
  launcherIcon: LauncherPreset
  customLauncherIcon: string | null
  widgetPosition: WidgetPosition
}

export interface BotContentSettings {
  companyName: string
  headerText: string
  greetingMessage: string
  /** Shown when a visitor asks for a human outside `availability.alwaysAvailable`. */
  awayMessage: string
  logoUrl: string | null
}

/**
 * When the launcher itself is even visible. Distinct from availability
 * (whether a *chat* can be started) — a business can want the icon always on
 * screen while still routing to the AI or a queue underneath it.
 */
export type WidgetVisibility = 'always' | 'hide-until-active' | 'always-hidden'

export interface BotVisibilitySettings {
  mode: WidgetVisibility
}

/**
 * Whether a *live agent* is reachable — the AI itself has no "hours", it
 * always answers. This only ever gates the human-handoff path. When off, a
 * visitor asking for a person is asked for an email instead — the same
 * ticket flow already used elsewhere, not a separate mechanism.
 */
export interface BotAvailabilitySettings {
  alwaysAvailable: boolean
  /**
   * Prototype-only stand-in for real presence data — lets Live Preview show
   * both the "online" and "away" cases without a real agent roster wired in.
   * Only read when `alwaysAvailable` is false.
   */
  previewAgentsOnline: boolean
}

export interface BotBehaviorSettings {
  /** Once a human takes the chat, show their avatar in place of the company logo. */
  showAgentAvatarOnHandoff: boolean
  soundNotifications: boolean
  letCustomersRateAgents: boolean
  letCustomersGetTranscripts: boolean
}

export interface PreChatFormSettings {
  enabled: boolean
  askName: boolean
  askEmail: boolean
}

/** Asks how the chat went once it ends. One switch — the questions themselves aren't individually configurable. */
export interface PostChatFormSettings {
  enabled: boolean
}

export interface BotSettings {
  appearance: BotAppearanceSettings
  content: BotContentSettings
  visibility: BotVisibilitySettings
  availability: BotAvailabilitySettings
  behavior: BotBehaviorSettings
  preChatForm: PreChatFormSettings
  postChatForm: PostChatFormSettings
}

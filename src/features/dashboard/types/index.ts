export interface StatCard {
  label: string
  value: string
  changeLabel: string
  /** Plain-language definition of the metric, shown behind the card's info icon. */
  description: string
  accent: 'green' | 'blue' | 'purple' | 'orange'
}

export interface TrendPoint {
  day: string
  received: number
  resolved: number
}

export type ConversationStatus = 'pending' | 'resolved' | 'unassigned'

export interface RecentConversation {
  id: string
  customer: string
  initials: string
  avatarColor: string
  message: string
  tags: string[]
  status: ConversationStatus
  unreadCount: number
  time: string
}

export interface TopAgent {
  id: string
  name: string
  initials: string
  avatarColor: string
  chatsHandled: number
  avgHandledTime: string
  csatScore: number
}

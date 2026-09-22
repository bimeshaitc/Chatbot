export type IntegrationChannelId = 'whatsapp' | 'facebook' | 'instagram'

export type IntegrationStatus = 'connected' | 'disconnected'

export interface IntegrationChannel {
  id: IntegrationChannelId
  name: string
  description: string
  status: IntegrationStatus
}

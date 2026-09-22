import type { IntegrationChannel } from '../types'

export const initialIntegrations: IntegrationChannel[] = [
  {
    id: 'whatsapp',
    name: 'Whatsapp',
    description: 'Connect your WhatsApp Business Account to receive and send messages',
    status: 'connected',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Link your Facebook Business Account to manage and exchange messages seamlessly.',
    status: 'disconnected',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Link your Instagram Business profile to easily handle your Instagram messages.',
    status: 'disconnected',
  },
]

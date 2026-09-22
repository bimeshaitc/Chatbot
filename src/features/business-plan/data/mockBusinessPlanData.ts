import type { CurrentPlan, PlanOption } from '../types'

export const currentPlan: CurrentPlan = {
  tier: 'pro',
  renewsOn: '10 Oct 2026',
  usage: [
    { label: 'Agent seats', used: 4, limit: 10, unit: 'seats' },
    { label: 'Chatbots', used: 1, limit: 3, unit: 'bots' },
    { label: 'Chats this month', used: 1240, limit: 5000, unit: 'chats' },
    { label: 'Tickets this month', used: 312, limit: null, unit: 'tickets' },
  ],
}

export const planOptions: PlanOption[] = [
  {
    tier: 'free',
    name: 'Free',
    priceLabel: '$0 / month',
    tagline: 'Try the basics with a single agent.',
    features: ['1 agent seat', '1 chatbot', '200 chats / month', 'Community support'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    priceLabel: '$49 / month',
    tagline: 'For growing support teams.',
    features: ['10 agent seats', '3 chatbots', '5,000 chats / month', 'Shift scheduling', 'Priority email support'],
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Custom pricing',
    tagline: 'For high-volume, multi-brand support orgs.',
    features: ['Unlimited agent seats', 'Unlimited chatbots', 'Unlimited chats', 'SSO & audit logs', 'Dedicated account manager'],
  },
]

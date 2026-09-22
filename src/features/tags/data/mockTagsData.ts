import type { Tag } from '../types'

/** Merges what tickets and chat each hardcoded before this feature existed. */
export const initialTags: Tag[] = [
  { id: 'billing', name: 'Billing', color: 'blue', createdAt: '01-Oct-2025' },
  { id: 'refund', name: 'Refund', color: 'rose', createdAt: '01-Oct-2025' },
  { id: 'shipping', name: 'Shipping', color: 'amber', createdAt: '01-Oct-2025' },
  { id: 'bug', name: 'Bug', color: 'rose', createdAt: '01-Oct-2025' },
  { id: 'pricing', name: 'Pricing', color: 'violet', createdAt: '01-Oct-2025' },
  { id: 'escalated', name: 'Escalated', color: 'rose', createdAt: '01-Oct-2025' },
  { id: 'products', name: 'Products', color: 'blue', createdAt: '01-Oct-2025' },
  { id: 'feature-request', name: 'Feature Request', color: 'cyan', createdAt: '01-Oct-2025' },
  { id: 'vip', name: 'VIP', color: 'violet', createdAt: '12-Dec-2025' },
  { id: 'follow-up', name: 'Follow-up', color: 'amber', createdAt: '12-Dec-2025' },
  { id: 'spam', name: 'Spam', color: 'gray', createdAt: '12-Dec-2025' },
]

import type { Category } from '../types'

const katwal = { name: 'James Katwal', initials: 'JK', avatarColor: 'bg-sky-200 text-sky-700', role: 'Admin' }

/**
 * Ids must agree with every seeded `categoryId` in
 * `src/features/chat/data/mockChatData.ts` and
 * `src/features/tickets/data/mockTicketsData.ts` — those records reference
 * categories by these exact ids.
 */
export const initialCategories: Category[] = [
  { id: 'finance', name: 'Finance', enabled: true, addedBy: katwal, addedOn: '25-Jan-2025' },
  { id: 'support', name: 'Support', enabled: true, addedBy: katwal, addedOn: '25-Jan-2025' },
  { id: 'technical', name: 'Technical', enabled: true, addedBy: katwal, addedOn: '25-Jan-2025' },
]

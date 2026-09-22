import type { ActivityLogEntry } from '../types'

const katwal = { name: 'James Katwal', initials: 'JK', avatarColor: 'bg-sky-200 text-sky-700' }

export const systemActivityEntries: ActivityLogEntry[] = [
  { id: 'sys-1', actor: katwal, action: 'Created New Campaign', target: { name: 'Welcome visitor', initials: 'WV', avatarColor: 'bg-emerald-200 text-emerald-700' }, day: 'Today', time: '12:33 PM', read: false },
  { id: 'sys-2', actor: katwal, action: 'Updated campaign', target: { name: 'New Campaign Welcome visitor', initials: 'NC', avatarColor: 'bg-emerald-200 text-emerald-700' }, day: 'Today', time: '12:33 PM', read: false },
  { id: 'sys-3', actor: katwal, action: 'Deleted campaign', target: { name: 'New Campaign Welcome visitor', initials: 'NC', avatarColor: 'bg-emerald-200 text-emerald-700' }, day: 'Today', time: '12:33 PM', read: false },
  { id: 'sys-4', actor: katwal, action: 'Added new user', target: { name: 'New Campaign Welcome visitor', initials: 'NC', avatarColor: 'bg-emerald-200 text-emerald-700' }, day: 'Today', time: '12:20 PM', read: true },
  {
    id: 'sys-5',
    actor: katwal,
    action: 'Assigned chat to',
    target: { name: 'ram Katwal', initials: 'RK', avatarColor: 'bg-amber-200 text-amber-700' },
    note: 'Need help for login error',
    day: 'Yesterday',
    time: '12:20 PM',
    read: true,
  },
  { id: 'sys-6', actor: katwal, action: 'Created New Campaign', target: { name: 'Welcome visitor', initials: 'WV', avatarColor: 'bg-emerald-200 text-emerald-700' }, day: 'Yesterday', time: '12:23 PM', read: true },
]

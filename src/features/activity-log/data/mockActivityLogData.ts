import type { ActivityLogEntry } from '../types'

const katwal = { name: 'James Katwal', initials: 'JK', avatarColor: 'bg-sky-200 text-sky-700' }

export const activityLogEntries: ActivityLogEntry[] = [
  {
    id: 'log-1',
    actor: katwal,
    action: 'Added new user',
    target: { name: 'Ritu Sharma', initials: 'RS', avatarColor: 'bg-rose-200 text-rose-700' },
    day: 'Today',
    time: '12:33 PM',
  },
  {
    id: 'log-2',
    actor: katwal,
    action: 'Deleted user',
    target: { name: 'James Lee', initials: 'JL', avatarColor: 'bg-gray-200 text-gray-700' },
    day: 'Today',
    time: '12:33 PM',
  },
  {
    id: 'log-3',
    actor: katwal,
    action: 'Updated user',
    target: { name: 'Laura Kim', initials: 'LK', avatarColor: 'bg-amber-200 text-amber-700' },
    day: 'Today',
    time: '12:33 PM',
  },
  {
    id: 'log-4',
    actor: katwal,
    action: 'Added new user',
    target: { name: 'Ritu Sharma', initials: 'RS', avatarColor: 'bg-rose-200 text-rose-700' },
    day: 'Yesterday',
    time: '12:33 PM',
  },
  {
    id: 'log-5',
    actor: katwal,
    action: 'Added new user',
    target: { name: 'Ritu Sharma', initials: 'RS', avatarColor: 'bg-rose-200 text-rose-700' },
    day: 'Yesterday',
    time: '12:33 PM',
  },
]

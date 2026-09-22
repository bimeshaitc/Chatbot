import type { TicketAccessLevel, WorkChannel } from '@/config/roles'
import type { AgentAvailability, MembershipStatus, UserRole } from '../types'

export const roleMeta: Record<UserRole, { label: string; className: string }> = {
  Owner: { label: 'Owner', className: 'bg-violet-50 text-violet-700' },
  Admin: { label: 'Admin', className: 'bg-blue-50 text-blue-700' },
  'CSR Admin': { label: 'CSR Admin', className: 'bg-amber-50 text-amber-700' },
  CSR: { label: 'CSR', className: 'bg-emerald-50 text-emerald-700' },
}

export const statusMeta: Record<MembershipStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700' },
  invited: { label: 'Invitation pending', className: 'bg-amber-50 text-amber-700' },
  suspended: { label: 'Suspended', className: 'bg-rose-50 text-rose-700' },
}

export const availabilityMeta: Record<AgentAvailability, { label: string; dot: string; textColor: string }> = {
  accepting: { label: 'Accepting chats', dot: 'bg-emerald-500', textColor: 'text-emerald-600' },
  'not-accepting': { label: 'Not accepting', dot: 'bg-amber-500', textColor: 'text-amber-600' },
  offline: { label: 'Offline', dot: 'bg-gray-400', textColor: 'text-gray-500' },
}

/**
 * `channels` is a set, not an enum, so this is a function rather than a
 * `Record` lookup. Absent/both reads as "Chat + Tickets" — the default a CSR
 * starts with until an Owner or CSR Admin narrows it.
 */
export function channelLabel(channels: WorkChannel[] | undefined): string {
  const has = (channel: WorkChannel) => !channels || channels.includes(channel)
  if (has('chat') && has('tickets')) return 'Chat + Tickets'
  if (has('chat')) return 'Chat only'
  if (has('tickets')) return 'Tickets only'
  return 'No channel assigned'
}

export const ticketAccessMeta: Record<TicketAccessLevel, { label: string; description: string }> = {
  edit: { label: 'Can edit', description: 'Create, reply to and set the status of tickets.' },
  view: { label: 'View only', description: 'Can see the tickets queue, but not reply, create or change status.' },
}

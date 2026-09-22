import { WORKSPACE_ROLES } from '@/config/roles'
import type { AgentAvailability, AppUser, MembershipStatus, PlanTier, SeatAllocation, UserRole } from '../types'

export const roleOptions: UserRole[] = [...WORKSPACE_ROLES]

// Group vocabulary now lives in `stores/useGroupsStore.ts` — the single
// shared list every group picker (here, knowledge base, canned responses)
// reads from, so a group created there is usable everywhere immediately.

/** LiveChat caps concurrent chats at 3 for new agents and up to 6 for experienced ones. */
export const chatLimitOptions: number[] = [1, 2, 3, 4, 5, 6]

export const availabilityOptions: AgentAvailability[] = ['accepting', 'not-accepting', 'offline']

export const statusOptions: MembershipStatus[] = ['active', 'invited', 'suspended']

const avatarColors = [
  'bg-indigo-200 text-indigo-700',
  'bg-rose-200 text-rose-700',
  'bg-amber-200 text-amber-700',
  'bg-emerald-200 text-emerald-700',
  'bg-sky-200 text-sky-700',
  'bg-violet-200 text-violet-700',
]

export function avatarColorFor(seed: string): string {
  const index = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return avatarColors[index % avatarColors.length]
}

export function initialsFor(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

/**
 * Seeded so every state in the UI is reachable without touching a backend:
 * an owner, admins, team leads and agents; active, invited and suspended
 * members; agents accepting, not accepting and offline; one agent at capacity
 * and one over-subscribed group.
 */
export const initialUsers: AppUser[] = [
  {
    id: '1',
    firstName: 'Allison',
    lastName: 'Horwitz',
    initials: 'AH',
    avatarColor: avatarColorFor('Allison Horwitz'),
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    role: 'Owner',
    status: 'active',
    availability: 'accepting',
    groups: ['Technical', 'Finance'],
    email: 'allison.horwitz@mercury.app',
    phone: '+977-9868798697',
    chatLimit: 4,
    activeChats: 1,
    jobTitle: 'Head of Support',
    lastActive: 'Active now',
  },
  {
    id: '2',
    firstName: 'Nolan',
    lastName: 'Donin',
    initials: 'ND',
    avatarColor: avatarColorFor('Nolan Donin'),
    role: 'Admin',
    status: 'active',
    availability: 'accepting',
    groups: ['Technical', 'Product'],
    email: 'nolan.donin@mercury.app',
    phone: '+977-9812345678',
    chatLimit: 5,
    activeChats: 5,
    jobTitle: 'Support Manager',
    lastActive: 'Active now',
  },
  {
    id: '3',
    firstName: 'Mia',
    lastName: 'Anderson',
    initials: 'MA',
    avatarColor: avatarColorFor('Mia Anderson'),
    role: 'CSR Admin',
    status: 'active',
    availability: 'not-accepting',
    groups: ['Finance'],
    email: 'mia.anderson@mercury.app',
    phone: '+977-9801122334',
    chatLimit: 4,
    activeChats: 2,
    jobTitle: 'Billing Team Lead',
    lastActive: '12 minutes ago',
  },
  {
    id: '4',
    firstName: 'Aspen',
    lastName: 'George',
    initials: 'AG',
    avatarColor: avatarColorFor('Aspen George'),
    role: 'CSR',
    status: 'active',
    availability: 'accepting',
    groups: ['Service'],
    channels: ['chat', 'tickets'],
    email: 'aspen.george@mercury.app',
    phone: '+977-9845566778',
    chatLimit: 3,
    activeChats: 2,
    jobTitle: 'Support Agent',
    lastActive: 'Active now',
  },
  {
    id: '5',
    firstName: 'Angel',
    lastName: 'Curtis',
    initials: 'AC',
    avatarColor: avatarColorFor('Angel Curtis'),
    role: 'CSR',
    status: 'active',
    availability: 'offline',
    groups: ['Technical'],
    // Chat-only: this desk's ticket queue is covered by Aspen and Ann.
    channels: ['chat'],
    email: 'angel.curtis@mercury.app',
    phone: '+977-9807788990',
    chatLimit: 3,
    activeChats: 0,
    jobTitle: 'Support Agent',
    lastActive: 'Yesterday, 6:40 PM',
  },
  {
    id: '6',
    firstName: 'Tiana',
    lastName: 'Koragaard',
    initials: 'TK',
    avatarColor: avatarColorFor('Tiana Koragaard'),
    role: 'CSR',
    status: 'suspended',
    availability: 'offline',
    groups: ['Product'],
    // Tickets-only, and read-only within that: can see the queue, not work it.
    channels: ['tickets'],
    ticketAccess: 'view',
    email: 'tiana.koragaard@mercury.app',
    phone: '+977-9803344556',
    chatLimit: 3,
    activeChats: 0,
    jobTitle: 'Support Agent',
    lastActive: 'Dec 14, 2025',
  },
  {
    id: '7',
    firstName: 'Ann',
    lastName: 'Curtis',
    initials: 'AC',
    avatarColor: avatarColorFor('Ann Curtis'),
    role: 'CSR',
    status: 'invited',
    availability: 'offline',
    groups: ['Finance'],
    channels: ['chat', 'tickets'],
    email: 'ann.curtis@mercury.app',
    phone: '—',
    chatLimit: 3,
    activeChats: 0,
    jobTitle: 'Support Agent',
    lastActive: 'Has not signed in yet',
    invitedOn: 'Dec 20, 2025',
  },
  {
    id: '8',
    firstName: 'Devon',
    lastName: 'Marsh',
    initials: 'DM',
    avatarColor: avatarColorFor('Devon Marsh'),
    role: 'CSR Admin',
    status: 'invited',
    availability: 'offline',
    groups: ['Technical', 'Service'],
    email: 'devon.marsh@mercury.app',
    phone: '—',
    chatLimit: 4,
    activeChats: 0,
    jobTitle: 'Escalations Lead',
    lastActive: 'Has not signed in yet',
    invitedOn: 'Dec 21, 2025',
  },
]

/**
 * Emails with an existing Mercury platform account — invite only checks
 * membership and seats against `initialUsers`, but a real invite must also
 * confirm the account exists at all (Mercury owns account creation, a
 * workspace can only invite into one). Deliberately includes a couple of
 * people who are not yet members, so "known account, not yet invited" and
 * "no account at all" are both reachable from the seed data.
 */
export const knownPlatformAccountEmails: string[] = [
  ...initialUsers.map((user) => user.email),
  'jordan.reyes@mercury.app',
  'priya.shah@mercury.app',
]

/**
 * Tiers are capped deliberately so both outcomes are reachable from the seeded
 * state of 10 seats on Business: asking for +5 lands exactly on the Business
 * cap, while +10 cannot be satisfied without moving to Enterprise. If you edit
 * these numbers, keep both paths reachable or the dialog only ever shows one.
 */
export const planTiers: PlanTier[] = [
  {
    id: 'starter',
    name: 'Mercury Starter',
    seatCap: 5,
    pricePerSeat: 19,
    summary: 'For a small desk finding its feet.',
  },
  {
    id: 'business',
    name: 'Mercury Business',
    seatCap: 15,
    pricePerSeat: 39,
    summary: 'Groups, rotas and reporting for a full team.',
  },
  {
    id: 'enterprise',
    name: 'Mercury Enterprise',
    seatCap: 100,
    pricePerSeat: 59,
    summary: 'Multi-team desks, SSO and a named contact.',
  },
]

/** Two seats spare, so both the "invite" and the "seats full" paths are reachable. */
export const initialSeats: SeatAllocation = {
  total: 10,
  used: initialUsers.length,
  planId: 'business',
  planName: 'Mercury Business',
  renewsOn: 'Jan 14, 2026',
}

export function planById(planId: string): PlanTier {
  return planTiers.find((tier) => tier.id === planId) ?? planTiers[0]
}

/** The cheapest tier that can hold this many seats, or null if none can. */
export function smallestPlanFor(seats: number): PlanTier | null {
  return planTiers.find((tier) => tier.seatCap >= seats) ?? null
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

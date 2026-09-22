import type { TicketAccessLevel, WorkChannel, WorkspaceRole } from '@/config/roles'

export type UserRole = WorkspaceRole

/**
 * Where a person stands with this workspace.
 *
 * `invited` matters because the Mercury admin owns account creation: the
 * workspace can only invite an account that already exists, so there is a
 * genuine pending state between "invited" and "active".
 *
 * `suspended` is access revoked while the seat is retained. Removing someone
 * frees the seat but never deletes their Mercury account.
 */
export type MembershipStatus = 'active' | 'invited' | 'suspended'

/** Mirrors LiveChat's accept-chats toggle. */
export type AgentAvailability = 'accepting' | 'not-accepting' | 'offline'

export interface AppUser {
  id: string
  firstName: string
  lastName: string
  initials: string
  avatarColor: string
  avatarUrl?: string
  role: UserRole
  status: MembershipStatus
  availability: AgentAvailability
  /** Groups route chats to a team; also gates what archives they can read. */
  groups: string[]
  /**
   * Which queue(s) this person actually works — only meaningful for `CSR`;
   * CSR Admin and up always work both, so the field is ignored for them.
   * Absent means both, same as `config/roles.ts`'s `channelCan` default.
   */
  channels?: WorkChannel[]
  /**
   * Whether the tickets channel is read-only for this person. Only meaningful
   * when `channels` includes `'tickets'`. Absent means `'edit'`, same as
   * `config/roles.ts`'s `channelCan` default.
   */
  ticketAccess?: TicketAccessLevel
  email: string
  phone: string
  /** Max simultaneous chats, set by an admin. LiveChat uses 3 up to 6. */
  chatLimit: number
  /** How many of those slots are in use right now. */
  activeChats: number
  jobTitle: string
  lastActive: string
  /** Only set while `status` is `invited`. */
  invitedOn?: string
}

/**
 * Seats are allocated to the workspace by the Mercury admin. The workspace can
 * fill them and free them, but cannot mint more on its own.
 */
/**
 * A subscription tier. Seats are not independent of the plan: each tier caps
 * how many a workspace may hold, so asking for more seats than the current tier
 * allows is a plan change, not a seat change.
 */
export interface PlanTier {
  id: string
  name: string
  /** The most seats this tier permits. */
  seatCap: number
  /** Monthly price per seat, in whole currency units. */
  pricePerSeat: number
  /** One line on what the tier is for, shown beside the price. */
  summary: string
}

/** A seat or plan change awaiting the Mercury 360 admin's decision. */
export interface SeatChangeRequest {
  /** The seat total being asked for, not the delta. */
  requestedSeats: number
  requestedPlanId: string
  requestedOn: string
  reason?: string
}

export interface SeatAllocation {
  total: number
  /** Seats held by active or suspended members, plus outstanding invitations. */
  used: number
  planId: string
  planName: string
  renewsOn: string
  /**
   * Set once a change has been requested. The workspace does **not** get the
   * extra seats until Mercury 360 approves, so `total` is unchanged while this
   * is pending — invites keep being limited by what is actually allocated.
   */
  pendingChange?: SeatChangeRequest
}

export interface InviteUserInput {
  email: string
  role: UserRole
  groups: string[]
  jobTitle: string
  chatLimit: number
}

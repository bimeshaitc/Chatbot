/**
 * The CSR rota: who is on, when, covering which groups — plus the three
 * operations a shift going on or off actually needs:
 *
 *   handover   planned, self-initiated, at shift end
 *   takeover   the receiving side of a handover
 *   covering   unplanned, lead-initiated, for an absent/disconnected agent
 *
 * `handover` and `covering` are modelled as the same `ShiftHandover` record,
 * distinguished by `initiatedBy`/`reason` — a covering assignment is not a
 * different kind of thing, it is a handover the outgoing agent did not (or
 * could not) make themselves.
 */

export type ShiftStatus = 'scheduled' | 'in-progress' | 'completed' | 'no-show'

export interface Shift {
  id: string
  /** Matches chat's `Agent.id` / `PROTOTYPE_VIEWERS[role].agentId`. */
  agentId: string
  /** ISO date. Workspace-local display only — see the timezone note below. */
  date: string
  /** 'HH:mm', workspace-local. */
  startTime: string
  endTime: string
  /** Which queues this shift covers — `user-management`'s `groupOptions` vocabulary. */
  groups: string[]
  status: ShiftStatus
  notes?: string
}

export type ShiftRequestType = 'swap' | 'cover' | 'leave'
export type ShiftRequestStatus = 'pending' | 'approved' | 'declined' | 'withdrawn'

/**
 * One request covers all three of "raise a swap, ask for cover, or book time
 * off" (the exact wording `shifts.request` is described by in the permission
 * catalog) — `type` picks which, and the fields that only apply to one type
 * stay optional rather than needing three near-identical interfaces.
 */
export interface ShiftRequest {
  id: string
  type: ShiftRequestType
  /** agentId. Never also the decider — see `decidedBy`. */
  requestedBy: string
  shiftId: string
  /** Only for `type: 'swap'` — the other shift being proposed in exchange. */
  swapWithShiftId?: string
  /** Only for `type: 'cover'`, and only if a specific person was asked. */
  coverAgentId?: string
  reason?: string
  status: ShiftRequestStatus
  createdAt: string
  /**
   * agentId of whoever decided it. Must never equal `requestedBy` — enforced
   * in `useShiftRequests().decide` and again by `ApprovalRow` hiding its own
   * controls, matching the catalog's "Never their own."
   */
  decidedBy?: string
  decidedAt?: string
  declineReason?: string
}

/** Who set a handover in motion. `'lead'` is what makes it "covering", not a separate type. */
export type HandoverInitiator = 'self' | 'lead'

export type HandoverReason = 'shift-end' | 'covering'

export interface HandoverItemRef {
  kind: 'chat' | 'ticket'
  id: string
}

export interface ShiftHandover {
  id: string
  /** The outgoing agent's shift this closes out. */
  shiftId: string
  fromAgentId: string
  /** `null` = released to the unassigned pool — always a valid destination, never a fallback error state. */
  toAgentId: string | null
  initiatedBy: HandoverInitiator
  reason: HandoverReason
  /** agentId of the lead who made the call. Present iff `initiatedBy === 'lead'`. */
  reassignedByAgentId?: string
  note?: string
  /**
   * Captured once, at the moment of handover — not a live query. A reply
   * later is referencing "what was open when this happened", not whatever
   * either queue has moved on to since (same reasoning as tickets'
   * `linkedChatSummary`).
   */
  items: HandoverItemRef[]
  createdAt: string
  /** Set the moment the receiving agent opens/acknowledges it — mirrors chat's `newlyAssigned`. */
  acknowledgedAt?: string
}

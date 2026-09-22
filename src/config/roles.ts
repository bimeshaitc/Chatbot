/**
 * Workspace roles and what each one may do.
 *
 * Accounts themselves are created by the Mercury platform admin, not inside a
 * workspace. So nothing here grants "create a user" — the strongest thing a
 * workspace can do is invite an existing account into a seat it has been
 * allocated, and revoke that access again.
 *
 * Lives in config/ rather than a feature so the global role store and every
 * feature can import it without a circular dependency. It must never import
 * from `src/features` or `src/stores` — the arrow only points feature → config.
 *
 * ## Scoping
 *
 * Where the real distinction between roles is *how much they can see* rather
 * than *what they can do*, the permission is split into three ids —
 * `.view.own` / `.view.team` / `.view.all`. Read them through `resolveScope()`,
 * never individually.
 *
 * Modelled as three ids rather than a `scope` field on one id because a
 * permission × role matrix has exactly one shape: a row is a permission. As
 * three rows the escalation renders as a legible staircase, `roleCan` stays a
 * single boolean primitive, and `ROLE_PERMISSIONS` remains the whole truth
 * about a role. Consistency is guaranteed by construction: the role tables
 * below are built by spreading escalating arrays, so a wider tier can only ever
 * be added on top of a narrower one.
 *
 * ## Deliberate folds
 *
 * Four things that could be separate permissions are intentionally one, because
 * no role distinguishes them and a matrix row where every column agrees earns
 * nothing. Do not re-split without a role that needs the difference:
 *   - `tickets.setStatus`        — status *and* priority
 *   - `chats.takeOver`           — take over, supervise, and hand back to the AI
 *   - `knowledge.internal.manage`— article create / edit / delete / review
 *   - `knowledge.bot.manage`     — source add / remove / enable / disable
 */
export const WORKSPACE_ROLES = ['Owner', 'Admin', 'CSR Admin', 'CSR'] as const

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]

export type Permission =
  // ---- Chats (9) --------------------------------------------------------
  | 'chats.view.own'
  | 'chats.view.team'
  | 'chats.view.all'
  | 'chats.reply'
  | 'chats.changeStatus'
  | 'chats.takeOver'
  | 'chats.transfer'
  | 'chats.banCustomer'
  | 'chats.cannedResponses.manage'
  // ---- Tickets (9) ------------------------------------------------------
  | 'tickets.view.own'
  | 'tickets.view.team'
  | 'tickets.view.all'
  | 'tickets.create'
  | 'tickets.reply'
  | 'tickets.setStatus'
  | 'tickets.assign'
  | 'tickets.file'
  | 'tickets.delete'
  // ---- Knowledge (5) ----------------------------------------------------
  | 'knowledge.internal.view'
  | 'knowledge.internal.manage'
  | 'knowledge.bot.view'
  | 'knowledge.bot.manage'
  | 'knowledge.bot.retrain'
  // ---- AI Bot (4) -------------------------------------------------------
  | 'bot.queue.view'
  | 'bot.settings.view'
  | 'bot.settings.edit'
  | 'bot.installCode.view'
  // ---- People (8) -------------------------------------------------------
  | 'people.view'
  | 'people.setCapacity'
  | 'people.manageGroups'
  | 'people.invite'
  | 'people.changeRole'
  | 'people.suspend'
  | 'people.remove'
  | 'people.seats.request'
  // ---- Shifts (4) -------------------------------------------------------
  | 'shifts.view'
  | 'shifts.request'
  | 'shifts.manage'
  | 'shifts.approve'
  // ---- Reports (5) ------------------------------------------------------
  | 'reports.view.own'
  | 'reports.view.team'
  | 'reports.view.all'
  | 'reports.export'
  | 'reports.schedule'
  // ---- Workspace (7) ----------------------------------------------------
  | 'workspace.activityLog.view'
  | 'workspace.categories.manage'
  | 'workspace.tags.manage'
  | 'workspace.visitors.view'
  | 'workspace.integrations.manage'
  | 'workspace.campaigns.manage'
  | 'workspace.billing.view'

/** Resources whose permission is split into own/team/all tiers. */
export type ScopedResource = 'chats' | 'tickets' | 'reports'

export type Scope = 'none' | 'own' | 'team' | 'all'

/** Narrowest to widest. `resolveScope` walks this in reverse. */
export const SCOPE_TIERS = ['own', 'team', 'all'] as const

/**
 * Which work queue a CSR actually works — some agents only take chats, some
 * only tickets, some both. Modelled as a runtime attribute layered on top of
 * role rather than as separate named roles (`Chat CSR` / `Ticket CSR`): only
 * CSR is ever restricted this way, so a second dimension is cheaper than
 * tripling the role list and keeping three copies of the CSR permission
 * bundle in sync by hand.
 */
export type WorkChannel = 'chat' | 'tickets'
export const ALL_CHANNELS: WorkChannel[] = ['chat', 'tickets']

/**
 * A second, finer dial on top of the tickets channel: having the tickets
 * queue at all doesn't mean being allowed to touch it. `view` is read-only —
 * see the queue, open a ticket, read the thread — `edit` adds create/reply/
 * setStatus, i.e. today's default behaviour. Only meaningful when `channels`
 * includes `'tickets'`; ignored otherwise, and ignored above CSR (see
 * `channelCan`).
 */
export type TicketAccessLevel = 'view' | 'edit'

/** The `tickets.*` permissions that "view" withholds. Everything else under
 * `tickets.` (the view.* triple) stays granted — that's the "view" part. */
const TICKET_WRITE_PERMISSIONS: Permission[] = [
  'tickets.create',
  'tickets.reply',
  'tickets.setStatus',
  'tickets.assign',
  'tickets.file',
  'tickets.delete',
]

/**
 * Layers channel restriction on top of role. Only CSR is channel-restricted —
 * CSR Admin and up always get both, so this is a no-op for every other role.
 * A permission outside chats./tickets. (knowledge, reports, people, ...) is
 * untouched regardless of channel — with one deliberate exception:
 * `bot.queue.view` lives in the "AI Bot" category, but its only use anywhere
 * in the app is gating the AI inbox *inside Chat* (`chatInboxes.ts`, the
 * `/chat` route guard, the Chat nav item) — seeing the bot's live queue is
 * chat-channel work by any reasonable definition, so it's treated as one.
 *
 * `ticketAccess` further splits the tickets channel into view/edit — a CSR
 * can hold the tickets channel and still be denied every `tickets.*` write
 * permission, the same way a channel-less CSR is denied all of them. Defaults
 * to `'edit'` so every existing call site keeps today's behaviour unless it
 * deliberately opts in.
 */
export function channelCan(
  role: WorkspaceRole,
  channels: WorkChannel[],
  permission: Permission,
  ticketAccess: TicketAccessLevel = 'edit',
): boolean {
  if (!roleCan(role, permission)) return false
  if (role !== 'CSR') return true
  if (permission.startsWith('chats.') || permission === 'bot.queue.view') return channels.includes('chat')
  if (permission.startsWith('tickets.')) {
    if (!channels.includes('tickets')) return false
    if (ticketAccess === 'view' && TICKET_WRITE_PERMISSIONS.includes(permission)) return false
    return true
  }
  return true
}

/** True when the role/channel combination holds any one of the given permissions. */
export function channelCanAny(
  role: WorkspaceRole,
  channels: WorkChannel[],
  permissions: Permission[],
  ticketAccess: TicketAccessLevel = 'edit',
): boolean {
  return permissions.some((permission) => channelCan(role, channels, permission, ticketAccess))
}

/**
 * An agent: handles the work assigned to them, end to end. Deliberately cannot
 * see anybody else's chats or tickets — that scoping is the whole point.
 */
const CSR_PERMISSIONS: Permission[] = [
  'chats.view.own',
  'chats.reply',
  'chats.changeStatus',
  'chats.takeOver',
  'chats.transfer',
  'tickets.view.own',
  'tickets.create',
  'tickets.reply',
  'tickets.setStatus',
  'knowledge.internal.view',
  'knowledge.bot.view',
  'bot.queue.view',
  'reports.view.own',
  // An agent must be able to see their own rota and ask for a swap.
  'shifts.view',
  'shifts.request',
]

/**
 * A team lead: runs the floor. Sees and routes the team's work, sets capacity
 * and groups, owns the internal playbooks, exports the team's numbers.
 *
 * Still cannot change a role, invite, remove, retrain the bot, or see the plan.
 * That line is the role the old 12-permission model could not express.
 */
const CSR_ADMIN_PERMISSIONS: Permission[] = [
  ...CSR_PERMISSIONS,
  'chats.view.team',
  'chats.banCustomer',
  'tickets.view.team',
  'tickets.assign',
  'tickets.file',
  'knowledge.internal.manage',
  // The playbooks a team lead owns.
  'chats.cannedResponses.manage',
  // A team lead wants a visitor's history before deciding who handles them.
  'workspace.visitors.view',
  // Read-only on the widget config: useful context, not theirs to change.
  'bot.settings.view',
  'people.view',
  'people.setCapacity',
  'people.manageGroups',
  'reports.view.team',
  'reports.export',
  'workspace.activityLog.view',
  // Running the rota *is* running the floor. Kept separate from `approve` so a
  // future role could hold one without the other.
  'shifts.manage',
  'shifts.approve',
]

/**
 * Full configuration of the workspace and its people.
 *
 * The bot's training data and the embed snippet sit here rather than with the
 * floor lead, because both reach customers directly.
 */
const ADMIN_PERMISSIONS: Permission[] = [
  ...CSR_ADMIN_PERMISSIONS,
  'chats.view.all',
  'tickets.view.all',
  'tickets.delete',
  'knowledge.bot.manage',
  'knowledge.bot.retrain',
  'bot.settings.edit',
  'bot.installCode.view',
  'people.invite',
  'people.changeRole',
  'people.suspend',
  'people.remove',
  'reports.view.all',
  'reports.schedule',
  'workspace.categories.manage',
  // Shared cross-feature taxonomy (tickets + chat) — workspace-wide config,
  // same tier as categories, not a per-team call.
  'workspace.tags.manage',
  'workspace.integrations.manage',
  'workspace.campaigns.manage',
]

export const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  // The two billing-bearing grants. Seats are allocated by the Mercury admin,
  // so asking for more is the Owner's call alone.
  Owner: [...ADMIN_PERMISSIONS, 'people.seats.request', 'workspace.billing.view'],
  Admin: ADMIN_PERMISSIONS,
  'CSR Admin': CSR_ADMIN_PERMISSIONS,
  CSR: CSR_PERMISSIONS,
}

/**
 * Built once at module load. The Roles screen asks dozens × 4 questions to render a
 * single matrix, which makes `Array.includes` the hot path; the arrays above
 * are kept for display order and counting.
 */
const ROLE_PERMISSION_SETS: Record<WorkspaceRole, ReadonlySet<Permission>> = {
  Owner: new Set(ROLE_PERMISSIONS.Owner),
  Admin: new Set(ROLE_PERMISSIONS.Admin),
  'CSR Admin': new Set(ROLE_PERMISSIONS['CSR Admin']),
  CSR: new Set(ROLE_PERMISSIONS.CSR),
}

export const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  Owner: 'Everything an Admin can do, plus seats and billing with the Mercury admin.',
  Admin: 'Configures the workspace and manages people, roles and the bot.',
  'CSR Admin': 'Runs a team: the floor, capacity, groups, rotas and playbooks.',
  CSR: 'Handles the chats and tickets assigned to them.',
}

export function roleCan(role: WorkspaceRole, permission: Permission): boolean {
  return ROLE_PERMISSION_SETS[role].has(permission)
}

/** True when the role holds any one of the given permissions. */
export function roleCanAny(role: WorkspaceRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => roleCan(role, permission))
}

/**
 * The widest view tier a role holds for a resource. This is the only sanctioned
 * reader of the `.view.own` / `.team` / `.all` triples — call sites switch on
 * one value rather than juggling three booleans.
 */
export function resolveScope(role: WorkspaceRole, resource: ScopedResource): Scope {
  for (let index = SCOPE_TIERS.length - 1; index >= 0; index -= 1) {
    const tier = SCOPE_TIERS[index]
    if (roleCan(role, `${resource}.view.${tier}` as Permission)) return tier
  }
  return 'none'
}

/** The least-privileged role holding a permission — used to explain a denial. */
export function lowestRoleWith(permission: Permission): WorkspaceRole | null {
  const leastFirst: WorkspaceRole[] = ['CSR', 'CSR Admin', 'Admin', 'Owner']
  return leastFirst.find((role) => roleCan(role, permission)) ?? null
}

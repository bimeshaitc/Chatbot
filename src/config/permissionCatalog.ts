import type { Permission } from './roles'

/**
 * Display metadata for every permission.
 *
 * Kept apart from `roles.ts` so a feature that only needs `roleCan()` does not
 * pull 49 label strings, and so the model file stays short enough to read. It
 * lives in `config/` rather than the roles feature because other features want
 * these labels for their own "not available for your role" states.
 */
export type PermissionCategory =
  | 'Chats'
  | 'Tickets'
  | 'Knowledge'
  | 'AI Bot'
  | 'People'
  | 'Shifts'
  | 'Reports'
  | 'Workspace'

export const PERMISSION_CATEGORY_ORDER: PermissionCategory[] = [
  'Chats',
  'Tickets',
  'Knowledge',
  'AI Bot',
  'People',
  'Shifts',
  'Reports',
  'Workspace',
]

export interface PermissionEntry {
  id: Permission
  category: PermissionCategory
  label: string
  description: string
  /** Set on the three-way view triples, so the matrix can badge them as a tier. */
  scopeTier?: 'own' | 'team' | 'all'
}

export const PERMISSION_CATALOG: PermissionEntry[] = [
  // ---- Chats ------------------------------------------------------------
  {
    id: 'chats.view.own',
    category: 'Chats',
    label: 'See chats',
    description: 'Only the chats assigned to them.',
    scopeTier: 'own',
  },
  {
    id: 'chats.view.team',
    category: 'Chats',
    label: 'See chats',
    description: "Every chat belonging to their own groups.",
    scopeTier: 'team',
  },
  {
    id: 'chats.view.all',
    category: 'Chats',
    label: 'See chats',
    description: 'Every chat in the workspace, whoever owns it.',
    scopeTier: 'all',
  },
  { id: 'chats.reply', category: 'Chats', label: 'Reply to a customer', description: 'Send messages in a chat.' },
  {
    id: 'chats.changeStatus',
    category: 'Chats',
    label: 'Change chat status',
    description: 'Move a chat between opened, pending, resolved and closed.',
  },
  {
    id: 'chats.takeOver',
    category: 'Chats',
    label: 'Take over or supervise',
    description: 'Watch an AI chat, take it over, or hand it back to the bot.',
  },
  {
    id: 'chats.transfer',
    category: 'Chats',
    label: 'Transfer a chat',
    description: 'Hand a chat to another agent, with a note.',
  },
  {
    id: 'chats.banCustomer',
    category: 'Chats',
    label: 'Ban a customer',
    description: 'Stop a customer messaging, and lift the ban again.',
  },
  {
    id: 'chats.cannedResponses.manage',
    category: 'Chats',
    label: 'Manage canned responses',
    description: 'Create, edit and delete the shared and private quick replies agents send from.',
  },

  // ---- Tickets ----------------------------------------------------------
  {
    id: 'tickets.view.own',
    category: 'Tickets',
    label: 'See tickets',
    description: 'Only tickets assigned to them.',
    scopeTier: 'own',
  },
  {
    id: 'tickets.view.team',
    category: 'Tickets',
    label: 'See tickets',
    description: "Their groups' tickets, including the unassigned queue.",
    scopeTier: 'team',
  },
  {
    id: 'tickets.view.all',
    category: 'Tickets',
    label: 'See tickets',
    description: 'Every ticket, plus archive, spam and trash.',
    scopeTier: 'all',
  },
  { id: 'tickets.create', category: 'Tickets', label: 'Raise a ticket', description: 'From a chat or from scratch.' },
  { id: 'tickets.reply', category: 'Tickets', label: 'Reply on a ticket', description: 'Public replies and internal notes.' },
  {
    id: 'tickets.setStatus',
    category: 'Tickets',
    label: 'Set status and priority',
    description: 'Both, deliberately — no role distinguishes them.',
  },
  { id: 'tickets.assign', category: 'Tickets', label: 'Assign a ticket', description: 'To themselves or anyone else.' },
  {
    id: 'tickets.file',
    category: 'Tickets',
    label: 'Archive, spam or trash',
    description: 'Move tickets out of the working inbox, and restore them.',
  },
  {
    id: 'tickets.delete',
    category: 'Tickets',
    label: 'Delete permanently',
    description: 'Purge from the trash. Cannot be undone.',
  },

  // ---- Knowledge --------------------------------------------------------
  {
    id: 'knowledge.internal.view',
    category: 'Knowledge',
    label: 'Read internal knowledge',
    description: 'Playbooks and procedures written for agents.',
  },
  {
    id: 'knowledge.internal.manage',
    category: 'Knowledge',
    label: 'Write internal knowledge',
    description: 'Create, edit, review and delete internal articles.',
  },
  {
    id: 'knowledge.bot.view',
    category: 'Knowledge',
    label: 'Read chatbot sources',
    description: 'See what the AI has been trained on.',
  },
  {
    id: 'knowledge.bot.manage',
    category: 'Knowledge',
    label: 'Manage chatbot sources',
    description: 'Add, remove, enable and disable training sources.',
  },
  {
    id: 'knowledge.bot.retrain',
    category: 'Knowledge',
    label: 'Retrain the index',
    description: 'Rebuild what the AI answers from.',
  },

  // ---- AI Bot -----------------------------------------------------------
  {
    id: 'bot.queue.view',
    category: 'AI Bot',
    label: 'See the AI queue',
    description: 'The bot-handled chats and its handoff requests.',
  },
  {
    id: 'bot.settings.view',
    category: 'AI Bot',
    label: 'View bot settings',
    description: 'Read the widget appearance and message config.',
  },
  {
    id: 'bot.settings.edit',
    category: 'AI Bot',
    label: 'Edit bot settings',
    description: 'Change what customers see and what the bot says.',
  },
  {
    id: 'bot.installCode.view',
    category: 'AI Bot',
    label: 'See the install snippet',
    description: 'The embed code for the customer-facing widget.',
  },

  // ---- People -----------------------------------------------------------
  { id: 'people.view', category: 'People', label: 'See the team', description: 'Members, roles and availability.' },
  {
    id: 'people.setCapacity',
    category: 'People',
    label: 'Set chat capacity',
    description: "Each agent's concurrent chat limit.",
  },
  { id: 'people.manageGroups', category: 'People', label: 'Manage groups', description: 'Which teams a member belongs to.' },
  {
    id: 'people.invite',
    category: 'People',
    label: 'Invite to the workspace',
    description: 'Bring an existing Mercury account into a seat.',
  },
  { id: 'people.changeRole', category: 'People', label: "Change someone's role", description: 'Never above their own.' },
  {
    id: 'people.suspend',
    category: 'People',
    label: 'Suspend access',
    description: 'Revoke access while keeping the seat.',
  },
  {
    id: 'people.remove',
    category: 'People',
    label: 'Remove from the workspace',
    description: 'Frees the seat. Never deletes the Mercury account.',
  },
  {
    id: 'people.seats.request',
    category: 'People',
    label: 'Request more seats',
    description: 'Asks the Mercury admin. Billing-bearing.',
  },

  // ---- Shifts -----------------------------------------------------------
  { id: 'shifts.view', category: 'Shifts', label: 'See the rota', description: 'Their own shifts, and their groups.' },
  {
    id: 'shifts.request',
    category: 'Shifts',
    label: 'Request a change',
    description: 'Raise a swap, ask for cover, or book time off.',
  },
  {
    id: 'shifts.manage',
    category: 'Shifts',
    label: 'Edit the rota',
    description: 'Shifts, templates, business hours and holidays.',
  },
  {
    id: 'shifts.approve',
    category: 'Shifts',
    label: "Decide someone's request",
    description: 'Approve or decline swaps, cover and leave. Never their own.',
  },

  // ---- Reports ----------------------------------------------------------
  {
    id: 'reports.view.own',
    category: 'Reports',
    label: 'See reports',
    description: 'Only their own numbers.',
    scopeTier: 'own',
  },
  {
    id: 'reports.view.team',
    category: 'Reports',
    label: 'See reports',
    description: "Their groups' performance, including per-agent.",
    scopeTier: 'team',
  },
  {
    id: 'reports.view.all',
    category: 'Reports',
    label: 'See reports',
    description: 'Every report across the workspace.',
    scopeTier: 'all',
  },
  { id: 'reports.export', category: 'Reports', label: 'Export a report', description: 'Download as CSV or PDF.' },
  {
    id: 'reports.schedule',
    category: 'Reports',
    label: 'Schedule a report',
    description: 'Have one emailed on a recurring schedule.',
  },

  // ---- Workspace --------------------------------------------------------
  {
    id: 'workspace.activityLog.view',
    category: 'Workspace',
    label: 'See the activity log',
    description: 'Who changed what, and when.',
  },
  {
    id: 'workspace.categories.manage',
    category: 'Workspace',
    label: 'Manage categories',
    description: 'The categories chats and tickets are filed under.',
  },
  {
    id: 'workspace.tags.manage',
    category: 'Workspace',
    label: 'Manage tags',
    description: 'The shared tag list chats and tickets are labelled with.',
  },
  {
    id: 'workspace.visitors.view',
    category: 'Workspace',
    label: 'See visitors',
    description: "Every visitor's identity, device and conversation history across the desk.",
  },
  {
    id: 'workspace.integrations.manage',
    category: 'Workspace',
    label: 'Manage integrations',
    description: 'Connect and disconnect channels.',
  },
  {
    id: 'workspace.campaigns.manage',
    category: 'Workspace',
    label: 'Manage campaigns',
    description: 'Create, edit and send outbound campaigns.',
  },
  {
    id: 'workspace.billing.view',
    category: 'Workspace',
    label: 'See the plan',
    description: 'Seat allocation, plan and renewal date.',
  },
]

export const PERMISSION_LABELS: Record<Permission, string> = PERMISSION_CATALOG.reduce(
  (labels, entry) => {
    labels[entry.id] = entry.scopeTier ? `${entry.label} (${entry.scopeTier})` : entry.label
    return labels
  },
  {} as Record<Permission, string>,
)

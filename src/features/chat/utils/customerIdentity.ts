import type { Conversation } from '../types'

/**
 * Whether anyone has told us who this customer is. `undefined` is treated as
 * identified — every conversation the app has ever seeded came with a name
 * attached — so this only needs setting where it's actually `false`: a chat
 * that started from the widget before the visitor gave a name or email (see
 * `WidgetChatSimulator` on the customer-facing side, which starts every
 * session anonymous by design and only ever collects an email, and only at
 * the point a ticket needs one — never a name).
 *
 * Deliberately not modelled as `customer: string | null`: that would ripple
 * `| null` into every one of the dozen places that already read
 * `conversation.customer` as plain text (the ban dialog, the ticket dialog,
 * search...), all of which are already correct once `customer` holds a
 * placeholder like "Visitor 7215" — a real string, just not a name yet. This
 * flag is the only thing those places would otherwise get wrong: whether to
 * show it with the same confidence as a name someone actually gave.
 */
export function isIdentified(conversation: Conversation): boolean {
  return conversation.isIdentified ?? true
}

/** The avatar treatment for a visitor nobody has identified yet — deliberately not one of the named palette. */
export const UNIDENTIFIED_AVATAR_COLOR = 'bg-gray-100 text-gray-400'

/** Same convention already used for agents and manually-created ticket requesters elsewhere in the app. */
export function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** The palette every other seeded customer avatar already draws from. */
const NAMED_AVATAR_COLORS = [
  'bg-indigo-200 text-indigo-700',
  'bg-rose-200 text-rose-700',
  'bg-emerald-200 text-emerald-700',
  'bg-sky-200 text-sky-700',
  'bg-amber-200 text-amber-700',
  'bg-purple-200 text-purple-700',
  'bg-teal-200 text-teal-800',
  'bg-pink-200 text-pink-700',
]

/** Deterministic rather than random, so the same name always lands on the same colour across renders. */
export function avatarColorFor(name: string): string {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) hash = (hash * 31 + name.charCodeAt(index)) >>> 0
  return NAMED_AVATAR_COLORS[hash % NAMED_AVATAR_COLORS.length]
}

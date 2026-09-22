/**
 * Canned responses used to be a read-only seed array the chat composer
 * imported directly (`chat/data/mockChatData.ts`'s old `cannedResponses`).
 * This is the canonical, manageable version — shared or private, with a
 * shortcut and an owner — and the composer now reads from it instead.
 */
export type CannedResponseVisibility = 'shared' | 'private'

export interface CannedResponseConfig {
  id: string
  title: string
  body: string
  /** Typed in the composer to jump straight to it, e.g. `/greeting`. Always starts with `/`. */
  shortcut: string
  visibility: CannedResponseVisibility
  /** Only meaningful when `visibility` is `shared`. Empty means every group. */
  groups: string[]
  /** Always set — private ones are usable only by this agent. */
  ownerId: string
  ownerName: string
  createdAt: string
}

export type NewCannedResponseInput = Pick<CannedResponseConfig, 'title' | 'body' | 'shortcut' | 'visibility' | 'groups'>

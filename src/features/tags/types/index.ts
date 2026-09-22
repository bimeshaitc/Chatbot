/**
 * The one shared tag list. Tickets and chat used to each hardcode their own
 * plain `string[]` of suggestions with no id, no color, and real overlap
 * (`Billing`, `Refund`, `Shipping`... duplicated in both files) — this is the
 * canonical replacement both features read from.
 */
export type TagColor = 'blue' | 'emerald' | 'gray' | 'amber' | 'rose' | 'violet' | 'cyan'

export interface Tag {
  id: string
  name: string
  color: TagColor
  createdAt: string
}

export type NewTagInput = Pick<Tag, 'name' | 'color'>

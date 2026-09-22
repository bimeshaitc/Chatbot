export interface CategoryAuthor {
  name: string
  initials: string
  avatarColor: string
  role: string
}

/**
 * The one shared category list (BE-05). Tickets and chat used to each
 * hardcode their own `{id, name}[]`, and this admin page a third, disconnected
 * list of its own — renaming or disabling a category here had no effect on
 * what either feature could display or assign. This is the canonical
 * replacement all three read from via `useCategories`, keyed by the same ids
 * (`finance`, `support`, `technical`, ...) tickets and chat already reference.
 */
export interface Category {
  id: string
  name: string
  /** Disabled categories stay visible on existing chats/tickets but cannot be assigned to new ones. */
  enabled: boolean
  addedBy: CategoryAuthor
  addedOn: string
}

export type NewCategoryInput = Pick<Category, 'name'>

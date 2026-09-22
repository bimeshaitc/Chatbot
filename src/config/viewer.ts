import type { WorkspaceRole } from './roles'

/**
 * Who the prototype is acting as, per role.
 *
 * Scoped permissions (`chats.view.own`, `tickets.view.team`) need something to
 * compare against, and the app has no signed-in identity — `useAuthStore` is
 * never populated. This supplies one.
 *
 * The ids are plain literals on purpose. `config/roles.ts` is already imported
 * *by* `features/user-management/data/`, so importing feature data back into
 * config would be a cycle. That means these values restate ids owned elsewhere,
 * and the duplication should stay visible rather than being hidden behind a
 * helper. They must agree with:
 *   - `src/features/chat/data/mockChatData.ts`      → `agents`
 *   - `src/features/tickets/data/mockTicketsData.ts` → `ticketAgents`, `CURRENT_AGENT_ID`
 *   - `src/features/user-management/data/mockUserManagementData.ts` → `groupOptions`
 *
 * In a real deployment this comes from the session and the switcher disappears.
 */
export interface PrototypeViewer {
  name: string
  /** Matches an agent id used by the chat and ticket features. */
  agentId: string
  /** Matches `groupOptions` in user-management. Drives `team` scope. */
  groups: string[]
}

export const PROTOTYPE_VIEWERS: Record<WorkspaceRole, PrototypeViewer> = {
  Owner: { name: 'Jane Smith', agentId: 'jane-smith', groups: ['Technical', 'Finance', 'Service', 'Product'] },
  Admin: { name: 'Jane Smith', agentId: 'jane-smith', groups: ['Technical', 'Finance', 'Service', 'Product'] },
  // A lead over the money side only, so `team` scope visibly excludes Technical.
  'CSR Admin': { name: 'Anisha Thapa', agentId: 'anisha-thapa', groups: ['Finance'] },
  // An agent in one group, so `own` scope has something to bite on.
  CSR: { name: 'Anisha Thapa', agentId: 'anisha-thapa', groups: ['Finance'] },
}

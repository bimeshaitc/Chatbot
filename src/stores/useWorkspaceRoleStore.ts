import { create } from 'zustand'
import {
  ALL_CHANNELS,
  channelCan,
  resolveScope,
  type Permission,
  type Scope,
  type ScopedResource,
  type TicketAccessLevel,
  type WorkChannel,
  type WorkspaceRole,
} from '@/config/roles'
import { PROTOTYPE_VIEWERS, type PrototypeViewer } from '@/config/viewer'

interface WorkspaceRoleState {
  /** The role the app is currently being viewed as. */
  role: WorkspaceRole
  setRole: (role: WorkspaceRole) => void
  /**
   * Which queue(s) a CSR actually works. Meaningless for every other role —
   * `channelCan` only branches on it when `role === 'CSR'`. Defaults to both,
   * so nothing changes until this is deliberately narrowed from the header.
   */
  csrChannels: WorkChannel[]
  setCsrChannels: (channels: WorkChannel[]) => void
  /**
   * Whether a channel-restricted CSR may only *see* the tickets queue or also
   * work it. Meaningless unless `csrChannels` includes `'tickets'` — same
   * no-op-until-narrowed shape as `csrChannels` itself.
   */
  csrTicketAccess: TicketAccessLevel
  setCsrTicketAccess: (ticketAccess: TicketAccessLevel) => void
}

/**
 * Drives the prototype's "viewing as" switch. In a real deployment this would
 * come from the signed-in account rather than being selectable, but every
 * screen reads it the same way either way — so swapping the source later does
 * not touch the components.
 */
export const useWorkspaceRoleStore = create<WorkspaceRoleState>((set) => ({
  role: 'Owner',
  setRole: (role) => set({ role }),
  csrChannels: ALL_CHANNELS,
  setCsrChannels: (csrChannels) => set({ csrChannels }),
  csrTicketAccess: 'edit',
  setCsrTicketAccess: (csrTicketAccess) => set({ csrTicketAccess }),
}))

/**
 * Convenience selector: `const canInvite = usePermission('people.invite')`.
 * Routes through `channelCan` rather than plain `roleCan` — a no-op for every
 * permission outside chats./tickets. and every role outside CSR, so this is
 * safe for every existing call site without exception.
 */
export function usePermission(permission: Permission): boolean {
  return useWorkspaceRoleStore((state) => channelCan(state.role, state.csrChannels, permission, state.csrTicketAccess))
}

/**
 * Who the app is acting as. Needed to resolve `own` and `team` scope — without
 * an identity there is nothing for those tiers to compare against.
 */
export function useViewer(): PrototypeViewer {
  return useWorkspaceRoleStore((state) => PROTOTYPE_VIEWERS[state.role])
}

/** The widest view tier the current role holds for a resource. */
export function useScope(resource: ScopedResource): Scope {
  return useWorkspaceRoleStore((state) => resolveScope(state.role, resource))
}

/** The raw channel list — for the header switcher and any `channelCanAny` call site. */
export function useChannels(): WorkChannel[] {
  return useWorkspaceRoleStore((state) => state.csrChannels)
}

/** The raw ticket-access level — for the header switcher and any raw `channelCan`/`channelCanAny` call site. */
export function useTicketAccess(): TicketAccessLevel {
  return useWorkspaceRoleStore((state) => state.csrTicketAccess)
}

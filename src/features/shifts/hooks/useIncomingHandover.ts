import { useViewer } from '@/stores/useWorkspaceRoleStore'
import { useHandovers } from './useHandovers'

/** Mirrors chat's `useNewAssignmentCount` — finds the one unacknowledged handover addressed to the viewer. */
export function useIncomingHandover() {
  const { handovers, acknowledge } = useHandovers()
  const viewer = useViewer()

  const incoming = handovers.find(
    (handover) => handover.toAgentId === viewer.agentId && !handover.acknowledgedAt,
  )

  return { incoming, acknowledge }
}

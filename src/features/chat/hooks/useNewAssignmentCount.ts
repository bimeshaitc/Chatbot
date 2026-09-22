import { useViewer } from '@/stores/useWorkspaceRoleStore'
import { isArchived } from '../utils/conversationStatus'
import { useConversations } from './useConversations'

/**
 * How many live chats have just been handed to the current viewer and not yet
 * opened. This is the one predicate the list badge, the header banner, the
 * popup and the sidebar dot all share — asking it here once means they cannot
 * quietly drift into disagreeing about what "newly assigned" means.
 */
export function useNewAssignmentCount(): number {
  const { conversations } = useConversations()
  const viewer = useViewer()

  return conversations.filter(
    (conversation) =>
      !isArchived(conversation) && conversation.newlyAssigned && conversation.assignedAgentId === viewer.agentId,
  ).length
}

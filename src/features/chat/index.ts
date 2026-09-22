export { ChatView } from './components/ChatView'
export { useNewAssignmentCount } from './hooks/useNewAssignmentCount'
// Added for the shifts feature, which needs to reassign chats in bulk during
// a handover — reusing the exact same store and mutation every per-chat
// Transfer action already goes through, rather than a second mechanism.
export { useConversations } from './hooks/useConversations'
export { isArchived } from './utils/conversationStatus'
export { agents } from './data/mockChatData'
export type { Agent, Conversation } from './types'

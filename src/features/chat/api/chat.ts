import {
  activityLog,
  conversations,
  customerProfilesByConversationId,
  messagesByConversationId,
} from '../data/mockChatData'
import type { ActivityLogEntry, ChatMessage, Conversation, CustomerProfile } from '../types'

/**
 * No backend endpoint is documented yet for chats/tickets (see CLAUDE.md — only
 * `POST /user/login` is confirmed against the real API). These functions read
 * from the mock dataset but are shaped like the real per-resource calls
 * (`GET /conversations/:id`, `GET /conversations/:id/messages`, ...) so swapping
 * in `apiClient.get(...)` later only touches this file, not the hooks or views
 * that consume it.
 */
export async function fetchConversations(): Promise<Conversation[]> {
  return conversations
}

export async function fetchConversationById(conversationId: string): Promise<Conversation | null> {
  return conversations.find((conversation) => conversation.id === conversationId) ?? null
}

export async function fetchConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  return messagesByConversationId[conversationId] ?? []
}

export async function fetchCustomerProfile(conversationId: string): Promise<CustomerProfile | null> {
  return customerProfilesByConversationId[conversationId] ?? null
}

export async function fetchConversationActivity(conversationId: string): Promise<ActivityLogEntry[]> {
  return activityLog[conversationId] ?? []
}

import type { CannedResponseConfig } from '../types'

export interface CannedResponseViewer {
  agentId: string
  groups: string[]
}

/**
 * What this viewer may actually use: their own private ones, plus every
 * shared one whose `groups` is empty (visible to everyone) or overlaps
 * theirs. A shared response scoped to "Finance" never reaches an agent who
 * isn't in that group, the same rule chat/ticket scoping already uses.
 */
export function visibleCannedResponses(
  responses: CannedResponseConfig[],
  viewer: CannedResponseViewer,
): CannedResponseConfig[] {
  return responses.filter((response) => {
    if (response.visibility === 'private') return response.ownerId === viewer.agentId
    return response.groups.length === 0 || response.groups.some((group) => viewer.groups.includes(group))
  })
}

/**
 * Whether this response should even appear on the management page — "a
 * Private response is visible only to the user who created it" applies to
 * the admin list too, not just the composer's insert menu. A shared response
 * is listed for everyone who can reach the page; whether they may *edit* it
 * is a separate, narrower question — see `canManageResponse`.
 */
export function listableCannedResponse(response: CannedResponseConfig, viewer: CannedResponseViewer): boolean {
  return response.visibility === 'shared' || response.ownerId === viewer.agentId
}

/**
 * Whether this viewer may edit or delete this response. The owner always
 * may. A private response is never manageable by anyone else, permission or
 * not — same rule as `listableCannedResponse`. A shared response needs the
 * management permission *and* to fall within the viewer's own scope: an
 * org-wide share (no groups), or one overlapping a group the viewer belongs
 * to. Admin/Owner's `groups` already covers every workspace group, so this
 * naturally gives them full reach without a separate role check.
 */
export function canManageResponse(
  response: CannedResponseConfig,
  viewer: CannedResponseViewer,
  hasManagePermission: boolean,
): boolean {
  if (response.ownerId === viewer.agentId) return true
  if (response.visibility === 'private' || !hasManagePermission) return false
  return response.groups.length === 0 || response.groups.some((group) => viewer.groups.includes(group))
}

import type { ShiftRequestStatus, ShiftRequestType, ShiftStatus } from '../types'

/** Matches the app's existing status-meta convention (see `conversationStatusMeta`, `statusMeta` in tickets). */
export const shiftStatusMeta: Record<ShiftStatus, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: 'In progress', className: 'bg-emerald-50 text-emerald-700' },
  completed: { label: 'Completed', className: 'bg-blue-50 text-blue-700' },
  'no-show': { label: 'No-show', className: 'bg-rose-50 text-rose-700' },
}

export const requestTypeMeta: Record<ShiftRequestType, { label: string }> = {
  swap: { label: 'Swap' },
  cover: { label: 'Cover' },
  leave: { label: 'Leave' },
}

export const requestStatusMeta: Record<ShiftRequestStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700' },
  declined: { label: 'Declined', className: 'bg-rose-50 text-rose-700' },
  withdrawn: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-500' },
}

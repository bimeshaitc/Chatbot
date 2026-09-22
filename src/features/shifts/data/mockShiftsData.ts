import type { Shift, ShiftHandover, ShiftRequest } from '../types'

/**
 * One representative week, using chat's 4 agent ids verbatim so shifts,
 * chats and tickets all resolve to the same roster. Tuesday and Friday are
 * deliberately thin (rota gaps should be visible, not hidden by a fully
 * staffed demo week). Monday has one intentional overlap on jane-smith /
 * anisha-thapa to demonstrate the non-blocking overlap warning.
 */
export const shifts: Shift[] = [
  // Monday
  { id: 'shift-1', agentId: 'jane-smith', date: '2026-09-07', startTime: '08:00', endTime: '16:00', groups: ['Technical', 'Product'], status: 'completed' },
  { id: 'shift-2', agentId: 'anisha-thapa', date: '2026-09-07', startTime: '14:00', endTime: '22:00', groups: ['Finance'], status: 'completed' },
  { id: 'shift-3', agentId: 'ravi-koirala', date: '2026-09-07', startTime: '08:00', endTime: '16:00', groups: ['Technical'], status: 'completed' },
  // Tuesday — thin day, only one agent
  { id: 'shift-4', agentId: 'mira-lama', date: '2026-09-08', startTime: '09:00', endTime: '17:00', groups: ['Service'], status: 'completed' },
  // Wednesday
  { id: 'shift-5', agentId: 'jane-smith', date: '2026-09-09', startTime: '08:00', endTime: '16:00', groups: ['Technical', 'Product'], status: 'completed' },
  { id: 'shift-6', agentId: 'ravi-koirala', date: '2026-09-09', startTime: '08:00', endTime: '16:00', groups: ['Technical'], status: 'completed' },
  { id: 'shift-7', agentId: 'mira-lama', date: '2026-09-09', startTime: '09:00', endTime: '17:00', groups: ['Service'], status: 'completed' },
  // Thursday — today, in progress
  { id: 'shift-8', agentId: 'jane-smith', date: '2026-09-10', startTime: '08:00', endTime: '16:00', groups: ['Technical', 'Product'], status: 'in-progress' },
  { id: 'shift-9', agentId: 'anisha-thapa', date: '2026-09-10', startTime: '08:00', endTime: '16:00', groups: ['Finance'], status: 'in-progress' },
  { id: 'shift-10', agentId: 'mira-lama', date: '2026-09-10', startTime: '14:00', endTime: '22:00', groups: ['Service'], status: 'scheduled' },
  // Friday — thin day
  { id: 'shift-11', agentId: 'ravi-koirala', date: '2026-09-11', startTime: '08:00', endTime: '16:00', groups: ['Technical'], status: 'scheduled' },
  // Saturday
  { id: 'shift-12', agentId: 'jane-smith', date: '2026-09-12', startTime: '09:00', endTime: '17:00', groups: ['Technical', 'Product'], status: 'scheduled' },
  { id: 'shift-13', agentId: 'mira-lama', date: '2026-09-12', startTime: '09:00', endTime: '17:00', groups: ['Service'], status: 'scheduled' },
  // Sunday
  { id: 'shift-14', agentId: 'anisha-thapa', date: '2026-09-13', startTime: '10:00', endTime: '18:00', groups: ['Finance'], status: 'scheduled' },
]

export const shiftRequests: ShiftRequest[] = [
  {
    id: 'req-1',
    type: 'swap',
    requestedBy: 'ravi-koirala',
    shiftId: 'shift-11',
    swapWithShiftId: 'shift-13',
    reason: 'Family event Friday afternoon, happy to cover Saturday instead.',
    status: 'pending',
    createdAt: '2026-09-08T10:15:00Z',
  },
  {
    id: 'req-2',
    type: 'leave',
    requestedBy: 'mira-lama',
    shiftId: 'shift-13',
    reason: 'Requesting the day off — personal appointment.',
    status: 'pending',
    createdAt: '2026-09-09T09:00:00Z',
  },
  {
    id: 'req-3',
    type: 'cover',
    requestedBy: 'anisha-thapa',
    shiftId: 'shift-14',
    coverAgentId: 'jane-smith',
    reason: 'Asked Jane to cover Sunday, but scheduling clashed with her own shift.',
    status: 'declined',
    createdAt: '2026-09-06T12:30:00Z',
    decidedBy: 'jane-smith',
    decidedAt: '2026-09-06T15:45:00Z',
    declineReason: 'Already scheduled that day — check with Ravi instead.',
  },
]

export const shiftHandovers: ShiftHandover[] = [
  {
    id: 'handover-1',
    shiftId: 'shift-1',
    fromAgentId: 'jane-smith',
    toAgentId: 'ravi-koirala',
    initiatedBy: 'self',
    reason: 'shift-end',
    note: 'One open billing ticket — customer is checking their card number format, should follow up if no reply by morning. One chat still active, customer mid-troubleshooting on the same issue.',
    items: [
      { kind: 'ticket', id: 't-1042' },
      { kind: 'chat', id: '1' },
    ],
    createdAt: '2026-09-07T16:00:00Z',
    acknowledgedAt: '2026-09-07T16:05:00Z',
  },
]

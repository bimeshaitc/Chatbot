import type { ReviewStatus } from '../types'

export const reviewStatusMeta: Record<ReviewStatus, { label: string; className: string; note: string }> = {
  current: { label: 'Up to date', className: 'bg-emerald-50 text-emerald-700', note: '' },
  due: {
    label: 'Review due',
    className: 'bg-amber-50 text-amber-700',
    note: 'Past its review date — check with the owner before relying on it.',
  },
  stale: {
    label: 'Out of date',
    className: 'bg-rose-50 text-rose-700',
    note: 'Not reviewed in months. Treat as historical unless the owner confirms it.',
  },
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-600',
    note: 'Still being written. Confirm with your team lead first.',
  },
}

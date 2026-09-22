import type { Shift } from '../types'

/** The 7 ISO dates of the week `anchor` falls in, Monday first. */
export function getWeekDates(anchor: Date): string[] {
  const day = anchor.getDay()
  // getDay() is 0-Sun..6-Sat; shift so Monday is the start of the week.
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() + mondayOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date.toISOString().slice(0, 10)
  })
}

export function shiftsForAgentAndDay(shifts: Shift[], agentId: string, date: string): Shift[] {
  return shifts.filter((shift) => shift.agentId === agentId && shift.date === date)
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * A soft signal only — the model allows overlapping shifts on purpose (an
 * overlap window is how a real handover conversation happens), so this never
 * blocks anything, it only surfaces a warning in the create/edit form.
 */
export function shiftsOverlap(a: Shift, b: Shift): boolean {
  if (a.date !== b.date || a.id === b.id) return false
  return toMinutes(a.startTime) < toMinutes(b.endTime) && toMinutes(b.startTime) < toMinutes(a.endTime)
}

export function formatDayLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
}

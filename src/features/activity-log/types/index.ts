export interface ActivityLogActor {
  name: string
  initials: string
  avatarColor: string
}

export interface ActivityLogTarget {
  name: string
  initials: string
  avatarColor: string
}

export interface ActivityLogEntry {
  id: string
  actor: ActivityLogActor
  action: string
  target?: ActivityLogTarget
  note?: string
  day: string
  time: string
  read?: boolean
}

import { useMemo, useState } from 'react'
import { Check, ChevronDown, History, Search, ShieldAlert, Users, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/PageHeader'
import { ActivityLogPanel } from '@/features/activity-log'
import { ROLE_DESCRIPTIONS, roleCan, type WorkspaceRole } from '@/config/roles'
import { useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { useDesignVersion } from '@/stores/useDesignVersionStore'
import { useAppVersionStore } from '@/stores/useAppVersionStore'
import { useGroupsStore, useReportGroupUsage } from '@/stores/useGroupsStore'
import { useDebounce } from '@/hooks/useDebounce'
import { generateId } from '@/lib/utils'
import {
  avatarColorFor,
  initialSeats,
  initialUsers,
  initialsFor,
  knownPlatformAccountEmails,
  planById,
  roleOptions,
} from '../data/mockUserManagementData'
import type { AppUser, InviteUserInput, MembershipStatus, SeatAllocation, UserRole } from '../types'
import { roleMeta } from '../utils/userMeta'
import { EditUserDialog, type UserAccessChanges } from './EditUserDialog'
import { EditUserDialogV2 } from './EditUserDialogV2'
import { InviteUserDialog } from './InviteUserDialog'
import { InviteUserDialogV2 } from './InviteUserDialogV2'
import { ManageGroupsDialog } from './ManageGroupsDialog'
import { RequestSeatsDialog } from './RequestSeatsDialog'
import { RequestSeatsDialogV2 } from './RequestSeatsDialogV2'
import { SeatSummary } from './SeatSummary'
import { UserCard } from './UserCard'

/** Nobody may hand out a role above their own. */
const roleRank: Record<WorkspaceRole, number> = { Owner: 3, Admin: 2, 'CSR Admin': 1, CSR: 0 }

type StatusFilter = MembershipStatus | 'all'

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' },
]

export function UserManagementPage() {
  const viewerRole = useWorkspaceRoleStore((state) => state.role)
  const appVersion = useAppVersionStore((state) => state.version)

  const [users, setUsers] = useState<AppUser[]>(initialUsers)
  const [seats, setSeats] = useState<SeatAllocation>(initialSeats)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [isInviteOpen, setInviteOpen] = useState(false)
  const [isSeatsOpen, setSeatsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [isActivityLogOpen, setActivityLogOpen] = useState(false)
  const [isManageGroupsOpen, setManageGroupsOpen] = useState(false)

  const groupOptions = useGroupsStore((state) => state.groups)

  // Independently versioned — see the header's "Invite / Seats design"
  // switcher — so trying the V2 invite flow doesn't also flip Request Seats.
  const inviteDesignVersion = useDesignVersion('user-management-invite')
  const seatsDesignVersion = useDesignVersion('user-management-seats')
  const editDesignVersion = useDesignVersion('user-management-edit')

  const debouncedSearch = useDebounce(search)

  const canView = roleCan(viewerRole, 'people.view')
  const canInvite = roleCan(viewerRole, 'people.invite')
  const canChangeRole = roleCan(viewerRole, 'people.changeRole')
  const canSetCapacity = roleCan(viewerRole, 'people.setCapacity')
  const canManageGroups = roleCan(viewerRole, 'people.manageGroups')
  const canSuspend = roleCan(viewerRole, 'people.suspend')
  const canRemove = roleCan(viewerRole, 'people.remove')
  // Billing/seats requests aren't a real feature yet — same v1/v2 gate as
  // Business Plan, so the request stays possible under `people.seats.request`
  // but doesn't surface until the workspace is switched to V2.
  const canRequestSeats = roleCan(viewerRole, 'people.seats.request') && appVersion === 'v2'

  // In the prototype the viewer is whoever holds the switched-to role.
  const viewerId = useMemo(() => users.find((user) => user.role === viewerRole)?.id ?? null, [users, viewerRole])

  const assignableRoles = useMemo(
    () => roleOptions.filter((role) => roleRank[role] <= roleRank[viewerRole]),
    [viewerRole],
  )

  // Lets the shared groups store refuse to delete a group members still hold.
  const groupUsage = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const user of users) {
      for (const group of user.groups) counts[group] = (counts[group] ?? 0) + 1
    }
    return counts
  }, [users])
  useReportGroupUsage('user-management', groupUsage)

  const ownerCount = users.filter((user) => user.role === 'Owner' && user.status !== 'invited').length

  function lockReasonFor(user: AppUser): string | null {
    if (user.role === 'Owner' && ownerCount <= 1) {
      return 'The workspace must keep one Owner. Promote someone else first.'
    }
    if (roleRank[user.role] > roleRank[viewerRole]) {
      return `A ${viewerRole} cannot change a ${user.role}.`
    }
    return null
  }

  const filteredUsers = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    return users.filter((user) => {
      if (statusFilter !== 'all' && user.status !== statusFilter) return false
      if (roleFilter !== 'all' && user.role !== roleFilter) return false
      if (!query) return true
      return [user.firstName, user.lastName, user.email, user.jobTitle, ...user.groups]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [users, statusFilter, roleFilter, debouncedSearch])

  const counts = useMemo(
    () => ({
      active: users.filter((user) => user.status === 'active').length,
      invited: users.filter((user) => user.status === 'invited').length,
      suspended: users.filter((user) => user.status === 'suspended').length,
      accepting: users.filter((user) => user.status === 'active' && user.availability === 'accepting').length,
    }),
    [users],
  )

  function handleInvite(input: InviteUserInput) {
    // The account exists on the Mercury side; derive a display name from the
    // address until they sign in and their own profile takes over.
    const [localPart] = input.email.split('@')
    const [rawFirst, rawLast = ''] = localPart.split(/[._-]/)
    const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1)
    const lastName = rawLast ? rawLast.charAt(0).toUpperCase() + rawLast.slice(1) : ''

    const invited: AppUser = {
      id: generateId(),
      firstName,
      lastName,
      initials: initialsFor(firstName, lastName || firstName.slice(1, 2)),
      avatarColor: avatarColorFor(input.email),
      role: input.role,
      status: 'invited',
      availability: 'offline',
      groups: input.groups,
      email: input.email,
      phone: '—',
      chatLimit: input.chatLimit,
      activeChats: 0,
      jobTitle: input.jobTitle,
      lastActive: 'Has not signed in yet',
      invitedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    }

    setUsers((prev) => [invited, ...prev])
    setSeats((prev) => ({ ...prev, used: prev.used + 1 }))
    setInviteOpen(false)
    toast.success(`Invitation sent to ${input.email}`)
  }

  function handleSaveAccess(changes: UserAccessChanges) {
    if (!editingUser) return
    setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? { ...user, ...changes } : user)))
    setEditingUser(null)
    toast.success(`Updated ${editingUser.firstName}'s access`)
  }

  function handleSuspend(user: AppUser) {
    setUsers((prev) =>
      prev.map((entry) =>
        entry.id === user.id ? { ...entry, status: 'suspended', availability: 'offline', activeChats: 0 } : entry,
      ),
    )
    toast.info(`${user.firstName} can no longer sign in to this workspace. Their seat is kept.`)
  }

  function handleReactivate(user: AppUser) {
    setUsers((prev) =>
      prev.map((entry) => (entry.id === user.id ? { ...entry, status: 'active', availability: 'not-accepting' } : entry)),
    )
    toast.success(`${user.firstName} has access again`)
  }

  function handleRemove(user: AppUser) {
    setUsers((prev) => prev.filter((entry) => entry.id !== user.id))
    setSeats((prev) => ({ ...prev, used: Math.max(prev.used - 1, 0) }))
    toast.success(`${user.firstName} removed from the workspace. Their Mercury account is untouched and the seat is free.`)
  }

  function handleResendInvite(user: AppUser) {
    toast.success(`Invitation resent to ${user.email}`)
  }

  function handleRevokeInvite(user: AppUser) {
    setUsers((prev) => prev.filter((entry) => entry.id !== user.id))
    setSeats((prev) => ({ ...prev, used: Math.max(prev.used - 1, 0) }))
    toast.info(`Invitation to ${user.email} revoked, seat freed`)
  }

  function handleRequestSeats(requestedSeats: number, planId: string, reason: string) {
    const plan = planById(planId)
    const isUpgrade = planId !== seats.planId

    // The seat total is deliberately NOT raised here — Mercury 360 has to
    // approve first, so invites stay limited by what is actually allocated.
    setSeats((prev) => ({
      ...prev,
      pendingChange: {
        requestedSeats,
        requestedPlanId: planId,
        requestedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        reason: reason || undefined,
      },
    }))
    setSeatsOpen(false)
    toast.success(
      isUpgrade
        ? `Upgrade to ${plan.name} requested (${requestedSeats} seats)`
        : `${requestedSeats - seats.total} more seats requested from Mercury 360`,
    )
  }

  const seatsRemaining = Math.max(seats.total - seats.used, 0)
  const isFiltering = search.trim().length > 0 || statusFilter !== 'all' || roleFilter !== 'all'

  if (!canView) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4">
        <PageHeader title="Users List" description="Manage workspace access and capacity" />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center">
          <ShieldAlert className="h-6 w-6 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">Not available for your role</p>
          <p className="max-w-sm text-xs text-[#6E7678]">
            {ROLE_DESCRIPTIONS[viewerRole]} Switch to CSR Admin or above using the role picker in the header to manage
            people.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4">
      <PageHeader title="Users List" description="Manage workspace access, roles and chat capacity" />

      <SeatSummary
        seats={seats}
        canInvite={canInvite}
        canRequestSeats={canRequestSeats}
        showBillingDetails={appVersion === 'v2'}
        onInvite={() => setInviteOpen(true)}
        onRequestSeats={() => setSeatsOpen(true)}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, group"
              className="pl-9"
            />
          </div>

          {/* Nine filter chips across two rows became two dropdowns. The counts
              live on the options, so the summary sentence that used to restate
              them is gone too. */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 hover:bg-gray-50">
              {statusFilters.find((filter) => filter.value === statusFilter)?.label ?? 'Everyone'}
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-44">
              {statusFilters.map((filter) => (
                <DropdownMenuItem key={filter.value} onClick={() => setStatusFilter(filter.value)}>
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    {statusFilter === filter.value && <Check className="h-3.5 w-3.5 text-[#1B5E20]" />}
                  </span>
                  <span className="flex-1">{filter.label}</span>
                  {filter.value !== 'all' && (
                    <span className="text-xs text-gray-400">{counts[filter.value as keyof typeof counts]}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 hover:bg-gray-50">
              {roleFilter === 'all' ? 'All roles' : roleMeta[roleFilter].label}
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-44">
              {(['all', ...roleOptions] as (UserRole | 'all')[]).map((role) => (
                <DropdownMenuItem key={role} onClick={() => setRoleFilter(role)}>
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    {roleFilter === role && <Check className="h-3.5 w-3.5 text-[#1B5E20]" />}
                  </span>
                  {role === 'all' ? 'All roles' : roleMeta[role].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isFiltering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setRoleFilter('all')
              }}
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}

          {canManageGroups && (
            <Button variant="outline" className="ml-auto" onClick={() => setManageGroupsOpen(true)}>
              <Users className="h-4 w-4" />
              Manage groups
            </Button>
          )}

          <Button variant="outline" className={canManageGroups ? undefined : 'ml-auto'} onClick={() => setActivityLogOpen(true)}>
            <History className="h-4 w-4" />
            Activity log
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-1 py-12 text-center">
              <p className="text-sm text-gray-500">No one matches these filters.</p>
              {isFiltering && <p className="text-xs text-gray-400">Try clearing the filters above.</p>}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const lockReason = lockReasonFor(user)
              const isSelf = user.id === viewerId

              return (
                <UserCard
                  key={user.id}
                  user={user}
                  isSelf={isSelf}
                  canEdit={canChangeRole || canSetCapacity || canManageGroups}
                  canSuspend={canSuspend && !isSelf}
                  canRemove={canRemove && !isSelf}
                  demotionBlockedReason={lockReason}
                  onEdit={setEditingUser}
                  onSuspend={handleSuspend}
                  onReactivate={handleReactivate}
                  onRemove={handleRemove}
                  onResendInvite={handleResendInvite}
                  onRevokeInvite={handleRevokeInvite}
                />
              )
            })
          )}
        </div>
      </div>

      {isInviteOpen && inviteDesignVersion === 'v2' && (
        <InviteUserDialogV2
          seatsRemaining={seatsRemaining}
          totalSeats={seats.total}
          assignableRoles={assignableRoles}
          existingEmails={users.map((user) => user.email)}
          knownAccountEmails={knownPlatformAccountEmails}
          groupOptions={groupOptions}
          onClose={() => setInviteOpen(false)}
          onInvite={handleInvite}
        />
      )}
      {isInviteOpen && inviteDesignVersion === 'v1' && (
        <InviteUserDialog
          seatsRemaining={seatsRemaining}
          assignableRoles={assignableRoles}
          existingEmails={users.map((user) => user.email)}
          knownAccountEmails={knownPlatformAccountEmails}
          groupOptions={groupOptions}
          onClose={() => setInviteOpen(false)}
          onInvite={handleInvite}
        />
      )}

      {isSeatsOpen && seatsDesignVersion === 'v2' && (
        <RequestSeatsDialogV2 seats={seats} onClose={() => setSeatsOpen(false)} onRequest={handleRequestSeats} />
      )}
      {isSeatsOpen && seatsDesignVersion === 'v1' && (
        <RequestSeatsDialog seats={seats} onClose={() => setSeatsOpen(false)} onRequest={handleRequestSeats} />
      )}

      {editingUser && editDesignVersion === 'v2' && (
        <EditUserDialogV2
          user={editingUser}
          canChangeRole={canChangeRole}
          canSetCapacity={canSetCapacity}
          canManageGroups={canManageGroups}
          roleLockedReason={lockReasonFor(editingUser)}
          assignableRoles={assignableRoles}
          groupOptions={groupOptions}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveAccess}
        />
      )}
      {editingUser && editDesignVersion === 'v1' && (
        <EditUserDialog
          user={editingUser}
          canSetCapacity={canSetCapacity}
          canManageGroups={canManageGroups}
          groupOptions={groupOptions}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveAccess}
        />
      )}

      <ActivityLogPanel open={isActivityLogOpen} onClose={() => setActivityLogOpen(false)} />
      {isManageGroupsOpen && <ManageGroupsDialog onClose={() => setManageGroupsOpen(false)} />}
    </div>
  )
}

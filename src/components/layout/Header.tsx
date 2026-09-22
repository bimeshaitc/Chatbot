import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Eye,
  Headset,
  LayoutTemplate,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Sparkles,
  User,
  UserCog,
  UserPlus,
} from 'lucide-react'
import { NotificationsPanel, systemActivityEntries } from '@/features/activity-log'
import { AskKnowledgePanel } from '@/features/knowledge-base'
import { useUIStore } from '@/stores/useUIStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChannels, useTicketAccess, useViewer, useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { useDesignVersion, useDesignVersionStore, type DesignVersion } from '@/stores/useDesignVersionStore'
import { useAppVersionStore, type AppVersion } from '@/stores/useAppVersionStore'
import { ROLE_DESCRIPTIONS, WORKSPACE_ROLES, type TicketAccessLevel, type WorkChannel } from '@/config/roles'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
}

type UserStatus = 'online' | 'away' | 'busy' | 'offline'

const STATUS_OPTIONS: { value: UserStatus; label: string; description: string; dot: string; iconBg: string }[] = [
  { value: 'online', label: 'Online', description: 'Available for chats', dot: 'bg-emerald-500', iconBg: 'bg-emerald-50' },
  { value: 'away', label: 'Away', description: 'Temporarily unavailable', dot: 'bg-amber-500', iconBg: 'bg-amber-50' },
  { value: 'busy', label: 'Busy', description: 'Do not disturb', dot: 'bg-rose-500', iconBg: 'bg-rose-50' },
  { value: 'offline', label: 'Offline', description: 'Unavailable', dot: 'bg-gray-400', iconBg: 'bg-gray-100' },
]

/** Which queue(s) a CSR works — meaningless for every other role, so the
 * switcher that offers these only ever renders while previewing as CSR. */
const CHANNEL_OPTIONS: { value: WorkChannel[]; label: string; description: string }[] = [
  { value: ['chat', 'tickets'], label: 'Chat + Tickets', description: 'Works both queues.' },
  { value: ['chat'], label: 'Chat only', description: 'No access to Tickets.' },
  { value: ['tickets'], label: 'Tickets only', description: 'No access to Chat.' },
]

function sameChannels(a: WorkChannel[], b: WorkChannel[]) {
  return a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index])
}

/** A second dial on the tickets channel: seeing the queue vs. working it.
 * Meaningless unless the channel switcher above already includes tickets, so
 * this switcher only ever renders alongside it. */
const TICKET_ACCESS_OPTIONS: { value: TicketAccessLevel; label: string; description: string; icon: typeof Eye }[] = [
  { value: 'edit', label: 'Can edit', description: 'Create, reply to and set the status of tickets.', icon: Pencil },
  { value: 'view', label: 'View only', description: 'Sees the queue, cannot reply, create or change status.', icon: Eye },
]

/**
 * The global product version — separate from any page's own V1/V2 *layout*
 * dropdown. V1 is the original feature set; V2 adds Shifts, Business Plan
 * and Integration back into the sidebar (each of which may then offer its
 * own layout dropdown once you're on the page).
 */
const APP_VERSION_OPTIONS: { value: AppVersion; label: string; description: string }[] = [
  { value: 'v1', label: 'V1', description: 'Original feature set.' },
  { value: 'v2', label: 'V2', description: 'Adds Shifts, Business Plan and Integration.' },
]

interface DialogVersionSwitcherProps {
  storeKey: string
  label: string
  icon: typeof Mail
}

/**
 * The header's "V1/V2" switch, but for a dialog rather than a whole route —
 * User Management's Invite and Request Seats flows each have a redesigned
 * version with nothing to navigate to, so this reads from
 * `useDesignVersionStore` instead of `DESIGN_VERSION_PAIRS`. Same look, same
 * "prototype only" framing, so switching feels like one feature rather than
 * two different mechanisms.
 */
function DialogVersionSwitcher({ storeKey, label, icon: Icon }: DialogVersionSwitcherProps) {
  const [isOpen, setOpen] = useState(false)
  const version = useDesignVersion(storeKey)
  const setVersion = useDesignVersionStore((state) => state.setVersion)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={`Prototype control: switch between the v1 and v2 design of ${label}`}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 sm:px-3"
      >
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        <span className="hidden sm:inline">
          {label}: {version === 'v2' ? 'V2' : 'V1'}
        </span>
        <span className="sm:hidden">{version === 'v2' ? 'V2' : 'V1'}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {isOpen && (
        <>
          <button type="button" aria-label={`Close ${label} design menu`} onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
            <p className="px-2 pt-1 text-sm font-semibold text-gray-900">{label} design</p>
            <p className="px-2 pb-2 text-xs text-gray-500">Prototype only. Switches which layout opens next.</p>
            {(
              [
                { key: 'v1' as DesignVersion, label: 'V1', description: 'Original layout.' },
                { key: 'v2' as DesignVersion, label: 'V2', description: 'Redesigned layout.' },
              ]
            ).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setVersion(storeKey, option.key)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full flex-col gap-0.5 rounded-xl px-2 py-2 text-left hover:bg-gray-50',
                  version === option.key && 'bg-emerald-50/60 hover:bg-emerald-50/60',
                )}
              >
                <span className="text-sm font-medium text-gray-900">{option.label}</span>
                <span className="text-xs text-gray-500">{option.description}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Every page that ships both a v1 and a v2 design, keyed by whichever path is currently active. */
const DESIGN_VERSION_PAIRS: Record<string, { v1: string; v2: string }> = {
  '/shifts': { v1: '/shifts', v2: '/shifts-v2' },
  '/shifts-v2': { v1: '/shifts', v2: '/shifts-v2' },
  '/bot-setting': { v1: '/bot-setting', v2: '/bot-setting-v2' },
  '/bot-setting-v2': { v1: '/bot-setting', v2: '/bot-setting-v2' },
  '/integration': { v1: '/integration', v2: '/integration-v2' },
  '/integration-v2': { v1: '/integration', v2: '/integration-v2' },
  '/business-plan': { v1: '/business-plan', v2: '/business-plan-v2' },
  '/business-plan-v2': { v1: '/business-plan', v2: '/business-plan-v2' },
}

export function Header({ title }: HeaderProps) {
  const [isNotificationsOpen, setNotificationsOpen] = useState(false)
  const [isStatusOpen, setStatusOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  const [isAppVersionOpen, setAppVersionOpen] = useState(false)
  const [isRoleOpen, setRoleOpen] = useState(false)
  const [isDesignOpen, setDesignOpen] = useState(false)
  const [isChannelOpen, setChannelOpen] = useState(false)
  const [isTicketAccessOpen, setTicketAccessOpen] = useState(false)
  const [isAskOpen, setAskOpen] = useState(false)
  const [status, setStatus] = useState<UserStatus>('online')
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const appVersion = useAppVersionStore((state) => state.version)
  const setAppVersion = useAppVersionStore((state) => state.setVersion)
  const workspaceRole = useWorkspaceRoleStore((state) => state.role)
  const viewer = useViewer()
  const setWorkspaceRole = useWorkspaceRoleStore((state) => state.setRole)
  const csrChannels = useChannels()
  const setCsrChannels = useWorkspaceRoleStore((state) => state.setCsrChannels)
  const csrTicketAccess = useTicketAccess()
  const setCsrTicketAccess = useWorkspaceRoleStore((state) => state.setCsrTicketAccess)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const designPair = DESIGN_VERSION_PAIRS[location.pathname]
  const activeDesignVersion = designPair ? (location.pathname === designPair.v2 ? 'v2' : 'v1') : null
  const unreadCount = systemActivityEntries.filter((entry) => !entry.read).length
  const currentStatus = STATUS_OPTIONS.find((option) => option.value === status)!
  const displayName = user?.username ?? 'Guest'
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    setProfileOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 lg:hidden"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setAppVersionOpen((prev) => !prev)}
            title="Prototype control: switch the app's global feature set"
            className="flex items-center gap-1.5 rounded-full border border-dashed border-[#1B5E20]/40 px-2 py-1.5 text-xs font-medium text-[#1B5E20] hover:bg-[#1B5E20]/5 sm:px-3"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">App Version: {appVersion === 'v2' ? 'V2' : 'V1'}</span>
            <span className="sm:hidden">{appVersion === 'v2' ? 'V2' : 'V1'}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {isAppVersionOpen && (
            <>
              <button
                type="button"
                aria-label="Close app version menu"
                onClick={() => setAppVersionOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute left-0 z-50 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-2 pt-1 text-sm font-semibold text-gray-900">App version</p>
                <p className="px-2 pb-2 text-xs text-gray-500">
                  Prototype only. V1 is the original feature set — V2 adds Shifts, Business Plan and Integration.
                </p>
                {APP_VERSION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setAppVersion(option.value)
                      setAppVersionOpen(false)
                    }}
                    className={cn(
                      'flex w-full flex-col gap-0.5 rounded-xl px-2 py-2 text-left hover:bg-gray-50',
                      appVersion === option.value && 'bg-emerald-50/60 hover:bg-emerald-50/60',
                    )}
                  >
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleOpen((prev) => !prev)}
            title="Prototype control: view the app as a different role"
            className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 sm:px-3"
          >
            <UserCog className="h-3.5 w-3.5 text-gray-400" />
            <span className="hidden sm:inline">Viewing as {workspaceRole}</span>
            <span className="sm:hidden">{workspaceRole}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {isRoleOpen && (
            <>
              <button type="button" aria-label="Close role menu" onClick={() => setRoleOpen(false)} className="fixed inset-0 z-40" />
              <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-2 pt-1 text-sm font-semibold text-gray-900">View as role</p>
                <p className="px-2 pb-2 text-xs text-gray-500">
                  Prototype only. Changes which actions the app offers you.
                </p>
                {WORKSPACE_ROLES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setWorkspaceRole(option)
                      setRoleOpen(false)
                    }}
                    className={cn(
                      'flex w-full flex-col gap-0.5 rounded-xl px-2 py-2 text-left hover:bg-gray-50',
                      workspaceRole === option && 'bg-emerald-50/60 hover:bg-emerald-50/60',
                    )}
                  >
                    <span className="text-sm font-medium text-gray-900">{option}</span>
                    <span className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[option]}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {designPair && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDesignOpen((prev) => !prev)}
              title="Prototype control: switch between the v1 and v2 design of this page"
              className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 sm:px-3"
            >
              <LayoutTemplate className="h-3.5 w-3.5 text-gray-400" />
              <span className="hidden sm:inline">
                Viewing as {activeDesignVersion === 'v2' ? 'V2' : 'V1'}
              </span>
              <span className="sm:hidden">{activeDesignVersion === 'v2' ? 'V2' : 'V1'}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {isDesignOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close design menu"
                  onClick={() => setDesignOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-2 pt-1 text-sm font-semibold text-gray-900">Page design</p>
                  <p className="px-2 pb-2 text-xs text-gray-500">Prototype only. Switches between the two layouts for this page.</p>
                  {(
                    [
                      { key: 'v1' as const, path: designPair.v1, label: 'V1', description: 'Original layout.' },
                      { key: 'v2' as const, path: designPair.v2, label: 'V2', description: 'Redesigned layout.' },
                    ]
                  ).map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        navigate(option.path)
                        setDesignOpen(false)
                      }}
                      className={cn(
                        'flex w-full flex-col gap-0.5 rounded-xl px-2 py-2 text-left hover:bg-gray-50',
                        activeDesignVersion === option.key && 'bg-emerald-50/60 hover:bg-emerald-50/60',
                      )}
                    >
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {workspaceRole === 'CSR' && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setChannelOpen((prev) => !prev)}
              title="Prototype control: restrict which queue this CSR works"
              className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 sm:px-3"
            >
              <Headset className="h-3.5 w-3.5 text-gray-400" />
              <span className="hidden sm:inline">
                Channels: {CHANNEL_OPTIONS.find((option) => sameChannels(option.value, csrChannels))?.label ?? 'Custom'}
              </span>
              <span className="sm:hidden">Channels</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {isChannelOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close channel menu"
                  onClick={() => setChannelOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-2 pt-1 text-sm font-semibold text-gray-900">CSR channel</p>
                  <p className="px-2 pb-2 text-xs text-gray-500">
                    Prototype only. Restricts which channel this CSR can work in.
                  </p>
                  {CHANNEL_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        setCsrChannels(option.value)
                        setChannelOpen(false)
                      }}
                      className={cn(
                        'flex w-full flex-col gap-0.5 rounded-xl px-2 py-2 text-left hover:bg-gray-50',
                        sameChannels(option.value, csrChannels) && 'bg-emerald-50/60 hover:bg-emerald-50/60',
                      )}
                    >
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {workspaceRole === 'CSR' && csrChannels.includes('tickets') && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setTicketAccessOpen((prev) => !prev)}
              title="Prototype control: restrict whether this CSR may edit tickets or only view them"
              className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 sm:px-3"
            >
              {csrTicketAccess === 'view' ? (
                <Eye className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <Pencil className="h-3.5 w-3.5 text-gray-400" />
              )}
              <span className="hidden sm:inline">
                Tickets: {TICKET_ACCESS_OPTIONS.find((option) => option.value === csrTicketAccess)?.label}
              </span>
              <span className="sm:hidden">Tickets</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {isTicketAccessOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close ticket access menu"
                  onClick={() => setTicketAccessOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-2 pt-1 text-sm font-semibold text-gray-900">Ticket permission</p>
                  <p className="px-2 pb-2 text-xs text-gray-500">
                    Prototype only. Whether this CSR may work the tickets queue or only see it.
                  </p>
                  {TICKET_ACCESS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setCsrTicketAccess(option.value)
                        setTicketAccessOpen(false)
                      }}
                      className={cn(
                        'flex w-full flex-col gap-0.5 rounded-xl px-2 py-2 text-left hover:bg-gray-50',
                        option.value === csrTicketAccess && 'bg-emerald-50/60 hover:bg-emerald-50/60',
                      )}
                    >
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {location.pathname === '/user-management' && (
          <>
            <DialogVersionSwitcher storeKey="user-management-invite" label="Invite" icon={UserPlus} />
            {/* Seats/billing isn't a real feature yet — no point switching a
                dialog's design when V1 hides the button that opens it. */}
            {appVersion === 'v2' && (
              <DialogVersionSwitcher storeKey="user-management-seats" label="Seats" icon={Mail} />
            )}
            <DialogVersionSwitcher storeKey="user-management-edit" label="Edit" icon={UserCog} />
          </>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 sm:px-3"
          >
            <span className={cn('h-2 w-2 rounded-full', currentStatus.dot)} />
            <span className="hidden sm:inline">{currentStatus.label}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {isStatusOpen && (
            <>
              <button type="button" aria-label="Close status menu" onClick={() => setStatusOpen(false)} className="fixed inset-0 z-40" />
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-2 pt-1 pb-2 text-sm font-semibold text-gray-900">Set your status</p>
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setStatus(option.value)
                      setStatusOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-gray-50',
                      status === option.value && 'bg-emerald-50/60 hover:bg-emerald-50/60',
                    )}
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', option.iconBg)}>
                      <span className={cn('h-2 w-2 rounded-full', option.dot)} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                      <span className="block truncate text-xs text-gray-500">{option.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setAskOpen((prev) => !prev)}
            aria-label="Ask the knowledge base"
            title="Ask the knowledge base"
            className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
          {isAskOpen && <AskKnowledgePanel viewerGroups={viewer.groups} onClose={() => setAskOpen(false)} />}
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50"
          aria-label="Help"
        >
          <CircleHelp className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && <NotificationsPanel onClose={() => setNotificationsOpen(false)} />}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-label="Open account menu"
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-violet-200 text-xs font-semibold text-violet-700"
          >
            {initial}
            <span className={cn('absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border-2 border-white', currentStatus.dot)} />
          </button>
          {isProfileOpen && (
            <>
              <button type="button" aria-label="Close account menu" onClick={() => setProfileOpen(false)} className="fixed inset-0 z-40" />
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <div className="flex items-center gap-2.5 px-2 pt-1 pb-2">
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-200 text-sm font-semibold text-violet-700">
                    {initial}
                    <span className={cn('absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border-2 border-white', currentStatus.dot)} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-gray-900">{displayName}</span>
                      {user?.role && <span className="shrink-0 text-xs font-medium text-emerald-600">{user.role}</span>}
                    </span>
                    {user?.email && <span className="block truncate text-xs text-gray-500">{user.email}</span>}
                  </span>
                </div>
                <div className="my-1 h-px bg-gray-100" />
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

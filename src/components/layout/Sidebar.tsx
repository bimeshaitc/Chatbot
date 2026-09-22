import { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronsLeft, MessageSquare } from 'lucide-react'
import { channelCanAny, type Permission, type WorkChannel, type WorkspaceRole } from '@/config/roles'
import { useNewAssignmentCount } from '@/features/chat'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/useUIStore'
import { useChannels, useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { useAppVersionStore, type AppVersion } from '@/stores/useAppVersionStore'
import { navItems, type NavChild, type NavItem } from './utils/navigation'

function isVisible(
  role: WorkspaceRole,
  channels: WorkChannel[],
  appVersion: AppVersion,
  entry: { permission?: Permission | Permission[]; v2Only?: boolean },
) {
  if (entry.v2Only && appVersion !== 'v2') return false
  if (!entry.permission) return true
  return channelCanAny(role, channels, Array.isArray(entry.permission) ? entry.permission : [entry.permission])
}

interface VisibleNavItem extends NavItem {
  children?: NavChild[]
  /**
   * A live count rather than static data, so it can only ever come from a
   * function — layered on at render time, not hardcoded in `navItems`.
   */
  badgeCount?: number
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const location = useLocation()
  const isMobileOpen = useUIStore((state) => state.isSidebarOpen)
  const setMobileOpen = useUIStore((state) => state.setSidebarOpen)
  const newAssignmentCount = useNewAssignmentCount()
  const role = useWorkspaceRoleStore((state) => state.role)
  const channels = useChannels()
  const appVersion = useAppVersionStore((state) => state.version)

  // Filter to what this role (and, for a CSR, channel) may see, and — a
  // separate axis — whether the global app version even ships this feature
  // yet. Same list `navigation.ts` lets the router gate, so the rail never
  // advertises a page the URL would refuse. A group whose children are all
  // filtered out is dropped entirely rather than shown as an empty
  // disclosure triangle.
  const items = useMemo<VisibleNavItem[]>(() => {
    return navItems
      .filter((item) => isVisible(role, channels, appVersion, item))
      .map((item): VisibleNavItem => {
        if (item.children) {
          return { ...item, children: item.children.filter((child) => isVisible(role, channels, appVersion, child)) }
        }
        return item.label === 'Chat' ? { ...item, badgeCount: newAssignmentCount } : item
      })
      .filter((item) => !item.children || item.children.length > 0)
  }, [role, channels, appVersion, newAssignmentCount])

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 -translate-x-full flex-col border-r border-gray-100 bg-white transition-transform duration-200 lg:static lg:translate-x-0 lg:transition-[width]',
          isMobileOpen && 'translate-x-0',
          !collapsed ? 'lg:w-64' : 'lg:w-16',
        )}
      >
        <div className={cn('flex items-center gap-2 px-4 py-3', collapsed && 'lg:justify-center lg:px-2')}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white">
            <MessageSquare className="h-4 w-4" />
          </span>
          <span className={cn('flex-1 truncate text-sm font-semibold text-gray-900', collapsed && 'lg:hidden')}>
            Mercury Chatbot
          </span>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-600',
              collapsed && 'lg:hidden',
            )}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {items.map((item) => {
            const Icon = item.icon

            if (item.children) {
              const isGroupActive = item.children.some((child) => location.pathname === child.to)
              const isOpen = openGroups[item.label] ?? isGroupActive

              return (
                <div key={item.label} className="transition-colors duration-200">
                  <button
                    type="button"
                    title={collapsed ? item.label : undefined}
                    onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !isOpen }))}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm leading-[140%] font-medium transition-colors duration-200 active:scale-[0.98]',
                      collapsed && 'lg:justify-center lg:px-0',
                      isGroupActive && !collapsed ? 'bg-sidebar-accent text-[#1B5E20]' : 'text-shade-3 hover:bg-gray-50',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className={cn('flex-1 text-left', collapsed && 'lg:hidden')}>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200 ease-in-out',
                        isOpen && 'rotate-180',
                        collapsed && 'lg:hidden',
                      )}
                    />
                  </button>

                  {!collapsed && (
                    <div
                      className={cn(
                        'grid transition-[grid-template-rows,opacity] duration-200 ease-in-out',
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-1 flex flex-col gap-1 pl-6.5">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              end
                              tabIndex={isOpen ? undefined : -1}
                              onClick={() => setMobileOpen(false)}
                              className={({ isActive }) =>
                                cn(
                                  'rounded-lg border-l-2 px-3 py-1.5 text-sm leading-[140%] font-medium transition-colors duration-200 active:scale-[0.98]',
                                  isActive
                                    ? 'border-[#1B5E20] bg-white text-[#1B5E20] shadow-sm'
                                    : 'border-transparent text-shade-3 hover:text-gray-900',
                                )
                              }
                            >
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            const hasBadge = Boolean(item.badgeCount)

            const content = (
              <>
                <span className="relative shrink-0">
                  <Icon className="h-4 w-4" />
                  {/* Collapsed to icon-only: the number would not fit, so a
                      plain dot carries "something is waiting" on its own. */}
                  {hasBadge && collapsed && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white lg:block" />
                  )}
                </span>
                <span className={cn('flex-1 text-left', collapsed && 'lg:hidden')}>{item.label}</span>
                {hasBadge && (
                  <span
                    className={cn(
                      'flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-medium text-white',
                      collapsed && 'lg:hidden',
                    )}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </>
            )

            return (
              <NavLink
                key={item.label}
                to={item.to!}
                end={item.to === '/'}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm leading-[140%] font-medium transition-colors duration-200 active:scale-[0.98]',
                    collapsed && 'lg:justify-center lg:px-0',
                    isActive ? 'bg-sidebar-accent text-[#1B5E20]' : 'text-shade-3 hover:bg-gray-50',
                  )
                }
              >
                {content}
              </NavLink>
            )
          })}
        </nav>

        {collapsed && (
          <div className="hidden justify-center border-t border-gray-100 px-2 py-3 lg:flex">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <ChevronsLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

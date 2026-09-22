import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequirePermission } from '@/components/RequirePermission'
import { RequireAppVersion } from '@/components/RequireAppVersion'
import type { Permission } from '@/config/roles'

const DashboardPage = lazy(() => import('@/routes/DashboardPage'))
const KnowledgeBasePage = lazy(() => import('@/routes/KnowledgeBasePage'))
const BotTrainingPage = lazy(() => import('@/routes/BotTrainingPage'))
const TicketsPage = lazy(() => import('@/routes/TicketsPage'))
const ChatPage = lazy(() => import('@/routes/ChatPage'))
const UserManagementPage = lazy(() => import('@/routes/UserManagementPage'))
const CategoryPage = lazy(() => import('@/routes/CategoryPage'))
const CampaignsPage = lazy(() => import('@/routes/CampaignsPage'))
const ReportsPage = lazy(() => import('@/routes/ReportsPage'))
const ActivitiesLogPage = lazy(() => import('@/routes/ActivitiesLogPage'))
const BotSettingPage = lazy(() => import('@/routes/BotSettingPage'))
const IntegrationPage = lazy(() => import('@/routes/IntegrationPage'))
const TagsPage = lazy(() => import('@/routes/TagsPage'))
const CannedResponsesPage = lazy(() => import('@/routes/CannedResponsesPage'))
const VisitorsPage = lazy(() => import('@/routes/VisitorsPage'))
const ShiftsPage = lazy(() => import('@/routes/ShiftsPage'))
const ShiftsPageV2 = lazy(() => import('@/routes/ShiftsPageV2'))
const BotSettingPageV2 = lazy(() => import('@/routes/BotSettingPageV2'))
const BusinessPlanPage = lazy(() => import('@/routes/BusinessPlanPage'))
const BusinessPlanPageV2 = lazy(() => import('@/routes/BusinessPlanPageV2'))
const IntegrationPageV2 = lazy(() => import('@/routes/IntegrationPageV2'))
const NotFoundPage = lazy(() => import('@/routes/NotFoundPage'))
const LoginPage = lazy(() => import('@/routes/LoginPage'))

/**
 * Gates the same list the sidebar filters on (`components/layout/utils/navigation.ts`),
 * so a role that cannot see a link cannot reach it by URL either — closes the
 * hole a hidden-but-still-served route would leave open.
 *
 * `v2Only` mirrors `NavItem.v2Only`: Shifts, Business Plan and Integration
 * (both their v1 and v2 *layouts*) exist only when the global app version is
 * V2 — otherwise the URL would still serve a feature the sidebar just hid.
 */
function gated(
  permission: Permission | Permission[] | undefined,
  element: React.ReactNode,
  options?: { v2Only?: boolean },
) {
  let content = permission ? <RequirePermission permission={permission}>{element}</RequirePermission> : element
  if (options?.v2Only) content = <RequireAppVersion minVersion="v2">{content}</RequireAppVersion>
  return <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading...</div>}>{content}</Suspense>
}

const CHAT_VIEW: Permission[] = ['chats.view.own', 'chats.view.team', 'chats.view.all', 'bot.queue.view']
const TICKETS_VIEW: Permission[] = ['tickets.view.own', 'tickets.view.team', 'tickets.view.all']
const REPORTS_VIEW: Permission[] = ['reports.view.own', 'reports.view.team', 'reports.view.all']

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading...</div>}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Ungated: every role needs a landing page.
      { index: true, element: gated(undefined, <DashboardPage />) },
      // Chat is four inboxes over one screen. Category and agent used to be
      // path segments too, which needed nine routes to express two filters;
      // they are search params now, so the shape is inbox + optional chat.
      { path: 'chat', element: gated(CHAT_VIEW, <ChatPage />) },
      { path: 'chat/:inbox', element: gated(CHAT_VIEW, <ChatPage />) },
      { path: 'chat/:inbox/:conversationId', element: gated(CHAT_VIEW, <ChatPage />) },
      { path: 'tickets', element: gated(TICKETS_VIEW, <TicketsPage />) },
      { path: 'shifts', element: gated('shifts.view', <ShiftsPage />, { v2Only: true }) },
      { path: 'shifts-v2', element: gated('shifts.view', <ShiftsPageV2 />, { v2Only: true }) },
      { path: 'bot-setting-v2', element: gated('bot.settings.view', <BotSettingPageV2 />) },
      { path: 'business-plan', element: gated(undefined, <BusinessPlanPage />, { v2Only: true }) },
      { path: 'business-plan-v2', element: gated(undefined, <BusinessPlanPageV2 />, { v2Only: true }) },
      { path: 'knowledge-base', element: gated('knowledge.internal.view', <KnowledgeBasePage />) },
      { path: 'bot-training', element: gated('knowledge.bot.view', <BotTrainingPage />) },
      { path: 'user-management', element: gated('people.view', <UserManagementPage />) },
      { path: 'category', element: gated('workspace.categories.manage', <CategoryPage />) },
      { path: 'tags', element: gated('workspace.tags.manage', <TagsPage />) },
      { path: 'canned-responses', element: gated('chats.cannedResponses.manage', <CannedResponsesPage />) },
      { path: 'visitors', element: gated('workspace.visitors.view', <VisitorsPage />) },
      { path: 'campaigns', element: gated('workspace.campaigns.manage', <CampaignsPage />) },
      { path: 'reports', element: gated(REPORTS_VIEW, <ReportsPage />) },
      { path: 'activities-log', element: gated('workspace.activityLog.view', <ActivitiesLogPage />) },
      { path: 'bot-setting', element: gated('bot.settings.view', <BotSettingPage />) },
      { path: 'integration', element: gated('workspace.integrations.manage', <IntegrationPage />, { v2Only: true }) },
      { path: 'integration-v2', element: gated('workspace.integrations.manage', <IntegrationPageV2 />, { v2Only: true }) },
      { path: '*', element: gated(undefined, <NotFoundPage />) },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

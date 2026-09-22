import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useViewer, usePermission } from '@/stores/useWorkspaceRoleStore'
import { useShifts } from '../hooks/useShifts'
import { useShiftRequests } from '../hooks/useShiftRequests'
import { useHandovers } from '../hooks/useHandovers'
import { RotaGrid } from './RotaGrid'
import { RequestsList } from './RequestsList'
import { HandoversLog } from './HandoversLog'

/**
 * "Their own shifts, and their groups" (the `shifts.view` catalog text) — no
 * `ScopedResource` entry exists for shifts, so the filter is hand-rolled here
 * rather than reusing `useScope`, which only covers chats/tickets/reports.
 */
export function ShiftsPage() {
  const [tab, setTab] = useState('rota')
  const viewer = useViewer()
  const canManage = usePermission('shifts.manage')
  const { shifts } = useShifts()
  const { requests } = useShiftRequests()
  const { handovers } = useHandovers()

  const visibleShifts = canManage
    ? shifts
    : shifts.filter((shift) => shift.agentId === viewer.agentId || shift.groups.some((g) => viewer.groups.includes(g)))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <PageHeader title="Shifts" description="The CSR rota — who's on, handovers, and time-off requests." />
        <p className="text-xs text-gray-400">All times shown in workspace time.</p>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as string)}>
        <TabsList variant="line">
          <TabsTrigger value="rota">Rota</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {requests.some((r) => r.status === 'pending') && (
              <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="handovers">Handovers</TabsTrigger>
        </TabsList>

        <TabsContent value="rota">
          <RotaGrid shifts={visibleShifts} canManage={canManage} />
        </TabsContent>
        <TabsContent value="requests">
          <RequestsList requests={requests} shifts={shifts} />
        </TabsContent>
        <TabsContent value="handovers">
          <HandoversLog handovers={handovers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

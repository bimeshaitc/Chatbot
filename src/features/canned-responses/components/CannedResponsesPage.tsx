import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/PageHeader'
import { useViewer, usePermission } from '@/stores/useWorkspaceRoleStore'
import { useGroupsStore, useReportGroupUsage } from '@/stores/useGroupsStore'
import { useCannedResponses } from '../hooks/useCannedResponses'
import { canManageResponse, listableCannedResponse } from '../utils/visibility'
import type { CannedResponseConfig, NewCannedResponseInput } from '../types'
import { CannedResponseTable } from './CannedResponseTable'
import { AddCannedResponseDialog } from './AddCannedResponseDialog'

export function CannedResponsesPage() {
  const viewer = useViewer()
  // Route/nav already require this to reach the page at all — re-checked here
  // so a response's manageability is never "true just because you're on this
  // screen" and stays correct if the route gate ever loosens.
  const canManageAny = usePermission('chats.cannedResponses.manage')
  const { responses, addResponse, updateResponse, deleteResponse } = useCannedResponses()
  const [search, setSearch] = useState('')
  const [dialogState, setDialogState] = useState<{ open: boolean; response: CannedResponseConfig | null }>({
    open: false,
    response: null,
  })

  // "Private is visible only to its creator" applies here too, not just the
  // composer's insert menu — someone else's private note never reaches this list.
  const listableResponses = useMemo(() => responses.filter((response) => listableCannedResponse(response, viewer)), [responses, viewer])

  // A CSR may only assign a Shared response to a group they belong to; a CSR
  // Admin/Admin/Owner's own `groups` already covers every group in their
  // scope (all four for Admin/Owner), so this one filter serves everyone.
  const allGroupOptions = useGroupsStore((state) => state.groups)
  const groupOptions = useMemo(
    () => allGroupOptions.filter((group) => viewer.groups.includes(group)),
    [allGroupOptions, viewer.groups],
  )
  const groupUsage = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const response of responses) {
      for (const group of response.groups) counts[group] = (counts[group] ?? 0) + 1
    }
    return counts
  }, [responses])
  useReportGroupUsage('canned-responses', groupUsage)

  const filteredResponses = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return listableResponses
    return listableResponses.filter(
      (response) =>
        response.title.toLowerCase().includes(query) ||
        response.shortcut.toLowerCase().includes(query) ||
        response.body.toLowerCase().includes(query),
    )
  }, [listableResponses, search])

  function canManage(response: CannedResponseConfig) {
    return canManageResponse(response, viewer, canManageAny)
  }

  function handleSave(input: NewCannedResponseInput) {
    if (dialogState.response) {
      if (!canManage(dialogState.response)) return
      updateResponse(dialogState.response.id, input)
      toast.success(`Updated "${input.title}"`)
    } else {
      addResponse(input, { id: viewer.agentId, name: viewer.name })
      toast.success(`Added "${input.title}"`)
    }
  }

  function handleDelete(id: string) {
    const response = responses.find((entry) => entry.id === id)
    if (!response || !canManage(response)) return
    if (!window.confirm(`Delete "${response.title}"? Agents using its shortcut will no longer find it.`)) return
    deleteResponse(id)
    toast.success(`Deleted "${response.title}"`)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl">
      <PageHeader
        title="Canned Responses"
        description="Quick replies agents send from the chat composer — shared with a team, or kept private to their own account."
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, shortcut or text"
              className="pl-9"
            />
          </div>

          <Button
            onClick={() => setDialogState({ open: true, response: null })}
            className="bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90"
          >
            + Add New Response
          </Button>
        </div>

        <div className="mt-5">
          <CannedResponseTable
            responses={filteredResponses}
            canManage={canManage}
            onEdit={(response) => canManage(response) && setDialogState({ open: true, response })}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {dialogState.open && (
        <AddCannedResponseDialog
          response={dialogState.response}
          groupOptions={groupOptions}
          onClose={() => setDialogState({ open: false, response: null })}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

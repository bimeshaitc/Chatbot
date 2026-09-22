import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGroupsStore } from '@/stores/useGroupsStore'

interface ManageGroupsDialogProps {
  onClose: () => void
}

/**
 * Create and remove entries in the shared group vocabulary — the same list
 * every invite/edit/canned-response/knowledge-base group picker reads from.
 * Removing a group is blocked while any feature still has a record tagged
 * with it (reported into `useGroupsStore` by each of those features).
 */
export function ManageGroupsDialog({ onClose }: ManageGroupsDialogProps) {
  const groups = useGroupsStore((state) => state.groups)
  const usageByFeature = useGroupsStore((state) => state.usageByFeature)
  const addGroup = useGroupsStore((state) => state.addGroup)
  const removeGroup = useGroupsStore((state) => state.removeGroup)

  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function usageFor(group: string) {
    return Object.values(usageByFeature).reduce((sum, counts) => sum + (counts[group] ?? 0), 0)
  }

  function handleAdd() {
    const result = addGroup(name)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setName('')
    setError(null)
  }

  function handleRemove(group: string) {
    const result = removeGroup(group)
    setError(result.ok ? null : result.error)
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Manage groups</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <p className="text-xs text-[#6E7678]">
            Groups route chats and tickets, gate the knowledge base and canned responses, and tag shift queues — one
            list, shared everywhere it's picked from.
          </p>

          <div className="flex items-start gap-2">
            <Input
              placeholder="New group name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd()
                }
              }}
            />
            <Button variant="outline" className="shrink-0" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex flex-col gap-1.5">
            {groups.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No groups yet.</p>
            ) : (
              groups.map((group) => {
                const count = usageFor(group)
                const inUse = count > 0
                return (
                  <div
                    key={group}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#F7F7F8] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{group}</p>
                      <p className="text-xs text-gray-400">
                        {inUse ? `In use by ${count} record${count === 1 ? '' : 's'}` : 'Not in use'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={inUse}
                      onClick={() => handleRemove(group)}
                      title={inUse ? 'Reassign every record using this group before removing it.' : 'Remove group'}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

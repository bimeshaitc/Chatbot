import { CircleSlash, MoreVertical, Play, RotateCw, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SourceActionsMenuProps {
  isEnabled: boolean
  /** `knowledge.bot.manage` — toggling and deleting a source. */
  canManage: boolean
  /** `knowledge.bot.retrain` — separate from `.manage` so a role could hold one without the other. */
  canRetrain: boolean
  onToggleEnabled: () => void
  onRetrain: () => void
  onDelete: () => void
}

export function SourceActionsMenu({
  isEnabled,
  canManage,
  canRetrain,
  onToggleEnabled,
  onRetrain,
  onDelete,
}: SourceActionsMenuProps) {
  if (!canManage && !canRetrain) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Row actions"
      >
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        {canRetrain && (
          <DropdownMenuItem onClick={onRetrain}>
            <RotateCw className="h-3.5 w-3.5" />
            Retrain now
          </DropdownMenuItem>
        )}
        {canManage && (
          <>
            <DropdownMenuItem onClick={onToggleEnabled}>
              {isEnabled ? <CircleSlash className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isEnabled ? 'Stop using for answers' : 'Use for answers'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete source
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

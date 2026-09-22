import { cn } from '@/lib/utils'
import type { HandlerDescriptor } from '../utils/handler'

interface HandlerChipProps {
  handler: HandlerDescriptor
  /** Trailing context: the matched intent for the AI, the group for an agent. */
  detail?: string
  className?: string
}

/**
 * "Who is answering this customer right now", in one chip.
 *
 * The list row and the chat header both render this, from the same descriptor,
 * so the two can never tell the agent different stories about the same chat.
 */
export function HandlerChip({ handler, detail, className }: HandlerChipProps) {
  const Icon = handler.icon

  return (
    <span
      className={cn(
        'inline-flex min-w-0 max-w-full items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
        handler.chipClass,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{handler.label}</span>
      {detail && <span className="truncate font-normal opacity-75">· {detail}</span>}
    </span>
  )
}

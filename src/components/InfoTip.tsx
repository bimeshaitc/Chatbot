import { useEffect, useId, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfoTipProps {
  /** What this metric or card actually measures, in one plain sentence. */
  label: string
  /** Where the bubble sits relative to the icon. Use "left" near the right edge of a card. */
  align?: 'left' | 'right'
  className?: string
}

/**
 * A small "i" affordance that explains what a number on the dashboard means.
 * Opens on hover and on focus, and stays open on click/tap so touch users can
 * read it too. The text is also exposed via aria-describedby, so screen readers
 * get the explanation without needing the visual bubble.
 */
export function InfoTip({ label, align = 'left', className }: InfoTipProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!pinned) return
    function handleAway(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setPinned(false)
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleAway)
    return () => document.removeEventListener('mousedown', handleAway)
  }, [pinned])

  return (
    <span ref={wrapperRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label={`What is this? ${label}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => {
          setPinned((prev) => !prev)
          setOpen((prev) => !prev || !pinned)
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => !pinned && setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => !pinned && setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setPinned(false)
            setOpen(false)
          }
        }}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'absolute top-6 z-20 w-56 rounded-lg border border-gray-100 bg-white p-2.5 text-xs leading-[1.5] font-normal text-gray-600 shadow-lg',
            align === 'left' ? 'right-0' : 'left-0',
          )}
        >
          {label}
        </span>
      )}
    </span>
  )
}

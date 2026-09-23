import { useEffect, useRef, useState } from 'react'
import { Globe } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn, generateId } from '@/lib/utils'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { createDefaultAuthor, scrapePagesFor } from '../data/mockBotTrainingData'
import { formatToday } from '../utils/formatDate'
import type { ScrapedPage, SourceUrl } from '../types'

type PageMode = 'single' | 'multiple'

const pageModeOptions: { value: PageMode; label: string }[] = [
  { value: 'single', label: 'Single page' },
  { value: 'multiple', label: 'Multiple pages (crawl site)' },
]

/** How long a page sits before the next one pops into the list — a live feed of what the crawler is finding, not a static list appearing all at once. */
const REVEAL_INTERVAL_MS = 260

type ScanState = 'idle' | 'scanning' | 'done'

interface AddUrlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** One page can become several sources — every selected page is added as its own trainable source. */
  onAdd: (entries: SourceUrl[]) => void
}

export function AddUrlDialog({ open, onOpenChange, onAdd }: AddUrlDialogProps) {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [pageMode, setPageMode] = useState<PageMode>('single')
  const [error, setError] = useState<string | null>(null)

  const [scanState, setScanState] = useState<ScanState>('idle')
  const [discovered, setDiscovered] = useState<ScrapedPage[]>([])
  const [visibleCount, setVisibleCount] = useState(0)
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())

  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  useEffect(() => {
    const inFlight = timers.current
    return () => inFlight.forEach(clearTimeout)
  }, [])

  // Reveals one more discovered page every tick, like messages landing in a
  // live chat, then settles into 'done' and defaults every page to selected —
  // "add all pages" is the common case, unchecking a few is the exception.
  function revealNext(pages: ScrapedPage[], index: number) {
    if (index >= pages.length) {
      setScanState('done')
      setSelectedPaths(new Set(pages.map((page) => page.path)))
      return
    }
    setVisibleCount(index + 1)
    const id = setTimeout(() => {
      timers.current.delete(id)
      revealNext(pages, index + 1)
    }, REVEAL_INTERVAL_MS)
    timers.current.add(id)
  }

  function resetScan() {
    timers.current.forEach(clearTimeout)
    timers.current.clear()
    setScanState('idle')
    setDiscovered([])
    setVisibleCount(0)
    setSelectedPaths(new Set())
  }

  function resetForm() {
    resetScan()
    setWebsiteUrl('')
    setSourceName('')
    setPageMode('single')
    setError(null)
  }

  function selectPageMode(mode: PageMode) {
    if (mode === pageMode) return
    setPageMode(mode)
    resetScan()
    setError(null)
  }

  function handleScan() {
    if (!websiteUrl.trim()) {
      setError('Website URL is required.')
      return
    }
    try {
      new URL(websiteUrl)
    } catch {
      setError('Enter a valid URL.')
      return
    }

    setError(null)
    const pages = scrapePagesFor()
    setDiscovered(pages)
    setVisibleCount(0)
    setSelectedPaths(new Set())
    setScanState('scanning')
    revealNext(pages, 0)
  }

  function toggleSelected(path: string) {
    setSelectedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedPaths((prev) => (prev.size === discovered.length ? new Set() : new Set(discovered.map((page) => page.path))))
  }

  function handleSubmit() {
    if (pageMode === 'single') {
      if (!websiteUrl.trim()) {
        setError('Website URL is required.')
        return
      }
      try {
        new URL(websiteUrl)
      } catch {
        setError('Enter a valid URL.')
        return
      }

      const entry: SourceUrl = {
        id: generateId(),
        label: sourceName.trim() || websiteUrl,
        url: websiteUrl,
        sizeLabel: 'Pending crawl',
        status: 'queued',
        audience: 'public',
        isEnabled: true,
        chunks: 0,
        answersServed: 0,
        lastTrainedOn: 'Never',
        pageMode: 'single',
        author: createDefaultAuthor(),
        addedOn: formatToday(),
      }
      onAdd([entry])
      resetForm()
      onOpenChange(false)
      return
    }

    if (scanState !== 'done') {
      handleScan()
      return
    }
    const selectedPages = discovered.filter((page) => selectedPaths.has(page.path))
    if (selectedPages.length === 0) {
      setError('Select at least one page to add.')
      return
    }

    const base = new URL(websiteUrl)
    const entries: SourceUrl[] = selectedPages.map((page) => {
      const pageUrl = new URL(page.path, base).toString()
      const label =
        page.path === '/'
          ? sourceName.trim() || page.title
          : sourceName.trim()
            ? `${sourceName.trim()} — ${page.title}`
            : page.title
      return {
        id: generateId(),
        label,
        url: pageUrl,
        sizeLabel: 'Pending crawl',
        status: 'queued',
        audience: 'public',
        isEnabled: true,
        chunks: 0,
        answersServed: 0,
        lastTrainedOn: 'Never',
        pageMode: 'multiple',
        author: createDefaultAuthor(),
        addedOn: formatToday(),
      }
    })

    onAdd(entries)
    resetForm()
    onOpenChange(false)
  }

  const allSelected = discovered.length > 0 && selectedPaths.size === discovered.length

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
    >
      <DialogContent size={scanState === 'idle' ? undefined : 'lg'}>
        <DialogHeader>
          <DialogTitle>Add training URL</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <fieldset disabled={scanState !== 'idle'} className="flex flex-col gap-4 disabled:opacity-60">
            <Input label="Website URL *" placeholder="Paste url here" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />

            <div className="flex flex-col gap-1">
              <Input label="Source Name" placeholder="Enter name here" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
              <span className="text-xs text-gray-400">
                {pageMode === 'single' ? 'If left empty, the URL is used as the name' : "If left empty, each page's own title is used"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">How many pages?</span>
              <div className="flex flex-wrap gap-1.5">
                {pageModeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectPageMode(option.value)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      pageMode === option.value
                        ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {pageMode === 'single' ? 'Just this one page is added.' : "We'll scan the site and let you pick which pages to add."}
              </p>
            </div>
          </fieldset>

          {pageMode === 'multiple' && scanState !== 'idle' && (
            <div className="mt-1 flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
              {scanState === 'scanning' ? (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/40" />
                    <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                      <Globe className="h-3 w-3 animate-spin text-blue-600" style={{ animationDuration: '2.5s' }} />
                    </span>
                  </span>
                  <p className="text-xs font-medium text-blue-700">
                    Scanning{' '}
                    <span className="text-gray-500">
                      {websiteUrl} · {visibleCount} of {discovered.length} pages found
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-gray-700">
                    {discovered.length} page{discovered.length === 1 ? '' : 's'} found —{' '}
                    <span className="text-gray-500">{selectedPaths.size} selected</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs font-medium text-[#1B5E20] underline underline-offset-2"
                    >
                      {allSelected ? 'Deselect all' : 'Select all'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanState('idle')}
                      className="text-xs font-medium text-gray-500 underline underline-offset-2"
                    >
                      Rescan
                    </button>
                  </div>
                </div>
              )}

              <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
                {discovered.slice(0, visibleCount).map((page) => (
                  <label
                    key={page.path}
                    className="flex animate-in items-start gap-2 rounded-lg border border-gray-200 bg-white p-2 text-left fade-in slide-in-from-bottom-1 duration-300"
                  >
                    {scanState === 'done' && (
                      <Checkbox
                        checked={selectedPaths.has(page.path)}
                        onCheckedChange={() => toggleSelected(page.path)}
                        aria-label={`Include ${page.title}`}
                        className="mt-0.5"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3 shrink-0 text-gray-400" />
                        <span className="truncate text-xs font-medium text-gray-800">{page.title}</span>
                        <span className="truncate text-[11px] text-gray-400">{page.path}</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] text-gray-500">{page.preview}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <DialogPrimaryButton onClick={handleSubmit} disabled={scanState === 'scanning'}>
            {pageMode === 'single' && 'Add URL'}
            {pageMode === 'multiple' && scanState === 'idle' && 'Scan site'}
            {pageMode === 'multiple' && scanState === 'scanning' && 'Scanning…'}
            {pageMode === 'multiple' && scanState === 'done' && `Add ${selectedPaths.size} page${selectedPaths.size === 1 ? '' : 's'}`}
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

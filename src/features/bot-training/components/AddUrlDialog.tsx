import { useEffect, useRef, useState } from 'react'
import { Globe } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn, generateId } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimaryButton,
  DialogTitle,
} from '@/components/ui/dialog'
import { createDefaultAuthor, crawlDepthOptions, maxPagesOptions, scrapePagesFor } from '../data/mockBotTrainingData'
import { formatToday } from '../utils/formatDate'
import type { ScrapedPage, SourceAudience, SourceUrl } from '../types'

const audienceOptions: { value: SourceAudience; label: string }[] = [
  { value: 'public', label: 'Anyone' },
  { value: 'signed-in', label: 'Signed-in customers' },
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
  const [crawlDepth, setCrawlDepth] = useState<string | null>(null)
  const [maxPages, setMaxPages] = useState<string | null>(null)
  const [audience, setAudience] = useState<SourceAudience>('public')
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

  function resetForm() {
    timers.current.forEach(clearTimeout)
    timers.current.clear()
    setWebsiteUrl('')
    setSourceName('')
    setCrawlDepth(null)
    setMaxPages(null)
    setAudience('public')
    setError(null)
    setScanState('idle')
    setDiscovered([])
    setVisibleCount(0)
    setSelectedPaths(new Set())
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
    if (!crawlDepth) {
      setError('Select a crawl depth.')
      return
    }
    if (!maxPages) {
      setError('Select a page limit.')
      return
    }

    setError(null)
    const pages = scrapePagesFor(crawlDepth, Number(maxPages))
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
    if (scanState !== 'done') {
      handleScan()
      return
    }
    const selectedPages = discovered.filter((page) => selectedPaths.has(page.path))
    if (selectedPages.length === 0) {
      setError('Select at least one page to add.')
      return
    }
    // Guaranteed set by `handleScan` before scanState could ever reach 'done' —
    // re-checked so TypeScript can narrow both to non-null below.
    if (!crawlDepth || !maxPages) return

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
        audience,
        isEnabled: true,
        chunks: 0,
        answersServed: 0,
        lastTrainedOn: 'Never',
        crawlDepth,
        maxPages,
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
              <span className="text-xs text-gray-400">If left empty, each page's own title is used</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Crawl depth *</span>
                <Select value={crawlDepth} onValueChange={(value) => setCrawlDepth(value as string)}>
                  <SelectTrigger>
                    <SelectValue placeholder="select depth" />
                  </SelectTrigger>
                  <SelectContent>
                    {crawlDepthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Max pages *</span>
                <Select value={maxPages} onValueChange={(value) => setMaxPages(value as string)}>
                  <SelectTrigger>
                    <SelectValue placeholder="select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {maxPagesOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Who may see answers from this source?</span>
              <div className="flex flex-wrap gap-1.5">
                {audienceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAudience(option.value)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      audience === option.value
                        ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">Staff-only material belongs in the Knowledge Base section, not here.</p>
            </div>
          </fieldset>

          {scanState !== 'idle' && (
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
            {scanState === 'idle' && 'Scan site'}
            {scanState === 'scanning' && 'Scanning…'}
            {scanState === 'done' && `Add ${selectedPaths.size} page${selectedPaths.size === 1 ? '' : 's'}`}
          </DialogPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

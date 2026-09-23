import { useEffect, useRef, useState } from 'react'
import { Globe } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/checkbox'
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
import { generateId } from '@/lib/utils'
import { articleCategories, createDefaultOwner, crawlDepthOptions, maxPagesOptions, scrapePagesFor } from '../data/mockKnowledgeBaseData'
import { formatToday } from '../utils/formatDate'
import type { ArticleCategory, InternalLink, KnowledgeVisibility, ScrapedPage } from '../types'
import { GroupPicker } from './GroupPicker'
import { VisibilityToggle } from './VisibilityToggle'

interface AddInternalLinkDialogProps {
  open: boolean
  groupOptions: string[]
  onOpenChange: (open: boolean) => void
  /** One page can become several links — every selected page is added as its own bookmark. */
  onAdd: (links: InternalLink[]) => void
}

/** How long a page sits before the next one pops into the list — a live feed of what the scan is finding, not a static list appearing all at once. */
const REVEAL_INTERVAL_MS = 260

type ScanState = 'idle' | 'scanning' | 'done'

function isLikelyUrl(value: string): boolean {
  try {
    // Bare domains (e.g. "wiki.example.com") are common when pasting quickly,
    // so a missing scheme is filled in before validating rather than rejected.
    new URL(/^[a-z]+:\/\//i.test(value) ? value : `https://${value}`)
    return true
  } catch {
    return false
  }
}

export function AddInternalLinkDialog({ open, groupOptions, onOpenChange, onAdd }: AddInternalLinkDialogProps) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [crawlDepth, setCrawlDepth] = useState<string | null>(null)
  const [maxPages, setMaxPages] = useState<string | null>(null)
  const [category, setCategory] = useState<ArticleCategory | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const [visibility, setVisibility] = useState<KnowledgeVisibility>('internal')
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
    setLabel('')
    setUrl('')
    setCrawlDepth(null)
    setMaxPages(null)
    setCategory(null)
    setGroups([])
    setVisibility('internal')
    setError(null)
    setScanState('idle')
    setDiscovered([])
    setVisibleCount(0)
    setSelectedPaths(new Set())
  }

  function toggleGroup(group: string) {
    setGroups((prev) => (prev.includes(group) ? prev.filter((entry) => entry !== group) : [...prev, group]))
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

  function handleScan() {
    if (!url.trim() || !isLikelyUrl(url.trim())) {
      setError('Enter a valid web address.')
      return
    }
    if (!crawlDepth) {
      setError('Select a scan depth.')
      return
    }
    if (!maxPages) {
      setError('Select a page limit.')
      return
    }
    if (!category) {
      setError('Select a category.')
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
    if (!category) return

    const normalisedUrl = /^[a-z]+:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
    const base = new URL(normalisedUrl)
    const owner = createDefaultOwner()
    const addedOn = formatToday()

    const links: InternalLink[] = selectedPages.map((page) => {
      const pageUrl = new URL(page.path, base).toString()
      const pageLabel =
        page.path === '/' ? label.trim() || page.title : label.trim() ? `${label.trim()} — ${page.title}` : page.title
      return {
        id: generateId(),
        label: pageLabel,
        url: pageUrl,
        category,
        groups,
        visibility,
        owner,
        addedOn,
      }
    })

    onAdd(links)
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
          <DialogTitle>Add website link</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <fieldset disabled={scanState !== 'idle'} className="flex flex-col gap-4 disabled:opacity-60">
            <div className="flex flex-col gap-1">
              <Input label="Name" placeholder="e.g. Carrier claims portal" value={label} onChange={(e) => setLabel(e.target.value)} />
              <span className="text-xs text-gray-400">If left empty, each page's own title is used</span>
            </div>
            <Input label="Web address *" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Scan depth *</span>
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

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Category *</span>
              <Select value={category} onValueChange={(value) => setCategory(value as ArticleCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {articleCategories.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <GroupPicker groups={groupOptions} selected={groups} onToggle={toggleGroup} />

            <VisibilityToggle value={visibility} onChange={setVisibility} />

            <p className="text-xs text-gray-400">
              Scanning finds and bookmarks several pages at once for agents — none of this is fetched or indexed for the
              chatbot. To feed the chatbot from a website, add the URL under Chatbot Knowledge instead.
            </p>
          </fieldset>

          {scanState !== 'idle' && (
            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
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
                      {url} · {visibleCount} of {discovered.length} pages found
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

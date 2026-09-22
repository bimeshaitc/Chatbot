import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, RotateCw, Search, TriangleAlert } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/PageHeader'
import { roleCan } from '@/config/roles'
import { useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { cn } from '@/lib/utils'
import type { BotTrainingTab, SourceDocument, SourceFaq, SourceUrl } from '../types'
import { initialDocuments, initialFaqs, initialWebsiteUrls } from '../data/mockBotTrainingData'
import { formatToday } from '../utils/formatDate'
import { SourceDocumentsTable } from './SourceDocumentsTable'
import { SourceUrlsTable } from './SourceUrlsTable'
import { FaqList } from './FaqList'
import { AddDocumentDialog } from './AddDocumentDialog'
import { AddUrlDialog } from './AddUrlDialog'
import { FaqDialog } from './FaqDialog'

const tabs: { id: BotTrainingTab; label: string }[] = [
  { id: 'documents', label: 'Documents' },
  { id: 'urls', label: 'Website URLs' },
  { id: 'faqs', label: 'FAQs' },
]

export function BotTrainingPage() {
  const viewerRole = useWorkspaceRoleStore((state) => state.role)
  const canManage = roleCan(viewerRole, 'knowledge.bot.manage')
  const canRetrain = roleCan(viewerRole, 'knowledge.bot.retrain')

  const [activeTab, setActiveTab] = useState<BotTrainingTab>('documents')
  const [search, setSearch] = useState('')

  // setTimeout ids for in-flight crawl/index simulations, so a chat/tab
  // switch or unmount can cancel them instead of writing state into a
  // component nobody is looking at any more.
  const pendingTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  useEffect(() => () => pendingTimers.current.forEach(clearTimeout), [])

  function after(ms: number, run: () => void) {
    const id = setTimeout(() => {
      pendingTimers.current.delete(id)
      run()
    }, ms)
    pendingTimers.current.add(id)
  }

  const [documents, setDocuments] = useState<SourceDocument[]>(initialDocuments)
  const [websiteUrls, setWebsiteUrls] = useState<SourceUrl[]>(initialWebsiteUrls)
  const [faqs, setFaqs] = useState<SourceFaq[]>(initialFaqs)

  const [isDocumentDialogOpen, setDocumentDialogOpen] = useState(false)
  const [isUrlDialogOpen, setUrlDialogOpen] = useState(false)
  const [faqDialogState, setFaqDialogState] = useState<{ open: boolean; faq: SourceFaq | null }>({
    open: false,
    faq: null,
  })

  const filteredDocuments = useMemo(
    () => documents.filter((doc) => doc.name.toLowerCase().includes(search.toLowerCase())),
    [documents, search],
  )
  const filteredUrls = useMemo(
    () =>
      websiteUrls.filter(
        (entry) =>
          entry.label.toLowerCase().includes(search.toLowerCase()) ||
          entry.url.toLowerCase().includes(search.toLowerCase()),
      ),
    [websiteUrls, search],
  )
  const filteredFaqs = useMemo(
    () => faqs.filter((faq) => faq.question.toLowerCase().includes(search.toLowerCase())),
    [faqs, search],
  )

  const summary = useMemo(() => {
    const trainable = [...documents, ...websiteUrls]
    return {
      total: trainable.length + faqs.length,
      indexed: trainable.filter((source) => source.status === 'indexed').length,
      pending: trainable.filter((source) => source.status === 'indexing' || source.status === 'queued').length,
      failed: trainable.filter((source) => source.status === 'failed').length,
      disabled: [...trainable, ...faqs].filter((source) => !source.isEnabled).length,
      chunks: trainable.reduce((sum, source) => sum + source.chunks, 0),
      answers: [...trainable, ...faqs].reduce((sum, source) => sum + source.answersServed, 0),
    }
  }, [documents, websiteUrls, faqs])

  function handleAddDocument(doc: SourceDocument) {
    setDocuments((prev) => [doc, ...prev])
    toast.success(`${doc.name} queued for training`)
  }

  function handleDeleteDocument(id: string) {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    toast.info('Source deleted. The bot will stop answering from it after the next rebuild.')
  }

  /**
   * Simulates a real crawl: briefly queued, then visibly fetching, then
   * indexed. Retraining a URL used to jump straight to the indexing state
   * and stay there — nothing ever moved it on, so the animation never had
   * anything to resolve to.
   */
  function simulateCrawl(id: string) {
    setWebsiteUrls((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, status: 'queued', failureReason: undefined, lastTrainedOn: 'In progress' }
          : entry,
      ),
    )

    after(700, () => {
      setWebsiteUrls((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status: 'indexing' } : entry)))

      after(2200, () => {
        setWebsiteUrls((prev) =>
          prev.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  status: 'indexed',
                  // A recrawl finds roughly the same amount of content each
                  // time rather than a suspiciously round new number.
                  chunks: entry.chunks > 0 ? entry.chunks : Math.round(8 + Math.random() * 40),
                  lastTrainedOn: formatToday(),
                }
              : entry,
          ),
        )
      })
    })
  }

  function handleAddUrls(entries: SourceUrl[]) {
    setWebsiteUrls((prev) => [...entries, ...prev])
    toast.success(`${entries.length} page${entries.length === 1 ? '' : 's'} queued for crawling`)
    // Staggered the same way `retrainEverything` starts several crawls at
    // once, so a multi-page add doesn't read as one bar ticking N times.
    entries.forEach((entry, index) => after(index * 250, () => simulateCrawl(entry.id)))
  }

  function handleDeleteUrl(id: string) {
    setWebsiteUrls((prev) => prev.filter((entry) => entry.id !== id))
    toast.info('Source deleted. The bot will stop answering from it after the next rebuild.')
  }

  function handleSaveFaq(faq: SourceFaq) {
    setFaqs((prev) => {
      const exists = prev.some((item) => item.id === faq.id)
      return exists ? prev.map((item) => (item.id === faq.id ? faq : item)) : [faq, ...prev]
    })
  }

  function handleDeleteFaq(id: string) {
    setFaqs((prev) => prev.filter((faq) => faq.id !== id))
  }

  function retrainDocument(id: string) {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status: 'indexing', failureReason: undefined, lastTrainedOn: 'In progress' } : doc,
      ),
    )
    toast.success('Retraining started')
  }

  function retrainUrl(id: string) {
    simulateCrawl(id)
    toast.success('Recrawl started')
  }

  function toggleDocumentEnabled(id: string) {
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, isEnabled: !doc.isEnabled } : doc)))
  }

  function toggleUrlEnabled(id: string) {
    setWebsiteUrls((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, isEnabled: !entry.isEnabled } : entry)),
    )
  }

  function retrainEverything() {
    setDocuments((prev) => prev.map((doc) => ({ ...doc, status: 'indexing', lastTrainedOn: 'In progress' })))
    // Stagger the starts slightly so a "retrain everything" click does not
    // read as five identical bars ticking in perfect lockstep.
    websiteUrls.forEach((entry, index) => after(index * 250, () => simulateCrawl(entry.id)))
    toast.success('Rebuilding the bot index from every enabled source')
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4">
      <PageHeader
        title="Chatbot Knowledge"
        description="Sources the AI chatbot is trained on and answers customers from"
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
              <Bot className="h-4.5 w-4.5 text-violet-700" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {summary.indexed} of {summary.total} sources live in the bot index
              </p>
              <p className="mt-0.5 text-xs text-[#6E7678]">
                {summary.chunks.toLocaleString()} retrievable chunks · {summary.answers.toLocaleString()} customer
                answers served
                {summary.disabled > 0 && ` · ${summary.disabled} not in use`}
              </p>
            </div>
          </div>

          {canRetrain && (
            <Button variant="outline" onClick={retrainEverything}>
              <RotateCw className="h-4 w-4" />
              Retrain all
            </Button>
          )}
        </div>

        {(summary.failed > 0 || summary.pending > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {summary.failed > 0 && (
              <span className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700">
                <TriangleAlert className="h-3.5 w-3.5" />
                {summary.failed} source{summary.failed === 1 ? '' : 's'} failed to train
              </span>
            )}
            {summary.pending > 0 && (
              <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700">
                {summary.pending} still training
              </span>
            )}
          </div>
        )}

        <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-[#6E7678]">
          Everything here can reach a customer. Material meant only for agents belongs in{' '}
          <span className="font-medium text-gray-700">Knowledge Base</span>.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex gap-6 border-b border-gray-100 px-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id)
                setSearch('')
              }}
              className={cn(
                'border-b-2 px-1 py-3 text-sm leading-[1.3] transition-colors',
                activeTab === tab.id
                  ? 'border-[#1B5E20] font-bold text-[#1B5E20]'
                  : 'border-transparent font-medium text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="pl-9"
            />
          </div>

          {canManage && activeTab === 'documents' && (
            <Button onClick={() => setDocumentDialogOpen(true)}>+ Add document</Button>
          )}
          {canManage && activeTab === 'urls' && <Button onClick={() => setUrlDialogOpen(true)}>+ Add URL</Button>}
          {canManage && activeTab === 'faqs' && (
            <Button onClick={() => setFaqDialogState({ open: true, faq: null })}>+ Add FAQs</Button>
          )}
        </div>

        <div className="px-5 pb-5">
          {activeTab === 'documents' && (
            <SourceDocumentsTable
              documents={filteredDocuments}
              canManage={canManage}
              canRetrain={canRetrain}
              onDelete={handleDeleteDocument}
              onToggleEnabled={toggleDocumentEnabled}
              onRetrain={retrainDocument}
            />
          )}
          {activeTab === 'urls' && (
            <SourceUrlsTable
              urls={filteredUrls}
              canManage={canManage}
              canRetrain={canRetrain}
              onDelete={handleDeleteUrl}
              onToggleEnabled={toggleUrlEnabled}
              onRetrain={retrainUrl}
            />
          )}
          {activeTab === 'faqs' && (
            <FaqList
              faqs={filteredFaqs}
              canManage={canManage}
              onEdit={(faq) => setFaqDialogState({ open: true, faq })}
              onDelete={handleDeleteFaq}
            />
          )}
        </div>
      </div>

      {canManage && (
        <>
          <AddDocumentDialog open={isDocumentDialogOpen} onOpenChange={setDocumentDialogOpen} onAdd={handleAddDocument} />
          <AddUrlDialog open={isUrlDialogOpen} onOpenChange={setUrlDialogOpen} onAdd={handleAddUrls} />
        </>
      )}
      {faqDialogState.open && (
        <FaqDialog
          faq={faqDialogState.faq}
          onClose={() => setFaqDialogState({ open: false, faq: null })}
          onSave={handleSaveFaq}
        />
      )}
    </div>
  )
}

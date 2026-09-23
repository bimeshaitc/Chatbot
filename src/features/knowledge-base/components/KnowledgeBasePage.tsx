import { useMemo, useState } from 'react'
import { ExternalLink, FileText, Globe2, Link2, Lock, Search, Trash2, TriangleAlert, Users, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/PageHeader'
import { roleCan } from '@/config/roles'
import { useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { useGroupsStore, useReportGroupUsage } from '@/stores/useGroupsStore'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type {
  ArticleCategory,
  InternalArticle,
  InternalDocument,
  InternalLink,
  KnowledgeBaseTab,
  KnowledgeVisibility,
  ReviewStatus,
} from '../types'
import { articleCategories, initialArticles, initialDocuments, initialLinks } from '../data/mockKnowledgeBaseData'
import { ArticleCard } from './ArticleCard'
import { ArticleDialog } from './ArticleDialog'
import { AddInternalDocumentDialog } from './AddInternalDocumentDialog'
import { AddInternalLinkDialog } from './AddInternalLinkDialog'
import { reviewStatusMeta } from '../utils/reviewStatus'

const tabs: { id: KnowledgeBaseTab; label: string }[] = [
  { id: 'articles', label: 'Articles' },
  { id: 'documents', label: 'Documents' },
  { id: 'links', label: 'Website Links' },
]

const reviewFilters: (ReviewStatus | 'all')[] = ['all', 'current', 'due', 'stale', 'draft']

const visibilityFilters: (KnowledgeVisibility | 'all')[] = ['all', 'public', 'internal']
const visibilityFilterLabel: Record<KnowledgeVisibility | 'all', string> = {
  all: 'Public + Internal',
  public: 'Public',
  internal: 'Internal',
}

export function KnowledgeBasePage() {
  const viewerRole = useWorkspaceRoleStore((state) => state.role)
  const canManage = roleCan(viewerRole, 'knowledge.internal.manage')

  const [activeTab, setActiveTab] = useState<KnowledgeBaseTab>('articles')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ArticleCategory | 'all'>('all')
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | 'all'>('all')
  const [groupFilter, setGroupFilter] = useState<string | 'all'>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<KnowledgeVisibility | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Lifted into state (rather than read straight off the seed arrays) so an
  // added, edited or deleted item actually shows up — the read-only version of
  // this page could not do any of the three.
  const [articles, setArticles] = useState<InternalArticle[]>(initialArticles)
  const [documents, setDocuments] = useState<InternalDocument[]>(initialDocuments)
  const [links, setLinks] = useState<InternalLink[]>(initialLinks)

  const groupOptions = useGroupsStore((state) => state.groups)
  const groupUsage = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const entry of [...articles, ...documents, ...links]) {
      for (const group of entry.groups) counts[group] = (counts[group] ?? 0) + 1
    }
    return counts
  }, [articles, documents, links])
  useReportGroupUsage('knowledge-base', groupUsage)

  const [articleDialogState, setArticleDialogState] = useState<{ open: boolean; article: InternalArticle | null }>({
    open: false,
    article: null,
  })
  const [isDocumentDialogOpen, setDocumentDialogOpen] = useState(false)
  const [isLinkDialogOpen, setLinkDialogOpen] = useState(false)

  const debouncedSearch = useDebounce(search)

  const filteredArticles = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    return articles
      .filter((article) => {
        if (categoryFilter !== 'all' && article.category !== categoryFilter) return false
        if (reviewFilter !== 'all' && article.reviewStatus !== reviewFilter) return false
        if (visibilityFilter !== 'all' && article.visibility !== visibilityFilter) return false
        // An article with no groups is readable by everyone, so it matches any
        // group filter rather than being hidden by it.
        if (groupFilter !== 'all' && article.groups.length > 0 && !article.groups.includes(groupFilter)) return false
        if (!query) return true
        return [article.title, article.summary, article.body, article.category].join(' ').toLowerCase().includes(query)
      })
      .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
  }, [articles, categoryFilter, reviewFilter, visibilityFilter, groupFilter, debouncedSearch])

  const filteredDocuments = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    return documents.filter((doc) => {
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false
      if (visibilityFilter !== 'all' && doc.visibility !== visibilityFilter) return false
      if (groupFilter !== 'all' && doc.groups.length > 0 && !doc.groups.includes(groupFilter)) return false
      if (!query) return true
      return doc.name.toLowerCase().includes(query)
    })
  }, [documents, categoryFilter, visibilityFilter, groupFilter, debouncedSearch])

  const filteredLinks = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    return links.filter((link) => {
      if (categoryFilter !== 'all' && link.category !== categoryFilter) return false
      if (visibilityFilter !== 'all' && link.visibility !== visibilityFilter) return false
      if (groupFilter !== 'all' && link.groups.length > 0 && !link.groups.includes(groupFilter)) return false
      if (!query) return true
      return [link.label, link.url].join(' ').toLowerCase().includes(query)
    })
  }, [links, categoryFilter, visibilityFilter, groupFilter, debouncedSearch])

  const needsReview = articles.filter(
    (article) => article.reviewStatus === 'due' || article.reviewStatus === 'stale',
  ).length

  const isFiltering =
    search.trim().length > 0 ||
    categoryFilter !== 'all' ||
    reviewFilter !== 'all' ||
    groupFilter !== 'all' ||
    visibilityFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setCategoryFilter('all')
    setReviewFilter('all')
    setGroupFilter('all')
    setVisibilityFilter('all')
  }

  function handleSaveArticle(article: InternalArticle) {
    setArticles((prev) => {
      const exists = prev.some((entry) => entry.id === article.id)
      return exists ? prev.map((entry) => (entry.id === article.id ? article : entry)) : [article, ...prev]
    })
    toast.success(articleDialogState.article ? 'Article updated' : 'Article added')
  }

  function handleDeleteArticle(id: string) {
    setArticles((prev) => prev.filter((entry) => entry.id !== id))
    if (expandedId === id) setExpandedId(null)
    toast.info('Article deleted')
  }

  function handleAddDocument(doc: InternalDocument) {
    setDocuments((prev) => [doc, ...prev])
    toast.success(`${doc.name} added`)
  }

  function handleDeleteDocument(id: string) {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    toast.info('Document deleted')
  }

  function handleAddLinks(links: InternalLink[]) {
    setLinks((prev) => [...links, ...prev])
    toast.success(`${links.length} link${links.length === 1 ? '' : 's'} added`)
  }

  function handleDeleteLink(id: string) {
    setLinks((prev) => prev.filter((link) => link.id !== id))
    toast.info('Link deleted')
  }

  const publicCount = [...articles, ...documents, ...links].filter((entry) => entry.visibility === 'public').length

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4">
      <PageHeader
        title="Knowledge Base"
        description="Public knowledge is approved for customer use and eligible to feed the chatbot; Internal knowledge is staff-only."
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Lock className="h-4.5 w-4.5 text-gray-600" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {articles.length} articles · {documents.length} documents · {links.length} links
              </p>
              <p className="mt-0.5 text-xs text-[#6E7678]">
                {publicCount} public, eligible for customer use and Chatbot Knowledge — everything else is staff-only
                and never reachable by a customer or the chatbot.
              </p>
            </div>
          </div>

          {needsReview > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('articles')
                setReviewFilter('due')
              }}
              className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              <TriangleAlert className="h-3.5 w-3.5" />
              {needsReview} need review
            </button>
          )}
        </div>

        <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-[#6E7678]">
          To teach the chatbot something, add it under{' '}
          <span className="font-medium text-gray-700">Chatbot Knowledge</span> instead.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex gap-6 border-b border-gray-100 px-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search titles and content"
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', ...articleCategories] as (ArticleCategory | 'all')[]).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    categoryFilter === category
                      ? 'border-[#1B5E20] bg-[#1B5E20]/5 text-[#1B5E20]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {category === 'all' ? 'All types' : category}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {visibilityFilters.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVisibilityFilter(option)}
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    visibilityFilter === option
                      ? 'border-[#1B5E20] bg-[#1B5E20]/5 text-[#1B5E20]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {option === 'public' && <Globe2 className="h-3 w-3" />}
                  {option === 'internal' && <Lock className="h-3 w-3" />}
                  {visibilityFilterLabel[option]}
                </button>
              ))}
            </div>

            {activeTab === 'articles' && (
              <div className="flex flex-wrap items-center gap-1.5">
                {reviewFilters.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setReviewFilter(status)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      reviewFilter === status
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {status === 'all' ? 'Any state' : reviewStatusMeta[status].label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', ...groupOptions] as (string | 'all')[]).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setGroupFilter(group)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    groupFilter === group
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {group === 'all' ? 'All groups' : group}
                </button>
              ))}
            </div>

            {isFiltering && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          {canManage && (
            <>
              {activeTab === 'articles' && (
                <Button onClick={() => setArticleDialogState({ open: true, article: null })}>+ Add article</Button>
              )}
              {activeTab === 'documents' && <Button onClick={() => setDocumentDialogOpen(true)}>+ Add document</Button>}
              {activeTab === 'links' && <Button onClick={() => setLinkDialogOpen(true)}>+ Add link</Button>}
            </>
          )}
        </div>

        <div className="px-5 pb-5">
          {activeTab === 'articles' ? (
            filteredArticles.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No articles match these filters.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isExpanded={expandedId === article.id}
                    onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
                    canManage={canManage}
                    onEdit={(entry) => setArticleDialogState({ open: true, article: entry })}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            )
          ) : activeTab === 'documents' ? (
            filteredDocuments.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No documents match these filters.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
                      <th className="p-4 font-medium">Document</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium">Visibility</th>
                      <th className="p-4 font-medium">Visible to</th>
                      <th className="p-4 font-medium">Owner</th>
                      <th className="p-4 font-medium">Added on</th>
                      {canManage && <th className="p-4 font-medium" />}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc, index) => (
                      <tr key={doc.id} className={index !== filteredDocuments.length - 1 ? 'border-b border-gray-100' : ''}>
                        <td className="p-4">
                          <span className="flex items-start gap-2 text-gray-800">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                            <span className="flex flex-col">
                              <span>{doc.name}</span>
                              <span className="text-xs text-gray-400">{doc.sizeLabel}</span>
                            </span>
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant="gray">{doc.category}</Badge>
                        </td>
                        <td className="p-4">
                          {doc.visibility === 'public' ? (
                            <Badge variant="emerald" className="gap-1">
                              <Globe2 className="h-3 w-3" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="gray" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Internal
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {doc.groups.length === 0 ? 'Whole workspace' : doc.groups.join(', ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                                doc.owner.avatarColor,
                              )}
                            >
                              {doc.owner.initials}
                            </span>
                            {doc.owner.name}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{doc.addedOn}</td>
                        {canManage && (
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc.id)}
                              aria-label={`Delete ${doc.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : filteredLinks.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No links match these filters.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
                    <th className="p-4 font-medium">Link</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Visibility</th>
                    <th className="p-4 font-medium">Visible to</th>
                    <th className="p-4 font-medium">Owner</th>
                    <th className="p-4 font-medium">Added on</th>
                    {canManage && <th className="p-4 font-medium" />}
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link, index) => (
                    <tr key={link.id} className={index !== filteredLinks.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="p-4">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start gap-2 text-gray-800 hover:text-[#1B5E20]"
                        >
                          <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                          <span className="flex flex-col">
                            <span className="flex items-center gap-1">
                              {link.label}
                              <ExternalLink className="h-3 w-3 shrink-0 text-gray-400" />
                            </span>
                            <span className="max-w-xs truncate text-xs text-gray-400">{link.url}</span>
                          </span>
                        </a>
                      </td>
                      <td className="p-4">
                        <Badge variant="gray">{link.category}</Badge>
                      </td>
                      <td className="p-4">
                        {link.visibility === 'public' ? (
                          <Badge variant="emerald" className="gap-1">
                            <Globe2 className="h-3 w-3" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="gray" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Internal
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          {link.groups.length === 0 ? 'Whole workspace' : link.groups.join(', ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                              link.owner.avatarColor,
                            )}
                          >
                            {link.owner.initials}
                          </span>
                          {link.owner.name}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{link.addedOn}</td>
                      {canManage && (
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(link.id)}
                            aria-label={`Delete ${link.label}`}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {articleDialogState.open && (
        <ArticleDialog
          article={articleDialogState.article}
          groupOptions={groupOptions}
          onClose={() => setArticleDialogState({ open: false, article: null })}
          onSave={handleSaveArticle}
        />
      )}
      <AddInternalDocumentDialog
        open={isDocumentDialogOpen}
        groupOptions={groupOptions}
        onOpenChange={setDocumentDialogOpen}
        onAdd={handleAddDocument}
      />
      <AddInternalLinkDialog
        open={isLinkDialogOpen}
        groupOptions={groupOptions}
        onOpenChange={setLinkDialogOpen}
        onAdd={handleAddLinks}
      />
    </div>
  )
}

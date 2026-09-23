import { BookOpen, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SourceArticle } from '../types'
import { AudienceBadge, TrainingStatusBadge } from './TrainingStatusBadge'
import { AuthorCell } from './AuthorCell'
import { SourceActionsMenu } from './SourceActionsMenu'

interface SourceArticlesTableProps {
  articles: SourceArticle[]
  canManage: boolean
  canRetrain: boolean
  onEdit: (article: SourceArticle) => void
  onDelete: (id: string) => void
  onToggleEnabled: (id: string) => void
  onRetrain: (id: string) => void
}

export function SourceArticlesTable({
  articles,
  canManage,
  canRetrain,
  onEdit,
  onDelete,
  onToggleEnabled,
  onRetrain,
}: SourceArticlesTableProps) {
  if (articles.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">No articles found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#F7F7F8] text-xs tracking-wide text-gray-600 uppercase">
            <th className="p-4 font-medium">Article</th>
            <th className="p-4 font-medium">Category</th>
            <th className="p-4 font-medium">Training</th>
            <th className="p-4 font-medium">Chunks</th>
            <th className="p-4 font-medium">Audience</th>
            <th className="p-4 font-medium">Answers</th>
            <th className="p-4 font-medium">Author</th>
            <th className="p-4 font-medium">Last trained</th>
            <th className="p-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article, index) => (
            <tr key={article.id} className={index !== articles.length - 1 ? 'border-b border-gray-100' : ''}>
              <td className="p-4">
                <span className="flex items-start gap-2">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  <span className="flex flex-col">
                    <span className="text-gray-800">{article.title}</span>
                    <span className="line-clamp-1 text-xs text-gray-400">{article.content}</span>
                  </span>
                </span>
              </td>
              <td className="p-4">
                <Badge variant="blue">{article.category}</Badge>
              </td>
              <td className="p-4">
                <TrainingStatusBadge status={article.status} isEnabled={article.isEnabled} />
                {article.failureReason && (
                  <span className="mt-1 flex items-start gap-1 text-xs text-rose-600">
                    <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
                    {article.failureReason}
                  </span>
                )}
              </td>
              <td className="p-4 text-gray-600">{article.chunks || '—'}</td>
              <td className="p-4">
                <AudienceBadge audience={article.audience} />
              </td>
              <td className="p-4 text-gray-600">{article.answersServed || '—'}</td>
              <td className="p-4">
                <AuthorCell author={article.author} />
              </td>
              <td className="p-4 text-gray-600">{article.lastTrainedOn}</td>
              <td className="p-4 text-right">
                <SourceActionsMenu
                  isEnabled={article.isEnabled}
                  canManage={canManage}
                  canRetrain={canRetrain}
                  onEdit={() => onEdit(article)}
                  onToggleEnabled={() => onToggleEnabled(article.id)}
                  onRetrain={() => onRetrain(article.id)}
                  onDelete={() => onDelete(article.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

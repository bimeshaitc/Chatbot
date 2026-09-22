import { ChevronDown, Eye, Globe2, Lock, Pencil, Pin, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { InternalArticle } from '../types'
import { reviewStatusMeta } from '../utils/reviewStatus'

interface ArticleCardProps {
  article: InternalArticle
  isExpanded: boolean
  onToggle: (id: string) => void
  /** Edit and delete are only offered to roles holding `knowledge.internal.manage`. */
  canManage?: boolean
  onEdit?: (article: InternalArticle) => void
  onDelete?: (id: string) => void
}

export function ArticleCard({ article, isExpanded, onToggle, canManage, onEdit, onDelete }: ArticleCardProps) {
  const review = reviewStatusMeta[article.reviewStatus]

  return (
    <div
      className={cn(
        'rounded-xl border bg-white transition-colors',
        article.reviewStatus === 'stale' ? 'border-rose-100' : 'border-gray-100',
      )}
    >
      <div className="flex w-full items-start gap-3 p-4">
        <button
          type="button"
          onClick={() => onToggle(article.id)}
          aria-expanded={isExpanded}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {article.isPinned && <Pin className="h-3.5 w-3.5 shrink-0 text-[#1B5E20]" />}
            <span className="text-sm font-semibold text-gray-900">{article.title}</span>
            <Badge className={review.className}>{review.label}</Badge>
            <Badge variant="gray">{article.category}</Badge>
            {article.visibility === 'public' ? (
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
          </div>
          <p className="mt-1 text-xs text-[#6E7678]">{article.summary}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold',
                  article.owner.avatarColor,
                )}
              >
                {article.owner.initials}
              </span>
              {article.owner.name}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {article.groups.length === 0 ? 'Whole workspace' : article.groups.join(', ')}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views}
            </span>
            <span>Reviewed {article.lastReviewedOn}</span>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(article)}
                aria-label="Edit article"
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(article.id)}
                aria-label="Delete article"
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onToggle(article.id)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-3">
          {review.note && (
            <p className={cn('mb-2 rounded-lg px-3 py-2 text-xs', review.className)}>{review.note}</p>
          )}
          <p className="text-sm leading-relaxed text-gray-700">{article.body}</p>
          <p className="mt-3 text-[11px] text-gray-400">Last updated {article.updatedOn}</p>
        </div>
      )}
    </div>
  )
}

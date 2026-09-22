import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostChatSurveyPanelProps {
  askRating: boolean
  accentColor: string
  onSubmit: () => void
}

/**
 * Deliberately fire-and-forget: nothing here needs to travel anywhere for the
 * preview to make its point, so `onSubmit` takes no answers. A real widget
 * would post these to whatever the "Chat forms report" the admin copy
 * mentions actually is.
 */
export function PostChatSurveyPanel({ askRating, accentColor, onSubmit }: PostChatSurveyPanelProps) {
  const [firstTime, setFirstTime] = useState<'yes' | 'no' | null>(null)
  const [resolved, setResolved] = useState<'yes' | 'no' | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const showCommentBox = rating > 0 && rating <= 3

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      <p className="text-xs font-semibold text-gray-800">Before you go — how did we do?</p>

      <YesNoQuestion
        question="Is this the first time you've chatted with us about this case?"
        value={firstTime}
        onChange={setFirstTime}
        accentColor={accentColor}
      />
      <YesNoQuestion
        question="Was the case resolved during the chat?"
        value={resolved}
        onChange={setResolved}
        accentColor={accentColor}
      />

      {askRating && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-600">How would you rate this chat?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star${value === 1 ? '' : 's'}`}>
                <Star
                  className={cn('h-5 w-5', value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
                />
              </button>
            ))}
          </div>
          {showCommentBox && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-gray-500">Thanks for the rating — mind telling us more?</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="What could we have done better?"
                className="resize-none rounded-md border border-gray-200 px-2 py-1 text-[11px] outline-none focus:border-gray-400"
              />
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        className="mt-1 self-start rounded-md px-3 py-1.5 text-xs font-medium text-white"
        style={{ backgroundColor: accentColor }}
      >
        Submit
      </button>
    </div>
  )
}

function YesNoQuestion({
  question,
  value,
  onChange,
  accentColor,
}: {
  question: string
  value: 'yes' | 'no' | null
  onChange: (value: 'yes' | 'no') => void
  accentColor: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-600">{question}</p>
      <div className="flex gap-1.5">
        {(['yes', 'no'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'rounded-full border px-3 py-1 text-[11px] font-medium capitalize transition-colors',
              value === option ? 'border-transparent text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
            style={value === option ? { backgroundColor: accentColor } : undefined}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

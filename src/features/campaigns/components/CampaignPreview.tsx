import { useState } from 'react'
import { ArrowUp, ExternalLink, Image as ImageIcon, MessageSquare, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface CampaignPreviewProps {
  title: string
  content: string
  imageUrl: string
  actionButtons: { id: string; label: string }[]
}

type PreviewDevice = 'desktop' | 'mobile'

const tabTriggerClassName = 'data-active:text-[#1B5E20] data-active:after:bg-[#1B5E20] after:h-0.5 after:rounded-full'

/**
 * A static mock of how this campaign renders inside the chat widget — not
 * the widget itself (that's `bot-settings/WidgetChatSimulator`, a full
 * conversation engine keyed off `BotSettings`). Campaigns don't carry that
 * config, so the chrome (avatar, name) borrows Mercury's own sidebar
 * branding rather than a per-workspace one, and nothing here is interactive.
 */
export function CampaignPreview({ title, content, imageUrl, actionButtons }: CampaignPreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const isMobile = device === 'mobile'

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-gray-900">Preview</span>

      <Tabs value={device} onValueChange={(value) => setDevice(value as PreviewDevice)}>
        <TabsList variant="line">
          <TabsTrigger value="desktop" className={tabTriggerClassName}>
            Desktop
          </TabsTrigger>
          <TabsTrigger value="mobile" className={tabTriggerClassName}>
            Mobile
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className={cn('rounded-xl bg-gray-100 p-4', isMobile && '-mx-1')}>
        <div className={cn('mx-auto flex flex-col gap-2', isMobile ? 'w-full max-w-[240px]' : 'w-full max-w-[260px]')}>
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
              <MessageSquare className="h-3 w-3" />
            </span>
            <span className="flex-1 truncate text-xs font-semibold text-gray-900">Mercury Chatbot</span>
            <X className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex h-28 w-full items-center justify-center bg-gray-100">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-300" />
              )}
            </div>
            <div className="flex flex-col gap-2 p-3">
              {actionButtons.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {actionButtons.map((button) => (
                    <span
                      key={button.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700"
                    >
                      <span className="truncate">{button.label}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-gray-400" />
                    </span>
                  ))}
                </div>
              )}
              <p className="truncate text-sm font-semibold text-gray-900">{title || 'Your campaign title'}</p>
              <p className="line-clamp-4 text-xs whitespace-pre-wrap text-gray-600">
                {content || 'Your message will appear here as you type it.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm">
            <span className="flex-1 truncate text-xs text-gray-400">Write a message...</span>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B5E20] text-white">
              <ArrowUp className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        To test the campaign, open your website in an incognito window (Ctrl + Shift + N).
      </p>
    </div>
  )
}

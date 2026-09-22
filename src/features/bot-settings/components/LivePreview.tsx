import { useState } from 'react'
import { Megaphone, MessageCircle, MessageSquare, MousePointerClick, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BotSettings } from '../types'
import { WidgetChatSimulator } from './WidgetChatSimulator'

interface LivePreviewProps {
  settings: BotSettings
}

/**
 * A real, click-through preview of what a customer sees — not just the
 * widget's colours. Opening it greets with the configured message (or the
 * pre-chat form, if that's on), and typing runs the actual troubleshoot-then-
 * escalate flow: the assistant tries an answer, checks whether it helped, and
 * after two misses — or an explicit "talk to a person," a high-risk topic, a
 * backend/privacy request, or simply being unavailable — offers a live agent
 * or a ticket instead of looping forever.
 *
 * `sessionKey` remounts the simulator on every open, so each preview session
 * starts clean rather than carrying over the last one.
 */
export function LivePreview({ settings }: LivePreviewProps) {
  const { appearance, visibility } = settings
  const LauncherIcon = appearance.launcherIcon === 'circle' ? MessageCircle : MessageSquare
  const [isOpen, setOpen] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)

  function closeAndReset() {
    setOpen(false)
    setSessionKey((prev) => prev + 1)
  }

  const showLauncher = visibility.mode !== 'always-hidden'

  return (
    <div className="flex w-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:h-121.25 lg:w-112.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Live Preview</h2>
          <p className="mt-1 text-xs text-gray-500">Click the launcher to try the widget as a customer would.</p>
        </div>
        {isOpen && (
          <button
            type="button"
            onClick={closeAndReset}
            title="Restart the demo conversation"
            aria-label="Restart the demo conversation"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div
        className="relative mt-4 flex-1 overflow-hidden rounded-xl border border-gray-100"
        style={{ backgroundColor: appearance.secondaryColor }}
      >
        {isOpen ? (
          <WidgetChatSimulator key={sessionKey} settings={settings} onClose={closeAndReset} />
        ) : (
          <>
            {!showLauncher && (
              <p className="absolute inset-x-3 bottom-3 flex items-start gap-1.5 rounded-lg bg-black/5 px-2.5 py-2 text-[11px] text-gray-500">
                <MousePointerClick className="mt-0.5 h-3 w-3 shrink-0" />
                The icon is hidden — customers can only start a chat from a button you add yourself.
              </p>
            )}

            {showLauncher && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open chat preview"
                className={cn(
                  'absolute bottom-3 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105',
                  appearance.widgetPosition === 'left' ? 'left-3' : 'right-3',
                )}
                style={{ backgroundColor: appearance.primaryColor }}
              >
                {appearance.customLauncherIcon ? (
                  <img src={appearance.customLauncherIcon} alt="" className="h-4 w-4 rounded-full object-contain" />
                ) : (
                  <LauncherIcon className="h-4 w-4" />
                )}
              </button>
            )}

            {visibility.mode === 'hide-until-active' && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                title="Stands in for a chat starting some other way on your site — an embedded link, a support page, etc."
                className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-50"
              >
                <Megaphone className="h-3 w-3" />
                Simulate an external trigger
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

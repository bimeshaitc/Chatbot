import { useNavigate } from 'react-router-dom'
import { MessageCircle, Palette, Clock, FileText } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { defaultBotSettings } from '../data/defaultBotSettings'

interface SummaryCardProps {
  icon: typeof Palette
  title: string
  rows: { label: string; value: string }[]
  editTab: string
}

/**
 * V2 visual redesign of Bot Setting, scoped to this one chatbot — a
 * dashboard summary instead of a form-first tab editor. "Edit" on each card
 * jumps to the existing v1 editor (`/bot-setting`), which stays the source
 * of truth for actually changing values.
 */
export function BotSettingPageV2() {
  const navigate = useNavigate()
  const settings = defaultBotSettings

  const cards: SummaryCardProps[] = [
    {
      icon: Palette,
      title: 'Appearance',
      editTab: 'appearance',
      rows: [
        { label: 'Primary color', value: settings.appearance.primaryColor },
        { label: 'Widget position', value: settings.appearance.widgetPosition === 'right' ? 'Bottom right' : 'Bottom left' },
        { label: 'Launcher icon', value: settings.appearance.launcherIcon },
      ],
    },
    {
      icon: MessageCircle,
      title: 'Content & greeting',
      editTab: 'content',
      rows: [
        { label: 'Company name', value: settings.content.companyName },
        { label: 'Header text', value: settings.content.headerText },
        { label: 'Greeting', value: settings.content.greetingMessage },
      ],
    },
    {
      icon: Clock,
      title: 'Availability',
      editTab: 'behavior',
      rows: [
        { label: 'Availability', value: settings.availability.alwaysAvailable ? 'Always on' : 'Agent hours only' },
        { label: 'Sound notifications', value: settings.behavior.soundNotifications ? 'On' : 'Off' },
        { label: 'Ratings', value: settings.behavior.letCustomersRateAgents ? 'Enabled' : 'Disabled' },
      ],
    },
    {
      icon: FileText,
      title: 'Forms',
      editTab: 'forms',
      rows: [
        { label: 'Pre-chat form', value: settings.preChatForm.enabled ? 'On' : 'Off' },
        { label: 'Post-chat form', value: settings.postChatForm.enabled ? 'On' : 'Off' },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Bot Setting" description="This chatbot's configuration at a glance — v2 design." />
        <Button onClick={() => navigate('/bot-setting')}>Open full editor</Button>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] p-5 text-white shadow-sm">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold"
          style={{ backgroundColor: settings.appearance.secondaryColor, color: settings.appearance.primaryColor }}
        >
          {settings.content.companyName.charAt(0)}
        </span>
        <div>
          <p className="text-lg font-bold">{settings.content.companyName}</p>
          <p className="text-sm text-white/80">{settings.content.headerText}</p>
        </div>
        <span className="ml-auto rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          {settings.availability.alwaysAvailable ? 'Always available' : 'Limited hours'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF2FD] text-[#1B5E20]">
                  <card.icon className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-gray-800">{card.title}</p>
              </div>
              <button
                onClick={() => navigate('/bot-setting')}
                className={cn('text-xs font-medium text-[#1B5E20] hover:underline')}
              >
                Edit
              </button>
            </div>
            <dl className="mt-3 flex flex-col gap-1.5">
              {card.rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <dt className="text-gray-500">{row.label}</dt>
                  <dd className="max-w-[60%] truncate font-medium text-gray-800">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}

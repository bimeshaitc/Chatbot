import { useState } from 'react'
import { Check, Plug } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import { initialIntegrations } from '../data/mockIntegrationsData'
import type { IntegrationChannel } from '../types'
import { FacebookIcon, InstagramIcon, WhatsappIcon } from './PlatformIcons'

const icons = {
  whatsapp: WhatsappIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
}

/**
 * V2 visual redesign of Integration — a card grid instead of a settings-style
 * row list, so connected/disconnected reads as a status board at a glance
 * rather than something you scan row by row.
 */
export function IntegrationPageV2() {
  const [channels, setChannels] = useState<IntegrationChannel[]>(initialIntegrations)

  function handleToggle(id: IntegrationChannel['id']) {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === id ? { ...channel, status: channel.status === 'connected' ? 'disconnected' : 'connected' } : channel,
      ),
    )
  }

  const connectedCount = channels.filter((channel) => channel.status === 'connected').length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Integration"
          description="Link various messaging platforms to handle all your conversations from a single location."
        />
        <Badge variant="emerald" className="gap-1.5 px-3 py-1 text-xs">
          <Plug className="h-3.5 w-3.5" />
          {connectedCount} of {channels.length} connected
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => {
          const Icon = icons[channel.id]
          const isConnected = channel.status === 'connected'

          return (
            <div
              key={channel.id}
              className={cn(
                'flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-colors',
                isConnected ? 'border-[#1B5E20]/30 bg-[#F3F9F3]' : 'border-gray-100',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon className="h-6 w-6" />
                </span>
                {isConnected && (
                  <Badge variant="emerald" className="gap-1">
                    <Check className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{channel.name}</p>
                <p className="mt-1 text-xs text-gray-500">{channel.description}</p>
              </div>

              <Button
                type="button"
                onClick={() => handleToggle(channel.id)}
                variant={isConnected ? 'outline' : 'default'}
                className={cn('w-full', !isConnected && 'bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90')}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

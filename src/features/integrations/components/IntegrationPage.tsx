import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { initialIntegrations } from '../data/mockIntegrationsData'
import type { IntegrationChannel } from '../types'
import { IntegrationRow } from './IntegrationRow'

export function IntegrationPage() {
  const [channels, setChannels] = useState<IntegrationChannel[]>(initialIntegrations)

  function handleToggle(id: IntegrationChannel['id']) {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === id ? { ...channel, status: channel.status === 'connected' ? 'disconnected' : 'connected' } : channel,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl">
      <PageHeader
        as="h2"
        title="Integration"
        description="Link various messaging platforms to handle all your conversations from a single location."
      />

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {channels.map((channel) => (
          <IntegrationRow key={channel.id} channel={channel} onToggle={() => handleToggle(channel.id)} />
        ))}
      </div>
    </div>
  )
}

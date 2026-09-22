import { Button } from '@/components/ui/Button'
import type { IntegrationChannel } from '../types'
import { FacebookIcon, InstagramIcon, WhatsappIcon } from './PlatformIcons'

const icons = {
  whatsapp: WhatsappIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
}

interface IntegrationRowProps {
  channel: IntegrationChannel
  onToggle: () => void
}

export function IntegrationRow({ channel, onToggle }: IntegrationRowProps) {
  const Icon = icons[channel.id]
  const isConnected = channel.status === 'connected'

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5 last:border-b-0">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-6 w-6 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-900">{channel.name}</p>
          <p className="mt-0.5 text-sm text-gray-500">{channel.description}</p>
        </div>
      </div>
      <Button
        type="button"
        onClick={onToggle}
        variant={isConnected ? 'default' : 'outline'}
        className={isConnected ? 'shrink-0 bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90' : 'shrink-0 text-gray-900'}
      >
        {isConnected ? 'Connected' : 'Integrate'}
      </Button>
    </div>
  )
}

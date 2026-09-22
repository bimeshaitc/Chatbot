import { useState } from 'react'
import { History, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/PageHeader'
import { initialCampaigns } from '../data/mockCampaignData'
import type { CampaignRecord } from '../types'
import { CampaignCard } from './CampaignCard'
import { CreateCampaignDialog } from './CreateCampaignDialog'

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(initialCampaigns)
  const [isCreateOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="Campaigns" description="Create and manage marketing campaigns across all channels" />
        <div className="flex shrink-0 items-center gap-3">
          <Button className="bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create campaign
          </Button>
          <Button variant="secondary" className="bg-gray-50 text-gray-900 hover:bg-gray-100">
            <History className="h-4 w-4" />
            Activity log
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      {isCreateOpen && (
        <CreateCampaignDialog
          onClose={() => setCreateOpen(false)}
          onCreate={(campaign) => setCampaigns((prev) => [campaign, ...prev])}
        />
      )}
    </div>
  )
}

export type CampaignStatus = 'active' | 'inactive' | 'scheduled' | 'draft'

export interface CampaignStats {
  views: number
  clicks: number
  ctr: number
  conversions: number
  audience: string
}

export interface CampaignActionButton {
  label: string
  url: string
}

export interface CampaignRecord {
  id: string
  title: string
  category: string
  message: string
  status: CampaignStatus
  stats: CampaignStats
  /**
   * Creative captured at creation. Optional, and not yet surfaced on
   * `CampaignCard` — the list view still only reads the fields above — but
   * kept on the record so `CreateCampaignDialog` doesn't silently drop what
   * an admin filled in.
   */
  imageUrl?: string
  actionButtons?: CampaignActionButton[]
  startAt?: string
  endAt?: string
}

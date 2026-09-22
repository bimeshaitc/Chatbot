import type { CampaignRecord, CampaignStatus } from '../types'

const activeStats = { views: 12450, clicks: 3890, ctr: 31.2, conversions: 1245, audience: 'All Visitors' }
const emptyStats = { views: 0, clicks: 0, ctr: 0, conversions: 0, audience: 'All Visitors' }

export const campaignTypeOptions = ['Welcome', 'Promotion', 'Announcement', 'Lead Generation', 'Other'] as const

export const visitorOptions = ['All Visitors', 'New Visitors', 'Returning Visitors'] as const

export const campaignStatusOptions: { value: CampaignStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
]

/** The Create Campaign form only ever sets one of these three — `scheduled`
 * is a state a campaign can move to later, not something set on creation. */
export const createCampaignStatusOptions = campaignStatusOptions.filter((option) => option.value !== 'scheduled')

export const initialCampaigns: CampaignRecord[] = [
  {
    id: 'campaign-1',
    title: 'Welcome New Visitors',
    category: 'Greeting',
    message: 'Hi there! 👋 Welcome to our website. Need any help getting started?',
    status: 'active',
    stats: activeStats,
  },
  {
    id: 'campaign-2',
    title: 'Welcome New Visitors',
    category: 'Greeting',
    message: 'Hi there! 👋 Welcome to our website. Need any help getting started?',
    status: 'inactive',
    stats: activeStats,
  },
  {
    id: 'campaign-3',
    title: 'Welcome New Visitors',
    category: 'Greeting',
    message: 'Hi there! 👋 Welcome to our website. Need any help getting started?',
    status: 'scheduled',
    stats: activeStats,
  },
  {
    id: 'campaign-4',
    title: 'Welcome New Visitors',
    category: 'Greeting',
    message: 'Hi there! 👋 Welcome to our website. Need any help getting started?',
    status: 'draft',
    stats: emptyStats,
  },
]

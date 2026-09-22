export type PlanTier = 'free' | 'pro' | 'enterprise'

export interface UsageMetric {
  label: string
  used: number
  limit: number | null // null = unlimited
  unit: string
}

export interface PlanOption {
  tier: PlanTier
  name: string
  priceLabel: string
  tagline: string
  features: string[]
}

export interface CurrentPlan {
  tier: PlanTier
  renewsOn: string
  usage: UsageMetric[]
}

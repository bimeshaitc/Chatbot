import { Check } from 'lucide-react'
import { toast } from 'react-toastify'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { currentPlan, planOptions } from '../data/mockBusinessPlanData'

/**
 * V2 visual redesign of Business Plan — usage moves into one hero card up
 * top (what a billing dashboard leads with), and the three plan tiers sit
 * side by side in a comparison strip below rather than each carrying its own
 * usage summary.
 */
export function BusinessPlanPageV2() {
  const active = planOptions.find((plan) => plan.tier === currentPlan.tier)

  function handleUpgrade(planName: string) {
    toast.success(`Upgrade request sent for the ${planName} plan — billing isn't wired up in this prototype.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Business Plan" description="Your subscription, usage, and available plans." />

      <div className="rounded-2xl border border-[#1B5E20]/20 bg-gradient-to-br from-[#F3F9F3] to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#1B5E20]">Current plan</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{active?.name ?? currentPlan.tier}</p>
            <p className="mt-0.5 text-xs text-gray-500">Renews {currentPlan.renewsOn}</p>
          </div>
          <Badge variant="emerald" className="px-3 py-1 text-xs">
            Active
          </Badge>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentPlan.usage.map((metric) => {
            const pct = metric.limit ? Math.min(100, Math.round((metric.used / metric.limit) * 100)) : 0
            return (
              <div key={metric.label} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">{metric.label}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {metric.used.toLocaleString()}
                  <span className="text-xs font-normal text-gray-400"> {metric.unit}</span>
                </p>
                {metric.limit ? (
                  <>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[#1B5E20]',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">of {metric.limit.toLocaleString()}</p>
                  </>
                ) : (
                  <p className="mt-2 text-[11px] text-gray-400">Unlimited</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-800">Compare plans</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="grid min-w-[640px] grid-cols-3 divide-x divide-gray-100">
            {planOptions.map((plan) => {
              const isCurrent = plan.tier === currentPlan.tier
              return (
                <div key={plan.tier} className={cn('flex flex-col p-5', isCurrent && 'bg-[#F3F9F3]')}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{plan.name}</h3>
                    {isCurrent && <Badge variant="emerald">Current</Badge>}
                  </div>
                  <p className="mt-1 text-base font-semibold text-gray-800">{plan.priceLabel}</p>
                  <p className="mt-1 text-xs text-gray-500">{plan.tagline}</p>
                  <ul className="mt-3 flex flex-1 flex-col gap-1.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#1B5E20]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-4 w-full"
                    size="sm"
                    variant={isCurrent ? 'outline' : 'default'}
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {isCurrent ? 'Current plan' : plan.tier === 'enterprise' ? 'Contact sales' : 'Upgrade'}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

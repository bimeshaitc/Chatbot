import { Check } from 'lucide-react'
import { toast } from 'react-toastify'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { currentPlan, planOptions } from '../data/mockBusinessPlanData'

function UsageBar({ used, limit, unit }: { used: number; limit: number | null; unit: string }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs text-gray-500">
        <span>
          {used.toLocaleString()} {unit} used
        </span>
        <span>{limit ? `of ${limit.toLocaleString()}` : 'Unlimited'}</span>
      </div>
      {limit && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn('h-full rounded-full', pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[#1B5E20]')}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function BusinessPlanPage() {
  const active = planOptions.find((plan) => plan.tier === currentPlan.tier)

  function handleUpgrade(planName: string) {
    toast.success(`Upgrade request sent for the ${planName} plan — billing isn't wired up in this prototype.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Business Plan" description="Your subscription, usage, and available plans." />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-gray-400">Current plan</p>
            <p className="mt-0.5 text-lg font-bold text-gray-900">{active?.name ?? currentPlan.tier}</p>
            <p className="text-xs text-gray-500">Renews {currentPlan.renewsOn}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {currentPlan.usage.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-medium text-gray-500">{metric.label}</p>
              <div className="mt-2">
                <UsageBar used={metric.used} limit={metric.limit} unit={metric.unit} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-800">Available plans</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          {planOptions.map((plan) => {
            const isCurrent = plan.tier === currentPlan.tier
            return (
              <div
                key={plan.tier}
                className={cn(
                  'flex flex-col rounded-2xl border p-5 shadow-sm',
                  isCurrent ? 'border-[#1B5E20] bg-[#F3F9F3]' : 'border-gray-100 bg-white',
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                  {isCurrent && (
                    <span className="rounded-full bg-[#1B5E20] px-2 py-0.5 text-[11px] font-medium text-white">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-1 text-lg font-semibold text-gray-800">{plan.priceLabel}</p>
                <p className="mt-1 text-xs text-gray-500">{plan.tagline}</p>
                <ul className="mt-4 flex flex-1 flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B5E20]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-5 w-full"
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
  )
}

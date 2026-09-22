import { Star } from 'lucide-react'
import { InfoTip } from '@/components/InfoTip'
import { topAgents } from '../data/mockDashboardData'

export function TopAgentsCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-1.5 text-[15px] leading-[1.4] font-semibold text-gray-900">
        Top 5 Performing Agent
        <InfoTip label="The five agents with the highest CSAT in the selected period. Chat Handled counts conversations they closed, Average Handled Time is mean time from assignment to resolution, and CSAT is their average survey rating out of 5." align="right" />
      </h2>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-pastel-background text-left text-xs text-gray-400">
              <th className="px-3 py-2 font-medium">Agent</th>
              <th className="px-3 py-2 font-medium">Chat Handled</th>
              <th className="px-3 py-2 font-medium">Average Handled Time</th>
              <th className="px-3 py-2 font-medium">CSAT Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topAgents.map((agent) => (
              <tr key={agent.id}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${agent.avatarColor}`}>
                      {agent.initials}
                    </span>
                    <span className="font-medium text-gray-900">{agent.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-gray-600">{agent.chatsHandled}</td>
                <td className="px-3 py-2.5 text-gray-600">{agent.avgHandledTime}</td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1 text-gray-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {agent.csatScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

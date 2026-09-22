import type { BotAvailabilitySettings, BotBehaviorSettings } from '../types'
import { SettingToggle } from './SettingToggle'

interface ChatBehaviorTabProps {
  availability: BotAvailabilitySettings
  behavior: BotBehaviorSettings
  onAvailabilityChange: (value: BotAvailabilitySettings) => void
  onBehaviorChange: (value: BotBehaviorSettings) => void
}

/**
 * Two questions, one tab: when a live person is reachable, and a handful of
 * small behaviours — kept together because every one of them is a single
 * switch, not a form.
 *
 * The launcher-visibility control that used to sit above these is removed
 * for now (not deleted from the model — `BotVisibilitySettings`/`draft.visibility`
 * still exist and `LivePreview` still reads them; there's just no UI here to
 * change it, so it stays at its default).
 */
export function ChatBehaviorTab({ availability, behavior, onAvailabilityChange, onBehaviorChange }: ChatBehaviorTabProps) {
  function updateBehavior(patch: Partial<BotBehaviorSettings>) {
    onBehaviorChange({ ...behavior, ...patch })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Availability</h3>
        <p className="mt-1 text-xs text-gray-500">
          The AI always answers — this only affects "Talk to an agent". When nobody's available, a visitor is asked
          for an email instead of connecting live.
        </p>
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-gray-100 p-4">
          <SettingToggle
            label="Agents always available"
            description={availability.alwaysAvailable ? undefined : "Off — visitors asking for a person will be asked to leave an email instead."}
            checked={availability.alwaysAvailable}
            onCheckedChange={(alwaysAvailable) => onAvailabilityChange({ ...availability, alwaysAvailable })}
          />
          {!availability.alwaysAvailable && (
            <div className="border-t border-gray-100 pt-3">
              <SettingToggle
                label="Preview as agents online"
                description="No real agent roster is wired in — this is what lets Live Preview show both states."
                checked={availability.previewAgentsOnline}
                onCheckedChange={(previewAgentsOnline) => onAvailabilityChange({ ...availability, previewAgentsOnline })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900">Widget behavior</h3>
        <div className="mt-3 flex flex-col gap-1 divide-y divide-gray-100 rounded-xl border border-gray-100">
          <div className="p-4">
            <SettingToggle
              label="Show agent's photo"
              description="Once a human takes the chat, their avatar replaces the company logo in the header."
              checked={behavior.showAgentAvatarOnHandoff}
              onCheckedChange={(showAgentAvatarOnHandoff) => updateBehavior({ showAgentAvatarOnHandoff })}
            />
          </div>
          <div className="p-4">
            <SettingToggle
              label="Sound notifications"
              description="A short tone plays for the customer when a new reply arrives."
              checked={behavior.soundNotifications}
              onCheckedChange={(soundNotifications) => updateBehavior({ soundNotifications })}
            />
          </div>
          <div className="p-4">
            <SettingToggle
              label="Let customers rate agents"
              description="Adds a star rating to the end-of-chat survey."
              checked={behavior.letCustomersRateAgents}
              onCheckedChange={(letCustomersRateAgents) => updateBehavior({ letCustomersRateAgents })}
            />
          </div>
          <div className="p-4">
            <SettingToggle
              label="Let customers get chat transcripts"
              description="Adds a way to email themselves a copy of the conversation."
              checked={behavior.letCustomersGetTranscripts}
              onCheckedChange={(letCustomersGetTranscripts) => updateBehavior({ letCustomersGetTranscripts })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

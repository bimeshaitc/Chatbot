import type { PostChatFormSettings, PreChatFormSettings } from '../types'
import { SettingToggle } from './SettingToggle'

interface ChatFormsTabProps {
  preChatForm: PreChatFormSettings
  postChatForm: PostChatFormSettings
  onPreChatFormChange: (value: PreChatFormSettings) => void
  onPostChatFormChange: (value: PostChatFormSettings) => void
}

export function ChatFormsTab({ preChatForm, postChatForm, onPreChatFormChange, onPostChatFormChange }: ChatFormsTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-sm font-semibold text-gray-900">Pre-chat form</h3>
        <p className="mt-1 text-xs text-gray-500">Gather a visitor's information before the chat starts.</p>

        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-gray-100 p-4">
          <SettingToggle
            label="Ask before the chat starts"
            checked={preChatForm.enabled}
            onCheckedChange={(enabled) => onPreChatFormChange({ ...preChatForm, enabled })}
          />
          {preChatForm.enabled && (
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
              <SettingToggle
                label="Ask for a name"
                checked={preChatForm.askName}
                onCheckedChange={(askName) => onPreChatFormChange({ ...preChatForm, askName })}
              />
              <SettingToggle
                label="Ask for an email"
                checked={preChatForm.askEmail}
                onCheckedChange={(askEmail) => onPreChatFormChange({ ...preChatForm, askEmail })}
              />
            </div>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Off by default: the widget starts anonymous and only asks for an email later, when a ticket needs one —
          the lower-friction standard. Turn this on only if you specifically need visitor info up front.
        </p>
      </section>

      <section className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900">Post-chat form</h3>
        <p className="mt-1 text-xs text-gray-500">Ask how the chat went once it ends.</p>

        <div className="mt-3 rounded-xl border border-gray-100 p-4">
          <SettingToggle
            label="Ask for feedback after a chat ends"
            description="Whether it resolved things, and a rating if that's on in Chat Behavior."
            checked={postChatForm.enabled}
            onCheckedChange={(enabled) => onPostChatFormChange({ ...postChatForm, enabled })}
          />
        </div>
      </section>
    </div>
  )
}

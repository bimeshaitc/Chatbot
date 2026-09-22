import { useMemo } from 'react'
import { toast } from 'react-toastify'
import { Code2, Copy, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BotSettings } from '../types'

interface InstallationCodeTabProps {
  settings: BotSettings
}

function escape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function buildSnippet({ appearance, content }: BotSettings) {
  return `<!-- Chatbot Widget -->
<script>
  window.chatbotConfig = {
    apiKey: 'YOUR_API_KEY_HERE',
    primaryColor: '${appearance.primaryColor}',
    position: '${appearance.widgetPosition === 'left' ? 'bottom-left' : 'bottom-right'}',
    welcomeMessage: '${escape(content.greetingMessage)}',
    placeholder: 'Type your message...',
    companyName: '${escape(content.companyName)}',
    showBranding: true,
    collectEmail: false,
    autoOpen: false,
    autoOpenDelay: 5000,
  };
</script>
<script src="https://cdn.chatbot.com/widget.js" async></script>
<!-- End Chatbot Widget -->`
}

export function InstallationCodeTab({ settings }: InstallationCodeTabProps) {
  const snippet = useMemo(() => buildSnippet(settings), [settings])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet)
      toast.success('Installation code copied to clipboard')
    } catch {
      toast.error('Could not copy code — please copy it manually')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Code2 className="h-4 w-4" /> Installation Code
        </h2>
        <p className="mt-1 text-xs text-gray-500">Copy and paste this into your website</p>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-gray-900">
        <div className="flex justify-end p-2 sm:absolute sm:top-2 sm:right-2 sm:p-0">
          <Button type="button" size="sm" variant="secondary" onClick={handleCopy} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy Code
          </Button>
        </div>
        <pre className="overflow-x-auto p-4 pt-0 text-xs leading-relaxed text-gray-100 sm:pt-4">
          <code>{snippet}</code>
        </pre>
      </div>

      <div className="flex gap-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <Settings2 className="h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">Installation Instructions</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-blue-800">
            <li>Copy the code snippet above</li>
            <li>Paste it before the closing &lt;/body&gt; tag in your HTML</li>
            <li>Go to your website where you&apos;ve installed the chat widget code. This step is required to activate the widget.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

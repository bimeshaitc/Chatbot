import { useState } from 'react'

interface PreChatFormPanelProps {
  askName: boolean
  askEmail: boolean
  accentColor: string
  onSubmit: (values: { name: string; email: string }) => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Gates the chat behind a name/email before the greeting shows. This is the
 * opt-in version of the flow — off by default in `defaultBotSettings`, since
 * the standard this whole widget follows is to defer identity until a ticket
 * actually needs it. Turning this on is a deliberate trade: it trades some
 * of that lower friction for having contact info from message one.
 */
export function PreChatFormPanel({ askName, askEmail, accentColor, onSubmit }: PreChatFormPanelProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (askName && !name.trim()) {
      setError('Enter your name to continue.')
      return
    }
    if (askEmail && !EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email to continue.')
      return
    }
    onSubmit({ name: name.trim(), email: email.trim() })
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-sm font-medium text-gray-700">Before we start, a couple of details:</p>
      <div className="flex w-full max-w-[240px] flex-col gap-2">
        {askName && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-gray-400"
          />
        )}
        {askEmail && (
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-gray-400"
          />
        )}
        {error && <p className="text-[10px] text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-1 rounded-md px-3 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: accentColor }}
        >
          Start chat
        </button>
      </div>
    </div>
  )
}

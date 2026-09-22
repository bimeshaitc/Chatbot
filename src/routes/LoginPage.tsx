import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceRoleStore } from '@/stores/useWorkspaceRoleStore'
import { PROTOTYPE_VIEWERS } from '@/config/viewer'
import { cn } from '@/lib/utils'

type LoginState = 'idle' | 'redirecting' | 'unavailable'

/**
 * Stub for BE-01 (Mercury 360 OAuth 2.0 + PKCE handoff). There is no real
 * identity provider here, so "Continue with Mercury 360" just simulates the
 * round trip and opens a session for whichever role the header's "Viewing as"
 * switcher is set to — `useWorkspaceRoleStore`/`PROTOTYPE_VIEWERS` stay the
 * source of truth for permissions either way. This exists mainly so Logout
 * has somewhere real to land instead of 404ing, and to give the "Identity
 * service unavailable" edge case a visible state.
 */
export default function LoginPage() {
  const [state, setState] = useState<LoginState>('idle')
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const role = useWorkspaceRoleStore((s) => s.role)

  const handleContinue = () => {
    setState('redirecting')
    window.setTimeout(() => {
      const viewer = PROTOTYPE_VIEWERS[role]
      setSession({
        user: { username: viewer.name, email: `${viewer.agentId}@mercury360.example`, role },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })
      navigate('/')
    }, 700)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1B5E20]/10 text-[#1B5E20]">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-gray-900">Sign in to Chatbot</h1>
          <p className="mt-1 text-sm text-gray-500">
            Chatbot never sees your password — you sign in through Mercury 360.
          </p>
        </div>

        {state === 'unavailable' ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
            <AlertTriangle className="mx-auto h-5 w-5 text-rose-500" />
            <p className="mt-2 text-sm font-medium text-rose-700">Identity service unavailable</p>
            <p className="mt-1 text-xs text-rose-600">
              We couldn't reach Mercury 360, so no session was created. Please try again shortly.
            </p>
            <button
              type="button"
              onClick={() => setState('idle')}
              className="mt-4 text-xs font-medium text-rose-700 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            disabled={state === 'redirecting'}
            className={cn(
              'mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1B5E20]/90 disabled:opacity-70',
            )}
          >
            {state === 'redirecting' ? 'Redirecting to Mercury 360…' : 'Continue with Mercury 360'}
          </button>
        )}

        {state !== 'unavailable' && (
          <button
            type="button"
            onClick={() => setState('unavailable')}
            className="mt-4 w-full text-center text-xs text-gray-400 underline decoration-dotted underline-offset-4 hover:text-gray-500"
          >
            Prototype control: simulate Mercury 360 unavailable
          </button>
        )}
      </div>
    </div>
  )
}

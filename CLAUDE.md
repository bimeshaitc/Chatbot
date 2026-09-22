# CLAUDE.md

Guidance for AI agents (and humans) working in this repo. Read this before making structural changes.

## What this is

React 19 + TypeScript + Vite, feature-based architecture. The admin/customer-facing frontend for **Annapurna Art** (marketplace). Backend: `https://dev-api.annapurnaart.com/api/v1` (OpenAPI spec at `/api-docs-json`).

Stack: react-router-dom v7 · axios + @tanstack/react-query v5 · react-hook-form + yup · zustand · Tailwind v4 · shadcn/ui (Base UI + Nova preset).

## Folder structure

```
src/
  app/            Root component, providers, router, ProtectedRoute, ErrorBoundary wiring
  components/     components/ui (shadcn-owned, see below) and components/layout (app chrome)
  config/         env.ts (env var access), routes.ts (ROUTES path constants)
  features/       One folder per domain: api/ hooks/ components/ schemas/ types/ index.ts
  lib/            Third-party client setup: axios.ts, react-query.ts, utils.ts (shadcn's cn)
  routes/         Route-level page components
  stores/         Zustand stores for global client state (auth, ui)
  utils/          Small pure helpers
```

**Import features only via their barrel** (`@/features/auth`, not `@/features/auth/api/...`) from outside the feature.

## Auth (implemented)

- Login: `POST /user/login` → `{ success, message, data: { accessToken, refreshToken, username, role, balance, ... } }`. See [features/auth/](src/features/auth/).
- Tokens live in [stores/useAuthStore.ts](src/stores/useAuthStore.ts), persisted to localStorage (`auth-storage` key).
- [lib/axios.ts](src/lib/axios.ts) attaches `Authorization: Bearer <accessToken>` on every request; on 401 it refreshes once (single in-flight refresh shared across concurrent 401s) and retries, else logs out.

⚠ **Known gap/assumption**: the API has *no* documented refresh or logout endpoint for the `/user/*` (customer) auth flow — only the `/supplier/*` controller exposes one (`POST /supplier/generate-access-token`, refresh token sent as the `Bearer` header, no body). The refresh logic in `axios.ts` calls that supplier endpoint on the assumption that the backend's JWT refresh is role-agnostic (re-signs whatever JWT is handed to it). **This is unverified — confirm with backend before relying on it in production.** If it turns out not to work, the user is simply logged out on token expiry (no crash), so the failure mode is safe but the "stay logged in" UX won't hold.
- There's also no logout endpoint for `/user/*` — logout is client-side only (clears the store).

## Error handling (implemented)

- **API/query errors**: centralized. [lib/react-query.ts](src/lib/react-query.ts) wires `QueryCache`/`MutationCache` `onError` → `toast.error(getErrorMessage(error))`. [utils/getErrorMessage.ts](src/utils/getErrorMessage.ts) reads the API's `{ message }` error envelope. **Don't add per-hook/per-component error UI for API calls that go through react-query — it'll double up with the global toast.** `<ToastContainer />` lives in [app/provider.tsx](src/app/provider.tsx).
- **Render/runtime crashes**: [components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx), wrapped around the whole app in [app/App.tsx](src/app/App.tsx). Shows a reload prompt instead of a white screen. It does not catch errors in event handlers or async code (React limitation) — those still need try/catch + the toast path above.

## Routing

- Route paths are plain string literals (`/`, `/login`, `/users`) in `router.tsx`, `ProtectedRoute.tsx`, `AppLayout.tsx`, `LoginForm.tsx` — a `ROUTES` path-constants module was tried and deliberately removed; don't reintroduce it.
- [app/ProtectedRoute.tsx](src/app/ProtectedRoute.tsx) gates everything except `/login` behind `useAuthStore().isAuthenticated`, redirecting to `/login`.
- Routes are lazy-loaded (`lazy(() => import(...))`) and wrapped in `Suspense` — follow this pattern for new pages in [app/router.tsx](src/app/router.tsx).

## shadcn/ui — read before touching `components/ui/`

- `components.json` config: Base UI library, "Nova" preset, Tailwind v4, CSS variables in [src/index.css](src/index.css).
- Add components with `npx shadcn@latest add <name>`.
- ⚠ **This filesystem (Windows) is case-insensitive.** shadcn writes lowercase filenames (`button.tsx`). This repo also has hand-rolled PascalCase files in the same folder (`Button.tsx`, `Input.tsx` — pre-dating shadcn). **A `shadcn add` for a name that collides case-insensitively with an existing file silently overwrites it — this already happened once to `Button.tsx` and broke two forms.** Before adding a shadcn component, check `ls src/components/ui/` for a same-name existing file first. Currently `Button.tsx` *is* shadcn's version (adopted, uses `variant`/`size`, not `isLoading`); `Input.tsx` is still hand-rolled and due for the same fate whenever `shadcn add input` is run.
- `cn()` is consolidated at [lib/utils.ts](src/lib/utils.ts) (clsx + tailwind-merge) — there used to be a second, simpler `cn` at `utils/cn.ts`; that's gone, don't recreate it.
- `components/ui/**` is exempted from the `react-refresh/only-export-components` eslint rule (see [eslint.config.js](eslint.config.js)) since shadcn files commonly export a variants helper alongside the component — this is intentional, not a lint gap to "fix" elsewhere.

## Environment

- `.env.example` / `.env`: `VITE_API_URL=https://dev-api.annapurnaart.com/api/v1`. Access only via [config/env.ts](src/config/env.ts), never `import.meta.env` directly.
- ⚠ `.env` is **not** in `.gitignore`. It currently holds no secret (just a public dev API URL), but if real credentials ever land in it, add it to `.gitignore` first.

## Known architectural gaps (not implemented — flag if asked to build on these areas)

- **No test infrastructure.** No Vitest/RTL/Playwright, zero test files. Nothing enforces regressions.
- **No Prettier / lint-staged / husky / CI.** Formatting is whatever eslint allows; nothing runs on commit or push.
- **`features/users` is a demo feature**, not real product functionality — it's the reference implementation the README's "new feature checklist" points to, hitting a `/users` endpoint that doesn't exist on the real backend. Don't assume it reflects real app functionality.
- No proactive token-expiry handling (no JWT decode/timer) — refresh is purely reactive to a 401.
- No 2FA (the supplier auth flow supports it; customer login here doesn't use it).

## Verifying changes

`npx tsc -b`, `npx eslint .`, `npm run build` — run all three before considering a change done. There's no browser automation available in this environment; when a change needs visual/interactive verification, say so explicitly rather than assuming it works.

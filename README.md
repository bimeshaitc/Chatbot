# MercuryDrive

React + TypeScript + Vite, structured as a scalable, feature-based application.

## Stack

- **Routing:** react-router-dom
- **Data fetching:** axios + @tanstack/react-query
- **Forms:** react-hook-form + yup (via @hookform/resolvers)
- **State:** zustand (global/client state only — server state lives in react-query)
- **Styling:** Tailwind CSS

## Folder structure

```
src/
  app/            App shell: root component, providers (react-query), router config
  assets/         Static images/icons
  components/     Shared, reusable, feature-agnostic UI (components/ui) and layout (components/layout)
  config/         Environment variable access (config/env.ts)
  features/       One folder per domain feature (e.g. features/users), each self-contained:
                    api/        axios calls for this feature
                    components/ feature-specific components
                    hooks/      react-query hooks (queries + mutations)
                    schemas/    yup validation schemas
                    types/      feature-local types
                    index.ts    public exports — import features only via this barrel
  hooks/          Shared, cross-feature hooks (e.g. useDebounce)
  lib/            Third-party client setup (lib/axios.ts, lib/react-query.ts)
  routes/         Route-level page components, composed from one or more features
  stores/         Zustand stores for global client state (e.g. useAuthStore, useUIStore)
  types/          Shared, cross-feature TypeScript types
  utils/          Small, pure helper functions (e.g. cn.ts)
```

### Conventions

- **Import features through their barrel** (`@/features/users`), never reach into another feature's internals (`@/features/users/api/...`) from outside that feature.
- **Path alias:** `@/*` maps to `src/*` (configured in `tsconfig.app.json` and `vite.config.ts`).
- **Server state vs. client state:** anything fetched from the API belongs in a react-query hook inside a feature's `hooks/`. Only genuinely global UI/session state (auth, sidebar open/closed, theme) belongs in a zustand store.
- **Forms:** define a yup schema in the feature's `schemas/`, wire it up with `useForm({ resolver: yupResolver(schema) })`.
- **New feature checklist:** create `features/<name>/{api,components,hooks,schemas,types}` + `index.ts`, add a route in `src/routes/` and wire it into `src/app/router.tsx`.

## Environment variables

Copy `.env.example` to `.env` and adjust `VITE_API_URL`. Access env vars only through `src/config/env.ts`, not `import.meta.env` directly.

## Scripts

```
npm run dev       # start dev server
npm run build     # type-check + production build
npm run lint      # eslint
npm run preview   # preview production build
```

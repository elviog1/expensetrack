# AGENTS.md

## Commands

- `npm run dev:all` — starts both Vite dev server + JSON Server (the only command you need)
- `npm run lint` — oxlint (no eslint)
- `npm run build` — `tsc -b && vite build` (must pass both)
- `npm run server` — JSON Server only on port 3001

Always run `npm run lint && npm run build` after edits.

## Architecture

- React 19 + TypeScript + Tailwind CSS v4 + Zustand state + React Router v6
- JSON Server v0.17 as local REST backend (`server/db.json`)
- Vite proxies `/api` → `localhost:3001` with path rewrite (drops `/api` prefix)
- Currency is ARS (`$` prefix, `es-AR` locale, no decimals) — do NOT change to USD
- Dark theme with custom tokens in `src/index.css` `@theme` block (no tailwind.config)

## Critical Gotchas

### JSON Server
- IDs in `server/db.json` **must be strings**. Mixed `number`/`string` IDs break `===` comparisons silently.
- Use **PATCH** for partial wallet updates. PUT replaces the entire resource and destroys fields.
- JSON Server returns items in array order. New items POST to the end.

### Date handling
- `getLocalDateString()` in `src/utils/helpers.ts` — use this for local YYYY-MM-DD dates.
- **Never use** `new Date().toISOString().slice(0, 10)` — it uses UTC and shifts dates back one day in negative UTC offsets (Argentina = UTC-3).
- `formatDate()` appends `T12:00:00` before parsing to avoid the same UTC shift on display.
- All expense/deposit records have a `createdAt: string` (ISO timestamp) used for sort order. Always set it with `new Date().toISOString()`.

### Zustand selectors
- **Never call functions inside selectors**: `useStore((s) => s.allMovements())` creates a new array every render → infinite loop.
- Select the function reference, then call it outside: `const fn = useStore((s) => s.allMovements); fn()`
- If you need a store value to trigger re-renders but don't use it directly, call it bare: `useStore((s) => s.deposits)`

### Tailwind CSS v4
- No `tailwind.config.js`. Theme is defined via `@theme` in `src/index.css`.
- Custom colors: `dark-*`, `accent-*`, `success-*`, `danger-*`, `warning-*`.

## File Structure

- `src/store/index.ts` — Zustand store, all actions and computed getters
- `src/services/api.ts` — REST client for JSON Server
- `src/types/index.ts` — All TypeScript interfaces
- `src/utils/helpers.ts` — `getLocalDateString`, `formatCurrency`, `formatDate`
- `src/pages/DashboardPage.tsx` — Summary cards, category/wallet breakdowns, movement history
- `src/pages/WalletsPage.tsx` — CRUD + deposit modal
- `src/pages/ExpensesPage.tsx` — CRUD + daily/weekly/monthly filters
- `src/components/Layout.tsx` — Sidebar (responsive: icons-only on mobile, full on desktop)
- `server/db.json` — JSON Server data (wallets, categories, expenses, deposits)

# AI Development Rules for This App

This document defines how AI (and humans) should extend and maintain this codebase.

## Tech Stack (overview)
- Next.js 15 (App Router, `app/` directory) with React 19 and Server Components by default
- TypeScript 5 for type safety
- Tailwind CSS v4 for styling (via `@tailwindcss/postcss`)
- Turbopack for dev/build (`npm run dev`/`build`)
- next/font (Geist) for performant font loading
- next/image for optimized images and `public/` for static assets
- ESLint 9 with `eslint-config-next` for linting
- Minimal runtime dependencies to keep the bundle small and fast

## Library and Implementation Rules

### Routing & Pages
- Use the Next.js App Router (files in `app/`) for pages, layouts, metadata, and route groups.
- Prefer Server Components; opt into Client Components only when interactivity is required (`"use client"`).

### Styling & Layout
- Use Tailwind CSS exclusively for styling.
- Keep class names clear; favor composition over deeply-nested custom CSS.
- Only add custom CSS variables or utilities when Tailwind utilities are insufficient.

### Components & UI
- Build small, focused components using React and Tailwind.
- Do not add a UI component library unless explicitly requested.
- If a robust component set is later needed, propose adding shadcn/ui with user approval before installing.

### Forms & Validation
- Use native form elements and React state/refs for simple forms.
- Use built-in browser validation where possible.
- Only introduce form libraries (e.g., react-hook-form) or schema validation (e.g., zod) with explicit approval and a concrete need.

### Icons & Media
- Prefer inline SVG or assets in `public/`.
- Use `next/image` for images to get automatic optimization.
- If an icon library is needed, propose `lucide-react` before adding it.

### Data Fetching & APIs
- Use the native `fetch` API.
- Prefer Server Components and server actions for data access whenever possible.
- Use Next.js Route Handlers (`app/api/.../route.ts`) for server-side endpoints.
- Do not add alternative HTTP clients (e.g., axios) unless strictly necessary.

### State Management
- Prefer local component state (`useState`, `useReducer`) and simple derived state.
- Use React Context sparingly for cross-cutting state; avoid global state libraries unless justified.

### Dates, Numbers, and I18n
- Use built-in `Intl` APIs for formatting.
- Add lightweight utilities (e.g., `date-fns`) only when business requirements demand them.

### Notifications & Feedback
- Prefer inline, accessible UI feedback (text, aria-live regions).
- Only add a toast/notification library upon request and with approval.

### Performance & Accessibility
- Keep dependencies minimal; seek approval before adding any new package.
- Use `next/image`, lazy-loading, and RSC by default to keep performance high.
- Ensure accessible, keyboard-friendly interactions and proper ARIA attributes.

### Testing & Quality
- Follow ESLint recommendations; do not disable rules without justification.
- If tests are requested, propose adding a lightweight setup (e.g., Vitest + Testing Library) for approval.

### Auth, Database, and External Services
- If authentication or a database is required, propose integrating Supabase first and proceed only after approval.
- Keep secrets in environment variables and never commit them.

## General Principles
- Favor simplicity, readability, and small diffs.
- Avoid premature abstractions; extract utilities only after repeated use.
- Document non-obvious decisions directly in the code or in this file.
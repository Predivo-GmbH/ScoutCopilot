# ScoutCopilot

AI-powered football scouting SaaS. Search players with natural language, generate AI reports, compare prospects, and manage watchlists.

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS 4
- Supabase (auth, database, edge functions)
- Claude API (via edge functions)
- Recharts (data visualization)
- Lucide React (icons)

## Setup

```bash
npm install
cp .env.example .env   # Fill in Supabase credentials
npm run dev             # http://localhost:5173
```

## Build & Deploy

```bash
npm run build           # Output in dist/
```

Upload `dist/` contents to Metanet FTP. The `.htaccess` file handles SPA routing.

## Folder Structure

```
src/
  components/
    ui/          # Shared UI primitives (Button, Card, Input, Badge)
    layout/      # AppShell, Sidebar, Header
    charts/      # RadarChart, PercentileBar
  features/
    auth/        # Login, Signup, AuthGuard
    dashboard/   # Dashboard page
    search/      # Natural language player search
    report/      # AI-generated player reports
    comparison/  # Side-by-side player comparison
    watchlists/  # Saved player watchlists
    settings/    # User/org settings
    onboarding/  # New user onboarding
  hooks/         # Custom React hooks
  lib/           # Supabase client, API helpers, utilities
  types/         # TypeScript type definitions
```

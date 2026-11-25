# Organico

Recyclable and organic everyday goods storefront built with Next.js (TypeScript), Tailwind CSS, Supabase (Auth + Postgres), Google AI Studio (`@google/genai`), and Vercel deployment support.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (defaults to `gemini-3.1-flash-lite` with fallback to `gemini-2.5-flash-lite`)
3. Run the database scripts in your Supabase SQL Editor in order:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
4. Enable **Google** under Supabase Authentication Providers and add `http://localhost:3000/auth/callback` (and your Vercel domain `/auth/callback`) to Redirect URLs.
5. Start the development server:
   ```bash
   npm run dev
   ```

## Theme Branches

- `theme/meadow-light-green` — Soft sage and leaf-green palette with an airy centered landing hero.
- `theme/crisp-mint-utility` — Crisp white and emerald palette with a compact quick-filter hero and dense product grid.

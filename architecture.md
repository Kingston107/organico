# Organico — Project Architecture & Developer Guide

Organico is an Indian e-commerce storefront for recyclable and organic everyday products, priced in Indian Rupees (`₹`). It is designed to run smoothly on both laptop/desktop browsers and mobile phones, deploy directly to Vercel, and support installable Progressive Web App (PWA) usage.

---

## 1. Tech Stack Overview

| Layer | Choice | Purpose |
| --- | --- | --- |
| **Frontend & Routing** | Next.js 15 (App Router) + React 19 | File-based pages, Server Components for fast loads, and built-in API endpoints |
| **Language** | TypeScript (`strict: true`) | Compile-time type safety across components, database rows, and API payloads |
| **Styling** | Tailwind CSS v4 + CSS variables | Responsive mobile-first UI with instant theme switching across Git branches |
| **Database & Auth** | Supabase (PostgreSQL + Auth) | Product catalog, user profiles, orders, Google login, email/password, password reset |
| **Shopping Assistant** | `@google/genai` (Gemini Flash-Lite) | Server-side product & checkout assistant with exponential backoff and catalog fallback |
| **Hosting** | Vercel | Zero-config deployment from Git branches |

No third-party data-fetching library (such as TanStack) is used; data loading relies on Next.js Server Components, native `fetch`, and lightweight React Context (`CartContext`, `AuthStatusProvider`).

---

## 2. Folder & File Structure

```text
d:\Leesha\
├── public/
│   ├── icons/
│   │   ├── icon-192.svg          # App icon for PWA install (192x192)
│   │   └── icon-512.svg          # App icon for PWA install (512x512)
│   ├── images/products/          # Verified local product photographs (14 active items)
│   └── sw.js                     # Minimal service worker enabling PWA installability
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── assistant/route.ts # POST /api/assistant — server-only Gemini + fallback guide
│   │   │   └── orders/route.ts    # POST /api/orders — server-validated guest & member checkout
│   │   ├── auth/callback/route.ts # GET /auth/callback — Google OAuth & password reset handler
│   │   ├── checkout/page.tsx      # /checkout — Guest & signed-in checkout + order receipt
│   │   ├── forgot-password/page.tsx # /forgot-password — Request password reset email
│   │   ├── login/page.tsx         # /login — Welcome to Organico sign-in + Google + Sign Up link
│   │   ├── products/
│   │   │   ├── page.tsx           # /products — Full filterable catalog (category, ₹ budget, search)
│   │   │   └── [slug]/page.tsx    # /products/[slug] — Product details + JSON-LD structured data
│   │   ├── profile/page.tsx       # /profile — Saved delivery address & personal order history
│   │   ├── reset-password/page.tsx# /reset-password — Set new password after email link
│   │   ├── signup/page.tsx        # /signup — New account registration + Google sign-up
│   │   ├── error.tsx              # App error boundary fallback UI
│   │   ├── globals.css            # Theme CSS variables + Tailwind base styles
│   │   ├── layout.tsx             # Shared shell: Header, Footer, Cart & Auth providers, AI drawer
│   │   ├── loading.tsx            # Loading skeleton UI during navigation
│   │   ├── manifest.ts            # /manifest.webmanifest — PWA metadata
│   │   ├── not-found.tsx          # 404 page
│   │   └── page.tsx               # / — Home landing hero + product showcase
│   ├── components/
│   │   ├── AuthStatusProvider.tsx # Tracks signed-in user state for conditional Login vs Profile
│   │   ├── CartContext.tsx        # Persistent localStorage shopping bag & ₹ totals
│   │   ├── CatalogBrowser.tsx     # Interactive category, search, and ₹ price-range grid
│   │   ├── HomeHeroTrigger.tsx    # Opens the side-panel shopping assistant from the hero
│   │   ├── ProductCard.tsx        # Reusable card with product photo, material badge, ₹ price, Add
│   │   ├── ProductDetailView.tsx  # Product detail quantity selector & add-to-bag controls
│   │   ├── SideAssistantDrawer.tsx# Slide-over shopping assistant (desktop panel / mobile sheet)
│   │   ├── StoreFooter.tsx        # Installable Web App (PWA) card + unified footer navigation
│   │   └── StoreHeader.tsx        # Unified Home / Products / Checkout header + conditional Login/Profile
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client (returns null cleanly if env vars unset)
│   │   │   └── server.ts          # Server Supabase SSR cookie client
│   │   ├── catalog.ts             # Initial 14 products, categories, ₹ formatting, shipping math
│   │   ├── gemini.ts              # Grounded prompt builder, @google/genai, exponential backoff, fallback
│   │   └── products-server.ts     # Reads products from Supabase Postgres with safe fallback
│   └── types/
│       └── store.ts               # Shared TypeScript interfaces (Product, CartItem, OrderSummary, etc.)
├── supabase/
│   ├── schema.sql                 # Database tables + strict Row Level Security (RLS) policies
│   └── seed.sql                   # Seeds all 14 products in Indian Rupees (₹)
├── .env.example                   # Template of required environment variables
└── README.md                      # Quick setup guide
```

---

## 3. Navigation & User Flows

### Unified Navigation
- **Top Header (`StoreHeader.tsx`):**
  - Left: Organico leaf logo + **Home** (`/`) + **Products** (`/products`)
  - Right: **Ask Assistant** drawer trigger, conditional **Login** (`/login` when signed out) or **Profile** (`/profile` when signed in), and **Checkout** (`/checkout`) with live bag count.
  - Mobile: Collapses cleanly into a touch-friendly menu drawer.
- **Footer (`StoreFooter.tsx`):**
  - Lower-section **Get the Organico Web App** banner with **Download Web App** button (`beforeinstallprompt` + iOS/Android instructions).
  - Footer links match the header: **Home**, **Products**, **Checkout**.

### Authentication Flows (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/profile`)
1. **Sign In (`/login`):** Heading **Welcome to Organico**, **Username or email**, **Password**, **or** divider, **Continue with Google**, inline **Forgot password?** and **Continue as guest ->** links, **Sign In** button, and a **Create Account (Sign Up)** button linking to `/signup`.
2. **Sign Up (`/signup`):** Full name, Email, Password, Confirm Password, **Continue with Google**, and **Create Account** button.
3. **Google OAuth & Password Reset (`/auth/callback`):** Exchanges the Supabase auth code for an HTTP cookie session and redirects safely to `/profile` or `/reset-password`.

### Checkout Flow (`/checkout` & `POST /api/orders`)
- Supports both **Guest Checkout** (name, email, 10-digit mobile number, address, city, state, 6-digit PIN code) and **Signed-In Checkout** (auto-fills saved profile details).
- Payment options: **UPI**, **Card**, or **Cash on Delivery**.
- **Server-side Price Integrity:** `/api/orders` never trusts browser prices—it recalculates every line item's `₹` unit price, subtotal, shipping (`₹49` flat, or free on orders of `₹799+`), and total from the server catalog before writing to `orders` and `order_items`.

---

## 4. Database Schema & Row Level Security (`supabase/schema.sql`)

| Table | Purpose | Row Level Security (RLS) |
| --- | --- | --- |
| `public.products` | Stores the 14 recyclable/organic items, `₹` prices, stock, and image paths | Publicly readable (`SELECT` allowed for everyone); no public writes |
| `public.profiles` | Stores user delivery name, phone, and address (`id` references `auth.users`) | Strict isolation: users can only `SELECT`, `INSERT`, `UPDATE`, or `DELETE` where `auth.uid() = id` |
| `public.orders` | Stores guest and member orders (`order_number`, shipping address, `₹` totals) | Users can only `SELECT` their own orders (`auth.uid() = user_id`); guest orders (`user_id is null`) are never readable via browser client |
| `public.order_items` | Line items linked to `orders` and `products` | Inherits ownership from `public.orders` on both `INSERT` and `SELECT` |

---

## 5. Side-Panel Shopping Assistant (`src/lib/gemini.ts` & `/api/assistant`)

- **API Key Safety:** The frontend only calls `POST /api/assistant`. `GEMINI_API_KEY` stays strictly on the server.
- **Grounded Prompt (`buildAssistantSystemPrompt`):** Injects every product's exact name, category, material badge, `₹` price, stock count, description, and sustainability note along with checkout/shipping rules so the assistant answers product and payment questions accurately without inventing items or mentioning internal tech.
- **Resilient Retries & Fallback:**
  - Uses `@google/genai` with `GEMINI_MODEL` (defaults to `gemini-3.1-flash-lite`) and secondary model `gemini-2.5-flash-lite`.
  - Wraps calls in **exponential backoff with jitter** (500 ms -> 1000 ms -> 2000 ms + random jitter, 12 s per-attempt timeout) on transient `429`, `5xx`, `RESOURCE_EXHAUSTED`, or `UNAVAILABLE` errors.
  - If all model attempts are unavailable or no API key is configured, `buildLocalCatalogFallback()` still returns accurate `₹` product matches and checkout instructions.

---

## 6. Dual Theme Git Branches

Both branches share identical backend APIs, database queries, catalog items, authentication, and checkout logic:

- **`theme/meadow-light-green`** (and `master`): Soft sage (`#F2F9F4`) and leaf-green (`#237A4B`) palette, airy centered landing hero, and rounded (`14px`) product cards.
- **`theme/crisp-mint-utility`**: Crisp white (`#FFFFFF`) and emerald (`#059669`) palette, compact top strip, `10px` cards, and immediate filterable product grid on the home page.

Switch locally with:
```bash
git checkout theme/meadow-light-green
# or
git checkout theme/crisp-mint-utility
```

---

## 7. Environment Variables & Deployment (`.env.local` / Vercel)

Required keys (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon / publishable key
- `GEMINI_API_KEY` — Google AI Studio API key (server-side only)
- `GEMINI_MODEL` — Optional (`gemini-3.1-flash-lite` by default)

For **Vercel**, connect either theme branch, add these four environment variables in Project Settings, and add `https://<your-vercel-domain>/auth/callback` to Supabase Authentication Redirect URLs.

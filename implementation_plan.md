# 🎀 PINS — Chibi Character Pin Customization App
### Extremely Detailed Implementation Plan

> [!IMPORTANT]
> **✅ APPROVED — Final decisions recorded below. Execution complete.**

---

## Overview

**PINS** is a full-stack kawaii-themed web app that lets users design their own custom chibi character pin by selecting pre-made layered assets (hair, clothes, accessories, etc.), preview the result in real-time, and submit an order request. An admin panel allows the shop owner to upload/manage assets and track all orders through a status pipeline.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + TypeScript (Vite 8) |
| Styling | TailwindCSS v4 + custom kawaii theme |
| Animations | Framer Motion |
| Canvas/Rendering | React-Konva (HTML5 Canvas layered rendering) |
| Backend / DB | Supabase (PostgreSQL + Storage + Auth + Realtime) |
| Image Export | Konva `toDataURL()` → PNG upload to Supabase Storage |
| Deployment | Vercel (frontend) + Supabase (hosted backend) |
| Fonts | Fredoka, Baloo 2, Nunito (Google Fonts) |

---

## Project Folder Structure

```
pins-app/
├── public/
│   └── index.html
├── src/
│   ├── assets/                  # Static local assets (hero.png, svgs, etc.)
│   ├── components/
│   │   ├── ui/                  # Reusable UI primitives (Button, Card, Badge, Modal)
│   │   ├── creator/             # Character creator components
│   │   │   ├── CharacterCanvas.tsx
│   │   │   ├── CategoryPanel.tsx
│   │   │   ├── AssetGrid.tsx
│   │   │   ├── LayerPreview.tsx ✅
│   │   │   └── OrderModal.tsx
│   │   ├── admin/               # Admin panel components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── OrderTable.tsx
│   │   │   ├── AssetUploader.tsx
│   │   │   ├── AssetManager.tsx
│   │   │   └── OrderStatusBadge.tsx ✅
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── SparkleBackground.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CreatorPage.tsx
│   │   ├── OrderSuccessPage.tsx
│   │   ├── NotFoundPage.tsx ✅
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx
│   │       ├── AdminOrdersPage.tsx
│   │       └── AdminAssetsPage.tsx
│   ├── hooks/
│   │   ├── useAssets.ts
│   │   ├── useOrders.ts
│   │   └── useAdmin.ts
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client init
│   │   ├── storage.ts           # Storage helpers
│   │   └── konva-export.ts      # Canvas → PNG export util
│   ├── store/
│   │   └── characterStore.ts    # Zustand global state for character
│   ├── types/
│   │   └── index.ts             # All shared TypeScript interfaces
│   ├── utils/
│   │   ├── layerOrder.ts        # Layer z-index definitions
│   │   └── formatters.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── setup.sql                # Complete SQL migration (all tables + RLS + seed)
├── .env.local
├── vite.config.ts
└── package.json
```

---

## Database Schema (Supabase PostgreSQL)

### Table: `asset_categories`

Stores the category types (hair, clothes, etc.).

```sql
CREATE TABLE asset_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,          -- e.g. "Hair", "Clothes"
  slug        TEXT NOT NULL UNIQUE,          -- e.g. "hair", "clothes"
  layer_order INTEGER NOT NULL,              -- z-index in rendering stack
  icon        TEXT,                          -- emoji or icon name
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Seeded categories (in layer order):**

| slug | name | layer_order |
|---|---|---|
| `background` | Background | 0 |
| `pendants` | Pendants | 1 |
| `base` | Base | 2 |
| `eyes` | Eyes | 3 |
| `eyebrows` | Eyebrows | 4 |
| `mouth` | Mouth | 5 |
| `hair` | Hair | 6 |
| `clothes` | Clothes | 7 |
| `glasses` | Glasses | 8 |
| `accessories` | Accessories | 9 |

---

### Table: `assets`

Stores individual asset metadata.

```sql
CREATE TABLE assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES asset_categories(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  file_url      TEXT NOT NULL,              -- Supabase Storage public URL
  storage_path  TEXT NOT NULL,             -- internal storage bucket path
  thumbnail_url TEXT,                      -- optional pre-generated thumbnail
  tags          TEXT[],                    -- e.g. ['cute', 'long', 'wavy']
  gender        TEXT DEFAULT 'unisex',     -- 'male' | 'female' | 'unisex'
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast category lookups
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_active ON assets(is_active);
```

---

### Table: `orders`

Stores customer order submissions.

```sql
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT UNIQUE NOT NULL,        -- e.g. "PINS-2024-0001"
  full_name         TEXT NOT NULL,
  facebook_name     TEXT,
  facebook_link     TEXT,
  contact_number    TEXT NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1,
  notes             TEXT,
  status            TEXT NOT NULL DEFAULT 'pending',
  -- status options: pending | accepted | in_production | ready_for_pickup | completed | cancelled
  character_config  JSONB NOT NULL,              -- full character state snapshot
  preview_image_url TEXT,                        -- URL to saved PNG in Supabase Storage
  total_price       NUMERIC(10,2),               -- optional future use
  date_ordered      TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for order listing
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(date_ordered DESC);
```

`character_config` JSONB example:
```json
{
  "base": "asset-uuid-123",
  "eyes": "asset-uuid-456",
  "eyebrows": "asset-uuid-789",
  "mouth": "asset-uuid-012",
  "hair": "asset-uuid-345",
  "clothes": "asset-uuid-678",
  "glasses": null,
  "accessories": ["asset-uuid-901", "asset-uuid-234"],
  "background": "asset-uuid-567",
  "pendants": null
}
```

---

### Table: `order_items`

For future multi-character orders (e.g. couple pins).

```sql
CREATE TABLE order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  character_config JSONB NOT NULL,
  preview_image_url TEXT,
  quantity         INTEGER NOT NULL DEFAULT 1,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Supabase Storage Buckets

| Bucket | Path Pattern | Access |
|---|---|---|
| `assets` | `assets/{category-slug}/{filename}` | Public |
| `previews` | `previews/{order-id}/preview.png` | Public |

**Storage policies:**
- `assets` bucket → public read, admin-only write (via service role key)
- `previews` bucket → public read, anonymous insert (for order submission)

---

## TypeScript Types (`src/types/index.ts`)

```typescript
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_production'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export interface AssetCategory {
  id: string;
  name: string;
  slug: string;
  layer_order: number;
  icon: string;
  is_active: boolean;
}

export interface Asset {
  id: string;
  category_id: string;
  category?: AssetCategory;
  name: string;
  slug: string;
  file_url: string;
  thumbnail_url?: string;
  tags?: string[];
  gender: 'male' | 'female' | 'unisex';
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CharacterConfig {
  base?: string | null;
  eyes?: string | null;
  eyebrows?: string | null;
  mouth?: string | null;
  hair?: string | null;
  clothes?: string | null;
  glasses?: string | null;
  accessories?: string | null;   // single-select
  pendants?: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  full_name: string;
  facebook_name?: string;
  facebook_link?: string;
  contact_number: string;
  quantity: number;
  notes?: string;
  status: OrderStatus;
  character_config: CharacterConfig;
  preview_image_url?: string;
  date_ordered: string;
  updated_at: string;
}

export interface OrderFormData {
  full_name: string;
  facebook_name: string;
  facebook_link: string;
  contact_number: string;
  quantity: number;
  notes: string;
}
```

---

## Layer Rendering System

### Layer Order (z-index, bottom → top)

```
0. Background   (static color/pattern PNG)
1. Pendants     (hanging charms, decorative elements)
2. Base         (body shape — male or female chibi)
3. Eyes         (eye style)
4. Eyebrows     (brow style)
5. Mouth        (expression/lip style)
6. Hair         (full hair asset, includes front + back)
7. Clothes      (outfit layer)
8. Glasses      (eyewear, optional)
9. Accessories  (hats, bows, ears — multiple allowed)
```

### `CharacterCanvas.tsx` — React-Konva Rendering

```
<Stage width={500} height={500} ref={stageRef}>
  <Layer>
    {resolvedLayers.map((layer) => (
      <KonvaImage
        key={layer.slug}
        image={layer.imageElement}   // preloaded HTMLImageElement
        x={0}
        y={0}
        width={500}
        height={500}
      />
    ))}
  </Layer>
</Stage>
```

**Image Preloading Strategy:**
- Each asset URL is preloaded using `new Image()` and stored in a `Map<assetId, HTMLImageElement>` cache
- On character config change → diff the new vs cached IDs → only load new images
- All PNGs must be transparent (RGBA) and exactly **500×500px** (or configurable canvas size)
- Images are cached in memory for the session; no re-fetching

**Export to PNG (with watermark):**
```typescript
// konva-export.ts
// Before export, a Konva.Text layer is temporarily added:
//   text: "Wesleyan Supreme Student Council"
//   position: bottom-center, semi-transparent white
//   font: Fredoka, 14px
export async function exportCanvasToPng(stageRef): Promise<Blob> {
  const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 }); // 2x = 1000x1000
  const response = await fetch(dataUrl);
  return response.blob();
}
```

---

## State Management (Zustand)

### `characterStore.ts`

```typescript
interface CharacterStore {
  config: CharacterConfig;
  setLayer: (category: string, assetId: string | null) => void;
  toggleAccessory: (assetId: string) => void;
  resetCharacter: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}
```

- `setLayer` → replaces single-choice layers (hair, base, clothes, etc.)
- `toggleAccessory` → single-select only (replaces previous accessory selection)
- Config is stored in Zustand, persisted to `localStorage` via `persist` middleware (so refresh doesn't lose work)

---

## Component Architecture

### `CreatorPage.tsx`

```
┌────────────────────────────────────────────────────────────┐
│  Header (Logo + Nav)                                       │
├─────────────────────────┬──────────────────────────────────┤
│  CategoryPanel          │   CharacterCanvas (large)        │
│  ─────────────          │   ──────────────────────         │
│  [Base] [Hair] [Clothes]│   [Konva Stage 500×500]          │
│  [Eyes] [Brows] [Mouth] │                                  │
│  [Glasses] [Accessories]│   [ ✨ Place Order Button ]      │
│                         │                                  │
│  AssetGrid              │   LayerPreview (mini stack list) │
│  ────────────           │                                  │
│  [asset] [asset] ...    │                                  │
└─────────────────────────┴──────────────────────────────────┘
```

### `CategoryPanel.tsx`

- Renders category pills/tabs from `asset_categories` table
- Highlights active category
- Shows category icon + name
- Animated selection with Framer Motion `layoutId`

### `AssetGrid.tsx`

- Fetches assets for the active category from Supabase
- Renders `AssetCard` per asset
- Highlights currently selected asset
- Supports filter by gender (male/female/all)
- Lazy-loads images with intersection observer
- "None / Remove" option always shown first (to deselect)

### `OrderModal.tsx`

- Full-screen modal with form fields
- Captures PNG preview via `exportCanvasToPng` before submit
- Uploads preview PNG to Supabase Storage (`previews/` bucket)
- Submits order to `orders` table
- Shows success animation (confetti / sparkles) on completion

---

## Admin Panel

### Authentication

- Supabase Auth (Email + Password)
- Admin route `/admin` protected by `<RequireAuth>` wrapper
- On login, session stored in Supabase client automatically
- Admin users seeded manually in Supabase Auth dashboard

### Admin Routes

| Path | Component | Purpose |
|---|---|---|
| `/admin` | `AdminDashboardPage` | Overview stats |
| `/admin/orders` | `AdminOrdersPage` | Order list + status management |
| `/admin/assets` | `AdminAssetsPage` | Upload / delete / reorder assets |
| `/admin/login` | `AdminLoginPage` | Login form |

### `AdminOrdersPage.tsx`

- Data table with columns: Order ID, Customer Name, Character Preview (thumbnail), Quantity, Date, Status
- Status filter tabs (All / Pending / Accepted / etc.)
- Click row → expand to show full character config + large preview
- Inline status dropdown → updates `orders.status` in Supabase
- Export to CSV button (future)

### `AssetUploader.tsx`

- Drag-and-drop file zone (accepts PNG, SVG)
- Fields: Name, Category (dropdown), Gender tag, Sort Order
- On upload:
  1. Upload file to Supabase Storage → `assets/{category-slug}/{uuid-filename}`
  2. Get public URL from storage
  3. Insert record into `assets` table
  4. Asset immediately appears in creator
- Bulk upload support (multiple files at once)
- Progress bar per file

### `AssetManager.tsx`

- Lists all assets grouped by category
- Toggle `is_active` to hide/show from public
- Drag-to-reorder (updates `sort_order`)
- Delete → removes DB record + Storage file
- Edit name / tags inline

---

## Routing (`App.tsx`)

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/create" element={<CreatorPage />} />
    <Route path="/order-success" element={<OrderSuccessPage />} />
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route element={<RequireAuth />}>
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      <Route path="/admin/assets" element={<AdminAssetsPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

---

## Order Flow (Step-by-Step)

```
1. User opens /create
2. Selects Base (male or female chibi body)
3. Customizes each category (hair, eyes, clothes, etc.)
4. Character canvas updates in real-time
5. User clicks "✨ Place Order"
6. OrderModal opens
7. User fills in: Full Name, FB Name/Link, Contact, Quantity, Notes
8. User clicks "Submit Order"
9. App:
   a. Calls exportCanvasToPng() → gets PNG Blob
   b. Uploads PNG to Supabase Storage: previews/{uuid}/preview.png
   c. Gets preview_image_url from storage
   d. Generates order_number: "PINS-YYYYMMDD-XXXX"
   e. Inserts order record into `orders` table
   f. Navigates to /order-success with order number
10. Admin sees new order in dashboard with Pending status
```

---

## UI Design System

### TailwindCSS Custom Theme (`tailwind.config.ts`)

```typescript
theme: {
  extend: {
    colors: {
      pastel: {
        pink:   '#FFD6E8',
        purple: '#E8D9FF',
        blue:   '#D8EEFF',
        mint:   '#D8F3DC',
        cream:  '#FFF8F0',
      },
      accent: {
        rose:   '#FF85A1',
        violet: '#B07FFF',
        sky:    '#5BBCFF',
        sage:   '#52B788',
      }
    },
    fontFamily: {
      fredoka: ['Fredoka', 'sans-serif'],
      baloo:   ['Baloo 2', 'sans-serif'],
      nunito:  ['Nunito', 'sans-serif'],
    },
    borderRadius: {
      '4xl': '2rem',
      '5xl': '2.5rem',
    },
    boxShadow: {
      kawaii: '0 4px 24px rgba(255, 133, 161, 0.25)',
      card:   '0 2px 16px rgba(176, 127, 255, 0.15)',
    },
    animation: {
      float:    'float 3s ease-in-out infinite',
      sparkle:  'sparkle 1.5s ease-in-out infinite',
      wiggle:   'wiggle 0.5s ease-in-out',
      'fade-up': 'fadeUp 0.4s ease-out',
    }
  }
}
```

### Sparkle Background Component

- Renders 15-20 small sparkle SVGs (✦ ✧ ⋆ ✨) at random positions
- Framer Motion `animate` loops opacity 0→1→0 with random delays
- Fixed position, `pointer-events: none`, z-index behind content

### Button Variants

| Variant | Style |
|---|---|
| Primary | `bg-accent-rose text-white rounded-full shadow-kawaii hover:scale-105` |
| Secondary | `bg-pastel-purple text-purple-800 rounded-full` |
| Ghost | `border-2 border-accent-rose text-accent-rose rounded-full` |
| Admin | `bg-accent-violet text-white rounded-lg` |

---

## Framer Motion Animations

| Interaction | Animation |
|---|---|
| Category tab switch | `layoutId="tab-indicator"` sliding underline |
| Asset grid load | `staggerChildren` — each card fades up with 50ms delay |
| Asset select | Scale pulse `scale: [1, 1.15, 1]` + ring highlight |
| Canvas update | Smooth crossfade via opacity transition |
| Modal open/close | `y: 100 → 0`, backdrop fade |
| Order success | Confetti burst + bouncing checkmark |
| Page transitions | Fade + slight translateY on route change |
| Admin row expand | `AnimatePresence` height expand |

---

## Environment Variables (`.env.local`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CANVAS_SIZE=500
VITE_ADMIN_EMAIL=admin@example.com
```

> [!CAUTION]
> Never commit `.env.local` to git. The service role key (for admin storage writes) should only be used server-side or in Supabase Edge Functions — never in the browser.

---

## Supabase Edge Functions (Optional / Phase 2)

| Function | Purpose |
|---|---|
| `generate-order-number` | Atomic sequence generation for PINS-YYYYMMDD-XXXX |
| `notify-admin` | Send email/SMS to admin on new order (Resend/Twilio) |
| `delete-asset` | Safely delete from both storage + DB atomically |

---

## Scalability Considerations

- **Hundreds of assets**: The `assets` table with indexes handles thousands of rows. The `AssetGrid` uses virtual scrolling (react-virtual) once asset counts exceed ~100 per category.
- **New categories**: Admin can add new `asset_categories` rows; the creator UI auto-renders them — no code changes needed.
- **Multiple accessories**: The `accessories` field in `CharacterConfig` is an array, supporting multiple concurrent overlays.
- **Asset versioning**: `updated_at` timestamps on assets allow cache invalidation.
- **CDN**: Supabase Storage serves assets via a globally distributed CDN out of the box.

---

## Phase Execution Roadmap

### Phase 1 — Project Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Install dependencies (Tailwind v4, Framer Motion, React-Konva, Zustand, Supabase JS)
- [x] Configure TailwindCSS with kawaii theme (via `@theme` directive in `index.css` — Tailwind v4)
- [x] Set up Google Fonts (Fredoka, Baloo 2, Nunito)
- [x] Create `.env.local` with Supabase placeholders

### Phase 2 — Database & Storage
- [x] Write SQL migrations (single `setup.sql` with all 4 tables)
- [x] Define storage buckets (`assets`, `previews`) with RLS policies
- [x] Seed asset_categories with default layer order
- [x] Set up Supabase Auth schema (admin user via Supabase Auth UI)
- [x] Configure Row Level Security (RLS) policies in SQL

### Phase 3 — Core UI Components
- [x] Build design system (Button, Card, Badge, Modal, Input, Textarea)
- [x] Build SparkleBackground
- [x] Build Header + Footer
- [x] Build HomePage (hero section, feature cards, how-it-works, CTA)
- [x] Build NotFoundPage (extracted to separate file)

### Phase 4 — Character Creator
- [x] Build CharacterCanvas (React-Konva layered rendering with image cache)
- [x] Build image preload cache (in-memory `Map<string, HTMLImageElement>`)
- [x] Build Zustand characterStore with `persist` middleware
- [x] Build CategoryPanel (animated tabs with Framer Motion `layoutId`)
- [x] Build AssetGrid (skeleton loaders, selection highlight, none/remove option)
- [x] Build LayerPreview (layer stack visualization — mini list of selected layers)
- [x] Build OrderModal (form + react-hook-form validation + PNG export + Supabase insert)
- [x] Build OrderSuccessPage (order number display + next steps)

### Phase 5 — Admin Panel
- [x] Build AdminLoginPage (email/password form)
- [x] Build RequireAuth guard (session check with Supabase)
- [x] Build AdminLayout (sidebar nav with responsive hamburger)
- [x] Build AdminDashboardPage (stats cards + quick links)
- [x] Build AdminOrdersPage (data table + status filter tabs + inline status update)
- [x] Build OrderStatusBadge (interactive status badge with dropdown)
- [x] Build AssetUploader (drag-drop zone + bulk upload + per-file fields)
- [x] Build AssetManager (grid view + delete confirm + toggle active)

### Phase 6 — Polish & Deploy
- [x] Framer Motion animations throughout (stagger, spring, AnimatePresence)
- [x] Responsive layout (mobile-first, works 375px–1920px)
- [x] Loading states (shimmer skeletons) + error boundaries
- [ ] **Deploy**: Set up Supabase project with real credentials — `.env.local` currently has placeholder values
- [ ] **Deploy**: Deploy to Vercel or preferred host

---

## ✅ Final Decisions

| Question | Decision |
|---|---|
| Canvas size | **500×500px** only |
| Accessories | **Single select** — one accessory at a time |
| Pricing | **No price** — order collection only |
| Background | **Fixed white** background (not selectable) |
| Mobile | **Mobile-first priority** |
| Social sharing | **No sharing** — preview only, with watermark |
| Watermark text | **"Wesleyan Supreme Student Council"** — rendered on canvas before PNG export |

## 📝 Intentional Deviations (Plan vs Actual)

The following changes were made during implementation, diverging from the original plan:

| Aspect | Planned | Actual | Reason |
|--------|---------|--------|--------|
| Tailwind version | v3 with `tailwind.config.ts` | **v4** with `@theme` in `index.css` | Vite 8 template ships with Tailwind v4; cleaner config |
| Layer order | `background` (0) → `pendants` (1) → ... → `accessories` (9) | Starts at `base: 0`, no background layer | Background is always white canvas; simplified |
| Accessories type | `string[]` (multi-select array) | `string \| null` (single-select) | Per final decision — simplifies UI and store |
| `OrderStatusBadge` | Separate file in admin folder | **Created ✅** as standalone component | Was previously embedded in `Badge.tsx` |
| `LayerPreview` | Listed in folder structure | **Created ✅** | Shows selected layer stack in creator page |
| `NotFoundPage` | Separate page file | **Created ✅** | Was inline in `App.tsx`, extracted for cleanliness |
| `useCharacterState` hook | Separate hook file | Not needed | Zustand store handles all character state directly |
| SQL migrations | Split into 4 files in `supabase/migrations/` | Single `supabase/setup.sql` | Simpler to manage for a single-deployment project |
| `total_price` on orders | Included in schema | **Not included** | Price collection not required per final decision |
| Env vars | `VITE_CANVAS_SIZE`, `VITE_ADMIN_EMAIL` | Only Supabase URL + anon key | Canvas size is hardcoded; admin email is in Auth UI |

---

## Verification Plan

### Automated
- `npm run build` — TypeScript type checking + Vite production build
- Supabase local dev via `supabase start` for integration testing

### Manual
- Upload a test set of 3–5 transparent PNGs via admin panel → verify they appear in creator
- Select all layer categories → verify correct z-order on canvas
- Export PNG → verify high-res output saved to `previews/` bucket
- Submit a test order → verify record in `orders` table with correct `character_config` JSON
- Update order status in admin → verify real-time update
- Test admin auth guard → unauthenticated access to `/admin` redirects to login


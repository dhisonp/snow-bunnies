Based on the project knowledge, here's an implementation plan:

---

## Implementation Plan

### 1. Trip Brief Cooldown (1 day)

**Files to modify:**

- `lib/storage.ts` — add timestamp check to `getTripBrief()` / `saveTripBrief()`
- `components/ResortCard/hooks/useTripBrief.ts` — add cooldown logic before
  regeneration

**Approach:**

- Store `generatedAt` timestamp with cached brief (already exists in `TripBrief`
  type)
- In `useTripBrief.generateBrief()`, check if cached brief is < 24 hours old
- If within cooldown: return cached, disable refresh button, show "refresh
  available in X hours"
- Add optional `forceRefresh?: boolean` param that bypasses cooldown (for edge
  cases)

---

### 2. Mobile Fixes

#### 2a. About Page Navbar

**Files:** `app/about/page.tsx` or header component

**Fix:**

- Add `flex-wrap` to navbar container
- Add vertical spacing between title row and links row
- Add `gap-x-4` minimum between link items

---

#### 2b. Imperial Temperature Layout

**Files:** `components/WeatherForecast.tsx`

**Fix:**

- Increase min-width on temperature display container (e.g., `min-w-[4ch]` →
  `min-w-[5ch]`)
- Or use `tabular-nums` for consistent number width
- Test with extreme values: `-40°F`, `100°F`

---

#### 2c. Modal Padding

**Files:** `components/ui/dialog.tsx` or `TripForm.tsx`

**Fix:**

- Add horizontal margin to dialog: `mx-4` on mobile
- Reduce inner padding: `p-6` → `p-4` on mobile breakpoint
- CSS example: `@apply mx-4 sm:mx-auto p-4 sm:p-6`

---

#### 2d. Date/Buttons Layout Clash

**Files:** `components/ResortCard.tsx` (header section)

**Fix:**

- Make header a `flex-wrap` container
- Date on its own line at small screens
- Buttons row below
- Or: collapse buttons into overflow menu on mobile

---

### 3. Link Previews (Open Graph)

**Files to create/modify:**

- `app/layout.tsx` — add metadata export
- Create `app/opengraph-image.tsx` or add static `/public/og-image.png`

**Implementation:**

```tsx
// app/layout.tsx
export const metadata = {
  title: "Snowbunny",
  description: "Plan ski trips with weather, crowds, and AI insights",
  openGraph: {
    title: "Snowbunny",
    description: "Plan ski trips with weather, crowds, and AI insights",
    images: ["/og-image.png"],
  },
};
```

**Image specs:** 1200×630px, simple branded graphic

---

## Priority Order

1. **Link previews** — quickest win, high visibility
2. **Modal padding** — small CSS change
3. **Date/buttons layout** — prevents visual breakage
4. **Temperature layout** — small CSS fix
5. **About page navbar** — minor styling
6. **Trip Brief cooldown** — most logic involved

Want me to implement any of these?

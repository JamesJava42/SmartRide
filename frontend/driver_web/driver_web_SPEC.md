# RideConnect driver_web — Living Spec
> Claude Code: Read this entire file before making any changes.
> Never modify anything marked LOCKED without explicit instruction.
> Only work on sections marked IN PROGRESS or PENDING.

---

## How to use this file

- **LOCKED** — approved, tested, do not change
- **IN PROGRESS** — currently being built
- **PENDING** — not started, do not touch yet
- **BROKEN** — known issue, fix is described

When you finish a task, update the status of the relevant section.

---

## Tech stack (LOCKED)

- React 18, TypeScript, Vite
- CSS Modules (.module.css) — no Tailwind, no MUI
- React Router v6
- TanStack Query v5
- Plus Jakarta Sans (Google Fonts)
- lucide-react for icons
- Backend: FastAPI at `import.meta.env.VITE_API_BASE_URL`
- Auth token: `localStorage` key `rc_driver_token`

---

## Design tokens (LOCKED — never override)

File: `src/styles/tokens.css`

```
--green-700: #1A6B45
--green-50:  #EDF9F2
--bg:        #F4F5F2 (page background grey)
--card:      #FFFFFF
--border:    #E2E5DE
--text-primary:   #141A13
--text-secondary: #5A6B56
--text-muted:     #8A9B85
--radius-lg: 14px
--radius-md: 10px
--font: 'Plus Jakarta Sans', system-ui, sans-serif
```

---

## Layout system (LOCKED)

### DriverLayout
File: `src/components/layout/DriverLayout.tsx`

- Wraps ALL pages except auth pages
- Mobile: DriverTopNav only (no sidebar)
- Desktop: DriverTopNav + DriverSidebar (210px) + main content

### DriverTopNav
File: `src/components/layout/DriverTopNav.tsx`

**Mobile:**
- Left: hamburger button (3 lines, 34px, no border)
- Center: "RideConnect" logo (flex:1, text-align center)
- Right: availability badge + avatar
- NO nav links in mobile top nav

**Desktop:**
- Left: "RideConnect" logo
- Center: 5 nav links — Dashboard · Offers · Rides · Earnings · Profile
  - Active link: color #1A6B45, font-weight 600
  - Inactive: color #374151, font-weight 400
  - Active determined by useLocation().pathname
- Right: availability badge + avatar (NO logout button in top nav)

**Availability badge:**
- OFFLINE: grey pill, "● Offline"
- ONLINE:  green pill, "● Online"
- ON RIDE: blue pill, "● On ride"

**Do not add to top nav:**
- Logout button (sidebar only)
- Duplicate nav items that are already in sidebar

### DriverSidebar
File: `src/components/layout/DriverSidebar.tsx`

**8 items, 3 sections, SAME on every page:**

Section "OVERVIEW":
  1. Dashboard     (grid icon)    → /dashboard
  2. Ride offers   (clock icon)   → /offers      [green count badge when > 0]
  3. Active ride   (arrow icon)   → /rides/active

Section "RECORDS":
  4. Ride history  (list icon)    → /ride-history
  5. Earnings      (briefcase)    → /earnings

Section "ACCOUNT":
  6. Profile       (user icon)    → /profile
  7. Verification  (file icon)    → /kyc/status  [amber ! badge when not approved]
  8. Logout        (logout icon)  → clears token + /driver/login [RED text]

**Active item per route:**
- /dashboard, /            → Dashboard
- /offers, /offers/*       → Ride offers
- /rides/active            → Active ride
- /ride-history            → Ride history
- /earnings                → Earnings
- /profile, /profile/*     → Profile
- /kyc/status, /kyc/*      → Verification

**Item styles:**
- NO visible borders between items
- NO divider lines between items
- Inactive: color #6B7280, background transparent
- Active: color #1A6B45, font-weight 500, background #EDF9F2, border-right 3px solid #1A6B45
- Section labels: 9px, uppercase, #C4C9C2, letter-spacing 0.09em
- Logout: color #EF4444 always

**Do not add borders around sidebar items**
**Do not repeat items that are in the top nav center links**

### Mobile Drawer
File: inside DriverSidebar or separate DrawerMenu component

- Triggered by hamburger button tap
- Slides in from left (translateX -100% → 0), 0.28s ease
- Width: 218px
- Dark overlay right side (rgba 0,0,0,0.32) — tap to close
- Drawer header: driver name + "● Approved driver" badge + ✕ button
- Same 8 sidebar items below header
- Closes on item tap or overlay tap

---

## Routes (LOCKED)

**Auth (no DriverLayout):**
```
/driver/welcome       → DriverWelcomePage
/driver/register      → DriverAuthPage (register face)
/driver/login         → DriverAuthPage (login face)
/driver/verify-email  → DriverVerifyEmailPage
/driver/verify-phone  → DriverVerifyPhonePage
```

**KYC (DriverLayout, pre-approval allowed):**
```
/kyc/status           → DriverKycStatusPage
/kyc/review-pending   → DriverKycReviewPendingPage
```

**Operational (DriverLayout, requires approved KYC):**
```
/dashboard            → DriverDashboardPage
/offers               → DriverOfferInboxPage
/offers/:rideId       → DriverOfferDetailPage
/rides/active         → DriverActiveRidePage
/ride-history         → DriverRideHistoryPage
/earnings             → DriverEarningsPage
/profile              → DriverProfilePage
```

**Route guard rules:**
- submitted/under_review → /kyc/review-pending
- draft/rejected/needs_more_info/expired → /kyc/status
- approved → /dashboard unlocked
- suspended → /kyc/status (read-only)

---

## Screen statuses

---

### Auth screens — LOCKED

Files: `src/pages/auth/`

**Welcome page:**
- Green header, white card overlapping
- 4 numbered steps, "Create account" + "Sign in" buttons
- Desktop: 480px centered card on #F4F5F2

**Login / Register (card flip):**
- Same flip animation as rider app (0.55s cubic-bezier)
- Token key: `rc_driver_token`
- Register sends role: 'DRIVER'
- On login: navigate based on kyc_status
  - approved → /dashboard
  - anything else → /kyc/status
- Desktop register: name+phone row, password+confirm row (2-col grid)

---

### KYC screens — LOCKED

Files: `src/pages/kyc/`

**KYC Status page (`/kyc/status`):**

Uses DriverLayout (sidebar Verification item active).

Mobile: single column scroll
Desktop: sidebar + main content + right summary panel (240px)

Progress tracker:
- Mobile: vertical (dots + lines)
- Desktop: horizontal (dots connected by lines)
- 6 steps: Account created · Email verified · Phone verified · Upload docs · Under review · Approved

4 document cards:
- Mobile: vertical list (horizontal row layout per card)
- Desktop: 2×2 grid (vertical card layout)
- States: not_uploaded · uploaded · approved · rejected/needs_reupload · expired
- Upload button triggers hidden file input
- Max file size: 10MB

Status banners (top of page, per overall_status):
- needs_more_info: amber banner + admin reason
- rejected: red banner
- approved: green banner + dashboard link
- suspended: red banner, no upload actions

Submit button: disabled until all 4 documents uploaded

**Review Pending page (`/kyc/review-pending`):**
- Centered card (480px on grey)
- Amber clock icon
- Submitted date + estimated review time
- Polls every 30s — auto-navigates on status change
- "Refresh status" button

---

### Dashboard page — LOCKED

File: `src/pages/dashboard/DriverDashboardPage.tsx`

**4 states:**

1. **Offline:** Grey availability card, toggle off, "Go online" CTA, zero stats, offline info card
2. **Online waiting:** Green availability card, toggle on, pulsing "Waiting" status card
3. **Online + offer:** Green availability card + amber "New offer" action card with "View offer →"
4. **On a ride:** Blue availability card, blue "Active ride" action card with "Continue ride →"

**Availability card:**
- Offline: white bg, grey border, toggle off position
- Online: #F0FDF4 bg, #1A6B45 border, toggle on position
- On ride: #EFF6FF bg, #3B82F6 border, toggle blue
- Toggle: 44px wide, 24px tall, pill shape, smooth 0.18s transition
- Optimistic update on click (revert on API error with toast)

**Stats grid:**
- Mobile: 2×2 grid
- Desktop: 4-column row
- Cards: white bg, light border, value 22px bold, label 11px grey

**Quick actions (mobile only):**
- Profile · Documents · Earnings
- Icon above label, colored icon background squares

**Polling:**
- Active ride: every 5s
- Offers: every 5s

**Do not add:**
- Navigation links in the content area (sidebar handles nav)
- Duplicate status info already in top nav badge

---

### Profile page — LOCKED

File: `src/pages/profile/DriverProfilePage.tsx`

**Desktop layout:** 2 columns inside main content area
- Left column (330px, white bg, center-aligned):
  - 92px avatar circle (green ring, white bg, green initials)
  - Driver name: 20px, bold
  - Email: 14px, grey
  - "● Approved driver" green pill badge
  - 3 stat rows: Rating · Total rides · Member since
    - Thin #F3F4F6 dividers between rows
  - "Log out" button: white bg, red border 1.5px, red text
- Right column (flex 1, grey #F4F5F2 bg):
  - 3 info sections: Personal Information · Verification & Compliance · Vehicle
  - Each: uppercase grey label + white card with info rows
  - Info row: grey label left, bold value right, #F3F4F6 divider between rows

**Info row format exactly:**
- Full name, Email, Phone, City
- KYC status (badge), Insurance expires (amber if ≤60 days), View documents (green link)
- Vehicle make/model/year, Plate (monospace), Type (badge)

**Mobile layout:** single column, avatar + name horizontal in header card

**Do not change:**
- Logout button clears `rc_driver_token` + navigates to `/driver/login`
- "View →" on documents navigates to `/kyc/status`
- Plate number uses monospace font

---

### Offer detail page — PENDING

File: `src/pages/offers/DriverOfferDetailPage.tsx`

Not started. Key rules when implementing:
- Countdown timer is visual only — backend TTL is source of truth
- 410 response on accept = offer expired banner
- Desktop: 2-column offer card (route left, details right)

---

### Active ride page — PENDING

File: `src/pages/rides/DriverActiveRidePage.tsx`

Not started. Key rules when implementing:
- Desktop: sidebar always visible, map inside main content (NOT full screen)
- Layout: [Sidebar 210px] [Map flex:1] [Status panel 260px]
- All stage transitions must reflect backend status — no invented transitions
- Confirmation dialog before Start ride and Complete ride

---

### Ride history page — PENDING
### Earnings page — PENDING

---

## What NOT to do (LOCKED — permanent rules)

1. Never add Tailwind classes anywhere
2. Never add borders around sidebar items
3. Never repeat items in both top nav center links and sidebar
4. Never put the Logout button in the top nav
5. Never let the map take full screen on desktop active ride page — sidebar must stay visible
6. Never show driver info (name/plate/rating) before DRIVER_ASSIGNED status
7. Never use a different sidebar on different pages — exact same 8 items always
8. Never add horizontal padding/margin to the map wrapper
9. Never remove the hamburger from mobile top nav
10. Never use a separate "setup" sidebar on KYC pages — full 8-item sidebar always

# RideConnect rider_web — Living Spec
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
- Leaflet + React-Leaflet (OpenStreetMap tiles)
- Photon geocoder (photon.komoot.io) — no API key needed
- Plus Jakarta Sans (Google Fonts)
- lucide-react for UI icons
- Backend: FastAPI at `import.meta.env.VITE_API_BASE_URL`
- Auth token: `localStorage` key `rc_rider_token`

---

## Design tokens (LOCKED — never override)

File: `src/styles/tokens.css`

```
--green-700: #1A6B45
--green-50:  #EDF9F2
--bg:        #F4F5F2
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

## Global CSS rules (LOCKED)

File: `src/styles/global.css`

- `.leaflet-container { border-radius: 0 !important; }`
- `.leaflet-popup-tip-container { display: none !important; }`
- `.leaflet-popup-content-wrapper { border-radius: 5px !important; padding: 0 !important; }`
- `.leaflet-popup-content { margin: 4px 8px !important; font-size: 11px !important; font-weight: 500 !important; }`

---

## Shared components (LOCKED — do not modify)

### VehicleTypeIcon
File: `src/shared/components/vehicle/VehicleTypeIcon.tsx`
- Inline SVG side-profile car icons
- Props: `type: VehicleType`, `size?: number`
- Types: ECONOMY (green #1A6B45), COMFORT (blue #1E40AF), PREMIUM (amber #D97706), XL (purple #7C3AED)

### VehicleTypeConfig
File: `src/shared/constants/vehicleConfig.ts`
- Single source of truth for vehicle labels, colors, capacity, examples
- Import from here for all vehicle-related display

### PasswordStrengthBar
File: `src/components/auth/PasswordStrengthBar.tsx`
- 3 bars, scores 0-4
- Weak (red) / Fair (amber) / Strong (green)

### AddressSearchSheet (mobile bottom sheet)
File: `src/components/booking/AddressSearchSheet.tsx`
- Slides up from bottom on mobile
- font-size: 16px on input (prevents iOS zoom)
- Debounce: 300ms via Photon API
- Shows recent places when query is empty

---

## Routes (LOCKED)

```
/login           → LoginPage (login + register card flip)
/register        → LoginPage (starts on register face)
/                → HomePage (idle + results states)
/payment         → PaymentPage (mobile only)
/ride/summary    → RideSummaryPage (mobile only)
/ride/tracking/:rideId → RideTrackingPage
/ride/complete/:rideId → RideCompletePage
```

Desktop payment and summary are modals over HomePage.
All routes except /login and /register require `rc_rider_token`.

---

## Screen statuses

---

### LoginPage — LOCKED

File: `src/pages/LoginPage.tsx`

**Approved design:**
- Green header strip (background #1A6B45) with logo + tagline
- White card overlaps from below (margin-top: -24px)
- Card flip animation (0.55s cubic-bezier) between login and register faces
- Mobile: full screen edge to edge
- Desktop: 440px centered card on #F4F5F2 grey background, border-radius 20px, shadow

**Login face:**
- "Welcome back" title, "Sign in to your account" subtitle
- Email field (autocapitalize none, spellcheck false)
- Password field with eye toggle (type="button" on toggle)
- "Forgot password?" right-aligned green link (stub)
- Sign in button: green → red on error
- 401 error: "Invalid email or password"
- "Create account →" flips to register face

**Register face:**
- Fields: Full name · Email · Phone · Password · Confirm password
- Desktop: name+phone on one row, password+confirm on one row (2-col grid)
- PasswordStrengthBar below password field
- Confirm password: green check when matching
- Create account disabled when errors exist
- Success state: checkmark + "Go to sign in" flips back

**Do not change:**
- Card flip CSS (preserve-3d, backface-visibility)
- Token storage key: `rc_rider_token`
- Navigate to `/` on login success

---

### HomePage — IN PROGRESS

File: `src/pages/HomePage.tsx`

**Two states:** `'idle'` | `'results'`

#### Idle state — LOCKED

**Navbar (mobile):**
- "RideConnect" bold left
- R avatar (green ring) right
- "Logout" plain text (NO border, NO pill, NO padding)

**Map:**
- Width: 100% — NO side gaps, NO padding around map
- Height: 320px
- border-radius: 0 on all edges (use global CSS override)
- Locate-me button: white 34px rounded square (border-radius 8px), green crosshair SVG inside, bottom-center of map
- Zoom +/- buttons: white, stacked vertically, top-left of map, separated by thin border

**Form area (white, no outer card border):**
- Ride type dropdown: full width, bordered, "Ride ▾"
- Pickup row: 12px green dot + address text (no card border)
- Swap divider: [line flex:1] [28px circle button] [line flex:1]
  - MUST be visible between pickup and dropoff rows
  - Circle button has up-down arrow SVG
- Dropoff row: 11px dark square (border-radius 2.5px) + "Where to?" placeholder
  - Dark square MUST be visible (background: #111111)
- Drag hint: hamburger icon + "Drag to swap" (show once, hide after 10s)
- Leave now + Seats row: NO person icon on Seats button
- Search button: green filled (#1A6B45) in idle state

**Known fixed issues (do not reintroduce):**
- Map must NOT have side padding — it was broken, now fixed
- Swap divider was missing — now fixed
- Dark square on dropoff was missing — now fixed
- Locate button was bare SVG — now wrapped in white box

#### Results state — LOCKED

**Map changes:**
- Route polyline: color #111111, weight 4.5
- Green dot at dropoff + "Drop-off" permanent popup
- Black dot at pickup + "Pickup" permanent popup
- Locate button hidden in results state

**Form changes:**
- Ride type dropdown hidden
- Swap divider hidden
- Pickup row: cursor default (not tappable)
- Dropoff row: shows "Change" green link
- Search button: WHITE outlined (not green) in results state

**Vehicle section:**
- "ROUTE READY" green uppercase label
- "{distance} mi · {duration} min" grey
- "CHOOSE A VEHICLE" outlined badge
- 4 vehicle cards with staggered fade-in (50ms each)
- Economy selected by default
- Book button: WHITE outlined on mobile, green filled on desktop

---

### PaymentPage — LOCKED

File: `src/pages/PaymentPage.tsx`

- No map, clean white page
- Navbar: logo + R avatar only (NO logout button on this page)
- "← Back" plain grey text (navigate(-1), NOT navigate('/'))
- "Payment method" title 26px bold
- Trip pill: pin icon + route short names + fare in green
- "CHOOSE PAYMENT" uppercase grey label
- 3 payment method cards: Cash · Card · Digital Wallet
  - Cash selected by default
  - Selected: green border 1.5px + #F0FDF4 bg
  - Radio: filled green circle with white dot when selected
- "Confirm payment method" green button (sticky bottom)
  - Always enabled (never disabled)
  - onClick: setPaymentMethod in RideContext + navigate('/ride/summary')
- NO cancel link on this page

**shortName() utility:**
- Takes first part before comma
- Max 22 chars then "..."

---

### RideSummaryPage — LOCKED

File: `src/pages/RideSummaryPage.tsx`

- NO driver info on this screen (driver not assigned yet)
- Green checkmark circle header
- Summary card: From · To · Vehicle · Distance · Payment · Fare
- Grey info note: "A driver will be assigned after you confirm"
- "Confirm ride" green button → calls POST /api/v1/rides/request
- "Cancel" text link

---

### RideTrackingPage — PENDING

File: `src/pages/RideTrackingPage.tsx`

Not started. Covers:
- REQUESTED/MATCHING → searching spinner state
- DRIVER_ASSIGNED/EN_ROUTE/ARRIVED → tracking state
- RIDE_STARTED → in progress state
- RIDE_COMPLETED → navigate to complete

---

### RideCompletePage — PENDING

File: `src/pages/RideCompletePage.tsx`

Not started.

---

## RideContext (LOCKED)

File: `src/context/RideContext.tsx`

Fields: pickup, dropoff, seats, selectedVehicleType, selectedFare,
        paymentMethod, activeRideId, fareEstimateData

`activeRideId` persisted to localStorage key `rc_active_ride_id`

---

## Field interaction rules (LOCKED)

- Address search input: font-size 16px (prevents iOS zoom)
- Address search debounce: 300ms
- Validate onBlur, not onChange (except confirm password)
- Show errors only after field touched OR submitAttempted
- On login error: clear password, keep email
- Tab order must be logical, no tabIndex manipulation

---

## What NOT to do (LOCKED — permanent rules)

1. Never add Tailwind classes
2. Never add border-radius to .leaflet-container
3. Never use navigate('/') for the PaymentPage back button — use navigate(-1)
4. Never show driver info (name, plate, rating) before DRIVER_ASSIGNED status
5. Never put side padding/margin on the map wrapper div
6. Never render the Logout button on PaymentPage or RideSummaryPage
7. Never make the Search button green in results state — it must be white outlined
8. Never make the Book button green on mobile — it must be white outlined

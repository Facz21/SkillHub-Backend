# Design System & Visual Guidelines

<!-- impeccable:design-schema 1 -->

## Design Direction & Atmosphere

SkillHub's interface adheres to an **Operate / Persuade** hybrid mode:
- **Clarity & Trust:** Educational and professional atmosphere with a deep indigo / violet primary hue, slate neutrals, and emerald accents for seat availability and successful actions.
- **Micro-Interactions & Responsiveness:** Fluid transitions, tactile button states, interactive cards with elevation on hover, accessible focus rings, and delightful feedback upon actions (SweetAlert2 toasts/modals, Canvas Confetti on successful enrollment).
- **Scanability:** High-contrast badges for seat availability (`X cupos disponibles`), workshop schedules, and enrollment states (`Active`, `Cancelled`).

## Color Palette & Design Tokens

- **Primary Brand:** `indigo-600` (`#4F46E5`), Hover `indigo-700` (`#4338CA`), Focus ring `indigo-500`
- **Secondary / Accent:** `violet-600` (`#7C3AED`)
- **Success / Available:** `emerald-600` (`#059669`), `emerald-50` background for available seat pills
- **Warning / Low Capacity:** `amber-500` (`#F59E0B`), `amber-50` background for $\le 3$ remaining seats
- **Danger / Sold Out / Cancelled:** `rose-600` (`#E11D48`), `rose-50` background
- **Neutrals / Surface:**
  - Background: `slate-50` (`#F8FAFC`)
  - Cards & Modals: Pure white (`#FFFFFF`) with subtle border `slate-200` (`#E2E8F0`) and soft shadows (`shadow-sm` transitioning to `shadow-md`)
  - Typography: Primary text `slate-900` (`#0F172A`), Secondary text `slate-600` (`#475569`), Muted text `slate-400` (`#94A3B8`)

## Typography

- **Font Family:** `Inter`, system-ui, sans-serif
- **Hierarchy:**
  - H1 (Hero Title): 32px / 2rem, Font-bold, tracking-tight
  - H2 (Section Titles): 24px / 1.5rem, Font-semibold
  - H3 (Card Titles): 18px / 1.125rem, Font-semibold
  - Body: 14px / 0.875rem, Font-normal, leading-relaxed
  - Small / Badges: 12px / 0.75rem, Font-medium, uppercase tracking-wider

## Layout & Responsive Breakpoints

- **Container:** Max-width 7xl (1280px) centered with responsive horizontal padding (`px-4 sm:px-6 lg:px-8`).
- **Catalog Grid:**
  - Mobile (< 640px): 1 column
  - Tablet (640px - 1024px): 2 columns
  - Desktop (> 1024px): 3 columns
- **Navigation:** Sticky top bar with logo, live auth state indicator, active user pills, and modal triggers.

## Components & Interactive States

1. **Workshop Card:**
   - Image placeholder / category badge (Photography, Cooking, Speaking, Design)
   - Dynamic seats indicator badge with stateful coloring (Available vs Almost full vs Full)
   - Schedule pill with calendar icon and formatted date range
   - Instructor attribution with avatar and specialty
   - Action CTA button: "Inscribirme" (Active) / "Ya estás inscrito" (Disabled) / "Agotado" (Disabled)
2. **Enrollment Drawer / Modal:**
   - Tabular or card-based view of personal enrollments
   - Distinct badges for `Active` (Emerald) and `Cancelled` (Slate/Rose)
   - Dynamic action buttons:
     - "Descargar Certificado PDF" (Active only, trigger direct download)
     - "Cancelar Inscripción" (with countdown/warning showing whether the 24-hour limit allows cancellation)
3. **SweetAlert2 Feedback:**
   - Success alerts with smooth bounce and auto-dismiss toasts
   - Confirmation dialog for cancellation clearly stating: *"¿Estás seguro de cancelar? Se liberará tu cupo."*
   - Error modals explaining business rule violations clearly (schedule overlap, overbooking).

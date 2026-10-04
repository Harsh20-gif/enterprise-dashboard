# Task 04 Design System

The dashboard uses three ordered CSS layers on every page: `client/css/tokens.css`, `client/css/style.css`, and `client/css/responsive.css`. Tokens define the shared visual contract, component CSS styles the existing semantic HTML, and the responsive layer sets the small-screen layout before widening it at the tablet, laptop, and desktop breakpoints.

## Color Tokens

| Token | Light value | Purpose |
| --- | --- | --- |
| `--color-brand` | `#155eef` | Primary actions and links |
| `--color-brand-hover` | `#0e4ecb` | Primary hover state |
| `--color-secondary` | `#172437` | Secondary/navy brand tone |
| `--color-page` | `#f3f5f8` | Page background |
| `--color-surface` | `#ffffff` | Panels and controls |
| `--color-sidebar` | `#172437` | Sidebar background |
| `--color-text` | `#202b3c` | Main text |
| `--color-muted` | `#5d6878` | Supporting text |
| `--color-border` | `#e1e6ed` | Dividers and control borders |
| `--color-success` | `#16724b` | Positive changes and active states |
| `--color-warning` | `#96500b` | Pending state |
| `--color-error` | `#a12f35` | Errors and destructive actions |
| `--color-focus` | `#f5a623` | Keyboard focus ring |

Additional tokens cover soft surfaces, on-brand text, chart bars, avatar pairs, and input borders. Dark values are defined for the same semantic tokens. Existing component variable aliases remain in `tokens.css` while older component selectors use them, avoiding a broad markup/style rewrite.

## Typography

- `--font-family-base`: Avenir Next with Segoe UI fallback.
- `--font-family-display`: Georgia display headings.
- `--font-size-xs`, `--font-size-sm`, `--font-size-base`, `--font-size-lg`, `--font-size-xl`, and `--font-size-display`: 10, 12, 14, 16, 22, and 29px.
- `--font-weight-regular`, `--font-weight-medium`, `--font-weight-semibold`, and `--font-weight-bold`: 450, 550, 650, and 700.
- `--line-height-tight` and `--line-height-base`: 1.2 and 1.5.

## Spacing and Shape

The shared spacing scale is `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-6` (24px), `--space-8` (32px), and `--space-12` (48px). Shape/layout tokens include `--radius-sm`, `--radius-md`, `--radius-lg`, `--shadow-card`, `--shadow-dialog`, `--duration-fast`, `--duration-normal`, `--sidebar-width`, `--header-height`, `--header-height-mobile`, and `--container-max`.

## Breakpoints and Layout

- Base styles support compact/mobile layouts from 320px.
- `768px`: tablet/compact desktop; persistent sidebar, search, and two-column metrics.
- `1024px`: laptop; four summary cards and split main dashboard panels.
- `1440px`: wide desktop; content remains capped by the container token.

CSS Grid arranges summary cards, dashboard panels, and settings fields. Flexbox aligns the topbar, toolbars, activity rows, and actions. At small widths, the sidebar becomes a translated drawer controlled by the existing accessible menu button. Tables retain semantic table markup and scroll horizontally inside named, keyboard-focusable regions; the page itself does not acquire horizontal overflow.

## Theme

Light mode is the default. `@media (prefers-color-scheme: dark)` supplies a system dark palette when there is no saved or explicit theme. The global header button and Settings radio group use the same `northstar-theme` localStorage value. An explicit user preference is applied to the root element and takes precedence over the system preference. Reduced-motion preferences are honored in `responsive.css`.

## Reusable Components

The four pages share tokens and component selectors for the header, sidebar, buttons, metric cards, panels, status badges, tables, form controls, settings groups, and native user dialog. `client/components/` contains standalone HTML fragments corresponding to the repeated header, sidebar, modal, and user table; page documents retain their own static markup so navigation remains functional without runtime fragment loading.

# Task 06 Capstone Architecture

## Application Shape

The repository is a static multi-page frontend. `server/src/` is currently empty; no backend authentication, database, orders service, or payment provider is implemented. The deployable root is `client/`, and `netlify.toml` sets that directory as the static publish directory.

Pages use shared token, component, and responsive CSS layers. Navigation is ordinary relative HTML links, and every page has a direct URL. Native HTML forms, tables, dialogs, buttons, and landmarks remain the interaction foundation.

## Page and Module Boundaries

- `client/index.html` with `js/dashboard.js`: dashboard overview and live/local-state summaries.
- `client/products.html` with `js/products.js`: FakeStoreAPI catalog, search, category controls, sorting, and cart UI.
- `client/manage-products.html` with `js/manage-products.js`: CRUD table and dialogs for products saved locally in this browser.
- `client/users.html` with the user section of `js/app.js`: browser-local demo users, validation, status, search, pagination, and confirmation.
- `client/reports.html`: report table/date filtering/export; figures are explicitly labeled sample data because no transactions backend exists.
- `client/settings.html`: browser-local preferences and existing theme controls.
- `client/login.html` with `js/auth.js`: explicitly simulated sign-in.

### JavaScript Modules

- `auth.js` handles the login form, protected-route redirect, session display, and logout.
- `app.js` initializes shared theme/mobile navigation and existing Users, Reports, and Settings behavior.
- `api.js` owns FakeStoreAPI fetches, timeout, validation, caching, and user-safe errors.
- `catalog-utils.js` contains pure product filtering and sorting.
- `products.js` renders API/local catalog records and shopping cart interactions.
- `managed-products.js` provides validated create/read/update/delete operations for browser-local records.
- `manage-products.js` owns the product-management UI.
- `storage.js` validates and persists demo users, managed products, activity, catalog preferences, and cart records.
- `cart.js` owns cart quantities, subtotal, persistence, and change events.
- `dashboard.js` reads API catalog counts and local demo state for dashboard metrics.

## Data Flow

On protected-page load, the auth guard reads a short demo identity from `sessionStorage`. The guard runs after page markup is parsed but before feature modules initialize. Without a valid session it redirects to `login.html`; with a session it updates the profile and enables the page. The password is checked in client-side code and is never stored. This can be inspected or bypassed and is not security/authentication for real users.

The catalog calls `GET https://fakestoreapi.com/products` and `/products/categories`. API data is validated and kept in memory. Locally managed product records are read separately from `northstar-managed-products`; catalog cards identify their origin as FakeStoreAPI or Local demo. If API loading fails, the interface shows a retryable error and may still show explicitly labeled locally managed records. It never creates pretend API records.

Search/category filters run before sorting, and sorting clones filtered arrays rather than mutating API data. Cart actions flow through `cart.js`, which persists serializable product display data and quantity and emits a change event for the cart and dashboard metrics.

## Persistence Strategy

- `sessionStorage`: demo session identity only; it contains no password and lasts for the current tab session.
- `localStorage`: `northstar-cart`, `northstar-demo-users`, `northstar-managed-products`, `northstar-demo-activity`, existing account preferences, theme, and catalog category/sort preferences.
- Storage access and JSON parsing are guarded. Invalid data falls back to validated defaults.
- Browser-local records do not synchronize between devices/users and are not a shared database.
- Cart/checkout is a client simulation; there is no payment or order submission.

## API and Known Limitations

FakeStoreAPI is a third-party read-only catalog dependency. During the 2026-10-04 test, PowerShell received HTTP 522 and the integrated browser blocked requests for missing CORS permission. The direct API client is present, and the error/retry path works, but a successful live response is not claimed. Deploying to Netlify does not by itself solve a provider-side CORS outage. A future same-origin API proxy would require a real backend/serverless function and should be added only if the API owner permits the use and the capstone is extended beyond its current static architecture.

The demo sign-in credentials are intentionally public and embedded for the exercise. Anyone can inspect the source or forge browser state. Do not reuse this pattern for production authentication.

## QA Record (2026-10-04)

- Node's built-in test runner: **13 passed, 0 failed** across `tests/task-05/*.test.mjs` and `tests/task-06/*.test.mjs`.
- `node --check` completed for all ten client JavaScript modules.
- Nu HTML Checker was run for all seven application pages. After correcting a first-run user-record ID migration and an empty dialog heading, all pages returned zero errors, warnings, and informational messages.
- Browser: invalid demo credentials were rejected; valid demo login redirected to the requested protected page; logout returned to login; direct protected-route navigation returned to login.
- Browser: local product create/view/edit/reload/delete passed; local products were labeled in the catalog; adding a local item stored it in the cart, and deleting the managed record removed its cart entry.
- Browser: user status changed and remained after reload; all five initial demo records remained stored.
- Browser: login, Users, Settings, Product Management, and controlled-response catalog pages were measured at 320, 768, 1024, and 1440px. No page-level horizontal overflow was measured. Controlled catalog data was used only for visual/client interaction testing.
- Browser: Overview showed actual local user/activity/cart data and showed API count as “Unavailable” after FakeStoreAPI timed out; no fabricated revenue metric was displayed.
- Live API: still not verified. Previous direct request returned HTTP 522 and browser requests were CORS-blocked. A later retry timed out. Successful live data/image loading remains an external dependency and a capstone limitation.
- Screenshots: the integrated browser preview does not save image files into the repository. No capstone screenshot PNGs are claimed or included; manual capture instructions are in `docs/screenshots/README.md`.
- No screen-reader session or complete cross-browser/WCAG audit was performed.

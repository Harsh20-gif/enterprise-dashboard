# Task 05 API Integration

## API and Request Behavior

The browser client uses `https://fakestoreapi.com` directly:

- `GET /products`
- `GET /products/categories`
- `GET /products/category/{category}`
- `GET /products/{id}`

`client/js/api.js` owns fetch calls, a 12-second timeout, response status and JSON handling, product/category schema validation, in-flight request reuse, and successful full-list/category caches. Failures become `ApiError` instances with user-safe messages. The full list/category cache can be forced to refresh for Retry. No product records are supplied as an application fallback.

## Module Responsibilities

- `client/js/app.js`: existing shared theme, mobile navigation, and admin interactions; the `/` shortcut targets the visible Products search field on the Products page.
- `client/js/api.js`: isolated FakeStoreAPI transport and response validation.
- `client/js/catalog-utils.js`: pure search/category filtering and sorting.
- `client/js/products.js`: catalog loading, card/category/error/skeleton DOM, controls, feedback, and cart rendering.
- `client/js/cart.js`: in-memory cart operations, quantities, totals, and change events.
- `client/js/storage.js`: guarded, schema-checked cart and catalog-preference persistence.

## Catalog Behavior

Products are displayed only after the actual API client returns validated API data. Cards use `createElement`, `textContent`, and DOM attributes; API text is not interpolated into HTML. The name/detail/category search is case-insensitive and combines with the selected category. Sorting supports default API order, both price directions, and both name directions without mutating the source array. Category buttons are native buttons with `aria-pressed`, not incomplete ARIA tabs. A named live region reports result counts and empty results. Category-fetch failure can still display products using categories derived from the returned product records while announcing the partial failure.

## Loading, Errors, and Retry

The product grid exposes `aria-busy` and displays six layout-matched skeleton cards while requests run. Reduced-motion preferences are respected by the shared CSS. HTTP errors, unavailable network/CORS, timeouts, malformed JSON, and unexpected product/category shapes produce an alert with a Retry button. A product-load failure never displays fabricated fallback product cards.

## Cart and Preferences

The cart stores only product display data and quantity in `northstar-cart`; it stores no payment or sensitive information. Adding an existing product increments quantity. Increase, decrease, remove, item count, and subtotal update together and persist. `northstar-product-preferences` stores a validated category and sorting choice. The existing `northstar-theme` Task 04 preference is unchanged. Invalid JSON, invalid cart records, and unknown preference values safely fall back to empty cart/default filters.

## Tests and Actual Results

Date: 2026-10-04.

Automated tests run with Node's built-in test runner:

```sh
node --test tests/task-05/*.test.mjs
```

Result: **8 tests passed, 0 failed**. Coverage includes successful client requests and cache reuse, category and ID requests, HTTP errors, network failure, unexpected payloads, invalid identifiers, case-insensitive search, combined search/category filtering, empty results, all sort orders and source immutability, cart add/increment/decrement/remove/subtotal/storage, and invalid JSON/preference normalization.

`node --check` passed for `app.js`, `api.js`, `storage.js`, `cart.js`, `catalog-utils.js`, and `products.js`.

The official Nu HTML Checker reported **0 errors, 0 warnings, and 0 informational messages** for all five application pages: Overview, Products, Users, Reports, and Settings.

The local client was served over HTTP at `http://127.0.0.1:4173/products.html` to run native ES modules. With controlled fetch responses in the test browser only (not in app code), browser checks confirmed dynamic card/category rendering, search/no-results/clear, combined category and search, sorting, cart feedback/quantity/subtotal/removal/reload persistence, preference restoration, error state, Retry recovery, and mobile/tablet/desktop layout. Products layout was measured at 320, 768, 1024, and 1440px; all four widths had no page-level horizontal overflow.

### Live API Limitation

A real request to `https://fakestoreapi.com/products` from PowerShell returned HTTP **522**. From the local browser origin, the real API request was blocked by CORS because the response contained no `Access-Control-Allow-Origin` header. Therefore a successful live product/category response and live image loads could not be verified in this environment. The app correctly displays the network error and Retry control and does not substitute controlled test data. Re-test from a network/browser origin where FakeStoreAPI is reachable before claiming successful live API operation.

## Manual Verification

1. Start any static HTTP server rooted at `client/`; do not open this module page directly with `file://` because browser ES module/CORS restrictions apply.
2. Open `/products.html` with access to FakeStoreAPI and confirm `/products` and `/products/categories` return valid JSON in the Network panel.
3. Search a product title, enter a no-match query, clear it, and combine a query with a category.
4. Apply each sort mode and verify the order without a page reload.
5. Add one item twice, change both quantities, remove it, and reload to check persisted cart behavior.
6. Disable network access or block FakeStoreAPI, verify the message and Retry button, then restore access and retry.
7. Check browser console for uncaught JavaScript errors. CORS/network errors during a deliberately blocked request are expected diagnostics.

## Known Limitations

- User cart state is browser-local simulation data; there is no checkout, payment, or server account synchronization.
- Successful live API calls and real image delivery remain unverified while FakeStoreAPI returns 522/CORS failure from this environment.
- Automated tests use controlled API responses for deterministic UI behavior; they do not replace the live endpoint check.
- Screen-reader testing and a full cross-browser accessibility audit have not been performed for the new catalog.

# Enterprise Dashboard

An accessible and maintainable full-stack dashboard project.

## Project Overview

This project establishes a foundation for building an accessible, responsive enterprise dashboard using modern web technologies.

## Architecture

* **Client:** User interface, semantic HTML, CSS and JavaScript.
* **Server:** Backend APIs and business logic.
* **Docs:** Accessibility audit and architecture documentation.
* **Tests:** Accessibility and integration test organization.

## First Vertical Feature Slice

The first feature is a dashboard overview that displays summary cards and a basic data table.

### Initial workflow

1. Load the dashboard page.
2. Fetch or load dashboard data.
3. Display summary information.
4. Show a data table with accessible headings.
5. Handle loading and error states.

## Local Setup

### Prerequisites

* Git
* Node.js (for the frontend tooling, if configured)
* A modern web browser

### Getting Started

1. Clone this repository.
2. Open the `client` directory.
3. Follow the client-specific setup instructions.
4. Open the dashboard locally.

## Accessibility

The project follows semantic HTML and aims to meet WCAG 2.1 accessibility requirements.

## Testing

Accessibility and integration testing will be documented and expanded as features are implemented.
# enterprise-dashboard

## Task 03: Enterprise Admin Dashboard

Task 03 adds a responsive, multi-page static admin dashboard built with semantic HTML5, CSS3, and vanilla JavaScript. The original Task 02 documentation, spreadsheet, and screenshots are preserved.

### Features

- Overview dashboard with business metrics, revenue chart, activity feed, and recent users.
- User directory with live search, pagination, accessible add/edit dialog, validation, and confirmed deletion.
- Reports with date filtering and CSV export.
- Account profile, notification, and theme preferences. Theme and settings persist in the current browser; user-directory changes are demonstration data held in memory.
- Responsive navy navigation, mobile menu toggle, skip link, visible focus indicators, reduced-motion support, and light/dark themes.

### Folder Structure

```text
client/
	index.html
	users.html
	reports.html
	settings.html
	products.html
	components/          Reusable standalone HTML fragments
	assets/icons/        Local icon asset directory
	css/tokens.css       Shared semantic design tokens
	css/style.css        Shared component styling
	css/responsive.css   Mobile-first layout and breakpoints
	js/app.js
	js/api.js
	js/products.js
	js/catalog-utils.js
	js/cart.js
	js/storage.js
	src/index.html       Preserved Task 02 file
server/src/            Preserved backend workspace
docs/
	screenshot/          Preserved Task 02 screenshots
	screenshots/         Task 03 screenshot capture instructions
	task-03-accessibility.md
	design-system.md
	responsive-testing.md
	task-05-api-integration.md
tests/accessibility/manual-checklist.md
```

### Local Setup and Navigation

No package installation or build step is required. Open `client/index.html` in a modern browser, or serve the `client/` directory with a local static server such as the VS Code Live Server extension. Use the sidebar links to navigate among Overview, Users, Reports, and Settings. The static pages remain usable without server-side APIs; changes to the sample user list reset on reload.

### Accessibility

Pages use landmarks, a skip link, one primary heading, labeled forms, scoped table headers, status text, live feedback, and a native dialog. The responsive menu supports keyboard operation, and reduced-motion preferences are honored. See [docs/task-03-accessibility.md](docs/task-03-accessibility.md) for validation results, implemented behavior, known limits, and keyboard test steps. Do not treat HTML validation as a complete WCAG conformance audit.

### Validation

Submit each of `client/index.html`, `client/users.html`, `client/reports.html`, and `client/settings.html` to the [W3C Nu HTML Checker](https://validator.w3.org/nu/). Results recorded on 2026-10-03: zero errors, warnings, or informational messages on all four pages. To check JavaScript syntax with Node.js, run:

```sh
node --check client/js/app.js
```

The manual accessibility checklist is at [tests/accessibility/manual-checklist.md](tests/accessibility/manual-checklist.md). Screenshot capture steps are in [docs/screenshots/README.md](docs/screenshots/README.md); screenshots have not been generated or represented as test evidence.
# enterprise-dashboard

## Task 04: Design Tokens and Responsive CSS

The stylesheet is organized into three ordered layers: `client/css/tokens.css` defines semantic colors, typography, spacing, shape, and layout values; `client/css/style.css` styles shared dashboard components; and `client/css/responsive.css` applies the mobile-first layout and 768px, 1024px, and 1440px breakpoints. All four pages load the same layers.

The pages support a system-preference-aware light/dark theme, a visible header theme control, and saved user choice. The mobile layout uses a keyboard-accessible sidebar drawer, a two-column metrics grid, stacked panels, and contained table scrollers. At wider widths the sidebar persists, metrics expand to four columns, and dashboard panels become multi-column.

Viewport results and test procedure are in [docs/responsive-testing.md](docs/responsive-testing.md); token names and values are in [docs/design-system.md](docs/design-system.md). The integrated browser allowed responsive visual review but could not save screenshots into the repository. No Task 04 PNGs are included; exact manual capture steps and required filenames are documented in the responsive testing report.

## Task 05: Dynamic Catalog and REST Client

The Products page integrates directly with FakeStoreAPI (`https://fakestoreapi.com`) using native `fetch` and ES modules. It renders live product cards, API-loaded category controls, case-insensitive search, combined filters, five sort modes, skeleton loading, useful errors with Retry, and a local persistent demo cart. Catalog category/sort preferences persist separately; the existing Task 04 theme preference is retained. Product and cart DOM is created with safe DOM APIs.

The JavaScript is divided into transport/schema validation (`client/js/api.js`), pure catalog algorithms (`client/js/catalog-utils.js`), page behavior (`client/js/products.js`), cart state (`client/js/cart.js`), and validated local persistence (`client/js/storage.js`). Use a local HTTP static server rooted at `client/` to run ES modules; direct `file://` opening is not suitable for module imports.

Task 05 tests use Node's built-in test runner:

```sh
node --test tests/task-05/*.test.mjs
```

The recorded local result is 8 passed, 0 failed. Controlled API responses were used only for deterministic UI tests. The actual FakeStoreAPI call returned HTTP 522 from PowerShell and was blocked by CORS in the integrated browser, so successful live API operation is not yet verified. The page shows its real network error and retry action and does not insert mock products. See [docs/task-05-api-integration.md](docs/task-05-api-integration.md) for endpoint, module, test, and limitation details.

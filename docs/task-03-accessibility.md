# Task 03 Accessibility Notes

## Semantic Structure

Each page is a complete, standalone HTML document. The shared shell uses a skip link, `header`, named `nav`, `aside`, one `main` landmark, and `footer`. Page content uses sections and articles with headings; data is represented with `table`, `caption`, `thead`, `tbody`, and column headers using `scope="col"`. The dashboard chart uses `figure` and `figcaption` with its decorative bars hidden from assistive technology.

The four files in `client/components/` are reusable HTML fragments for the repeated header, sidebar, user dialog, and user table. Pages include their own static shell markup so each route remains usable without client-side component loading.

## Accessible Components and Forms

- Every form control has a visible associated label; complex fields include help and validation text referenced with `aria-describedby`.
- Required fields use native constraints such as `required`, `minlength`, `maxlength`, and suitable input types. User-dialog errors are associated with their inputs and set `aria-invalid` until corrected.
- Notification checkboxes and theme radios are grouped by `fieldset` and `legend`.
- User tables have descriptive captions, scoped headers, text status labels, and action names that include each user's name.
- Live regions announce user CRUD, report filter/export, and settings feedback. Search results update while typing.
- Focus indicators are visible, and the skip link becomes visible when focused. Reduced-motion preferences are respected.
- The mobile navigation exposes its expanded state and becomes inert while closed on narrow screens.

## Dialog Keyboard Behavior

The Add/Edit User flow uses the native `dialog` element and `showModal()`/`close()`. Opening moves focus to the name field. The labeled close and cancel buttons work, Escape closes the dialog, and the close handler returns focus to the control that opened it. Validation feedback is surfaced in the dialog without discarding user input.

## Validation and Checks

On 2026-10-03, each of `client/index.html`, `client/users.html`, `client/reports.html`, and `client/settings.html` was submitted to the official Nu HTML Checker at <https://validator.w3.org/nu/> using its JSON endpoint. Each page returned **0 errors, 0 warnings, and 0 informational messages**. The initial dashboard article-heading notices were resolved and all pages were rechecked.

Browser checks performed in the integrated Chromium browser:

- Users: add, edit, required-field and duplicate-email errors, filter to no results, confirmed delete, page 2/previous pagination, dialog focus placement, Escape close, and focus return; no page errors were reported.
- Reports: selecting October 3 through October 4, 2026, filtered to two rows. The generated CSV Blob was inspected and contained the header plus those two rows.
- Settings: saved profile values, selected the dark theme, and confirmed the theme persisted after navigating to Users.
- Mobile: at a 390 by 844 viewport, the navigation toggle opened and closed on Escape; the users table remains in a dedicated horizontal scroller.
- Internal destinations were checked against the four local pages.
- `node --check client/js/app.js` completed successfully; VS Code reported no diagnostics in the touched HTML, CSS, or JavaScript files.

The integrated browser did not expose a download event for the Blob CSV while pages were opened with `file://`; saving/opening the downloaded file in a browser or spreadsheet still requires a manual check. No automated screen-reader, contrast-ratio, or full WCAG audit was run. These results are not a claim of full WCAG 2.1 conformance.

## Keyboard Testing Procedure

1. Open each page in a current browser and use only Tab, Shift+Tab, Enter, Space, and Escape.
2. Confirm the first Tab reveals “Skip to main content”; activate it and check that focus moves to the main content.
3. Check focus indicators and confirm navigation follows the visual/logical order.
4. On Users, open Add user, navigate every field, submit invalid and valid data, close with Escape, and confirm focus returns to Add user. Repeat with Edit and the close/cancel buttons.
5. Search and operate pagination and row actions with the keyboard; confirm delete only proceeds after confirmation.
6. On Settings, change radios and checkboxes; on Reports, change dates and activate export.
7. At a narrow viewport and at 200% zoom, operate the mobile menu and check for page-level horizontal scrolling. The table may scroll horizontally within its own container.
8. Repeat with a screen reader and test contrast with a WCAG contrast analyzer before making any formal conformance claim.

## Screenshots

Screenshots were not saved from the integrated browser because its capture tool returns an image to the chat but does not write files into the repository. Use Chrome/Edge DevTools' Command Menu (`Ctrl+Shift+P`) and choose **Capture screenshot** after opening each real page. For the mobile image, enable Device Toolbar and set 390 by 844. For the modal image, open Add user before capture. Capture actual Nu results only after submitting each page. Save the resulting files under `docs/screenshots/` with the requested names.

## Remaining Limitations

- This is a static frontend demonstration; user data is in memory and resets on reload. Settings and theme preferences use browser local storage only.
- The integrated browser's `file://` context did not provide a verifiable CSV download event.
- Screen-reader, cross-browser, manual contrast, 200% zoom, and full keyboard-only checks remain manual verification items.
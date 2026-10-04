# Accessibility Manual Checklist

Run this checklist for `client/index.html`, `client/users.html`, `client/reports.html`, and `client/settings.html` in a current browser.

- [ ] Use Tab and Shift+Tab only; confirm visible focus and sensible order.
- [ ] Activate the skip link and confirm focus reaches the main content.
- [ ] Open and close the mobile navigation with keyboard, including Escape.
- [ ] On Users, test search, empty results, pagination after adding enough users, and named edit/delete actions.
- [ ] Open the native dialog, trigger required/type/duplicate errors, submit a valid user, and verify Escape and focus return.
- [ ] On Reports, apply an in-range date selection and download/open the CSV.
- [ ] On Settings, save preferences, reload, and confirm theme and saved values.
- [ ] Check every page at 200% zoom and a 320px-wide viewport; only data-table regions may require horizontal scrolling.
- [ ] Repeat key workflows with a screen reader; evaluate text/background contrast with a WCAG contrast analyzer.

Automated HTML validation was performed with the official Nu HTML Checker on 2026-10-03: all four pages returned zero errors, warnings, and informational messages. The manual items above are not all completed; do not interpret the HTML result as a complete accessibility audit.
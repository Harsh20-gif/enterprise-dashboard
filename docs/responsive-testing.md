# Task 04 Responsive Testing

## Test Setup

Date: 2026-10-04. Tests used the shared integrated Chromium browser with the actual static pages opened from the repository using `file://`. Each page was opened at each requested viewport width. Layout measurements were collected after navigation at that width. The browser reports a 15px narrower content viewport at these heights because its vertical scrollbar is non-overlay; the no-overflow check compares document `scrollWidth` with `documentElement.clientWidth`.

## Viewport Results

All four pages were checked at 320, 768, 1024, and 1440 CSS pixels. In every one of the 16 page/viewport combinations, the document scroll width equaled the content viewport width. No horizontal page overflow was measured.

| Requested width | Browser content width | Sidebar/header behavior | Dashboard layout | Tables/forms |
| --- | ---: | --- | --- | --- |
| 320px | 305px | Mobile menu shown; sidebar drawer is closed/inert until opened; compact theme button visible | Two metric columns; content panels stack | Tables scroll in named regions; Settings fields stack |
| 768px | 753px | Persistent sidebar and full header controls; mobile menu hidden | Two metric columns; activity and revenue panels stack | Wide tables stay in local scrollers |
| 1024px | 1009px | Persistent sidebar and full header | Four metric columns; revenue/activity use two columns | Tables fit available content width in tested pages |
| 1440px | 1425px | Persistent sidebar and full header | Four metric columns; split dashboard panels; main content stays capped | Tables fit available content width |

At 320px, the Users modal measured 271px wide with its three controls 231px wide; all dialog bounds were within the viewport. Settings profile controls measured 245px wide and ended at x=275 within the 305px content viewport. Report dates and export controls also remained within that viewport. The Users table had a 279px scroll viewport and 695px of table content; setting its own `scrollLeft` did not move the document.

The dashboard at 320px, 768px, 1024px, and 1440px, plus the dark dashboard at 1440px, was opened in the browser screenshot view for visual review. Screenshot images were returned for inspection but the available screenshot tool does not save PNG files into the workspace. Therefore **no Task 04 PNG files are claimed or present**.

## Interactive Checks

- Mobile menu at 320px: expanded state changes to true, the sidebar becomes available, and Escape returns it to closed/inert state.
- Theme at 1440px: system dark preference produced the dark surface when no preference was stored; the visible theme control changed to light, wrote `northstar-theme=light`, and kept that preference after reload.
- Settings theme radio and header control remained synchronized.
- Dark theme computed surface/text values were `rgb(18, 25, 35)` and `rgb(237, 242, 248)`; primary button values were `rgb(119, 166, 255)` with `rgb(21, 34, 56)` text.
- Computed contrast ratios for sampled pairs were: body text/page 13.06:1 light and 15.69:1 dark; primary button 5.41:1 light and 6.59:1 dark; active status badge 5.28:1 light and 5.93:1 dark. These samples do not replace a full contrast audit for every component/state.
- Mobile menu: the expanded state exposed the drawer, moved focus to its first link, and Escape returned it to closed/inert state. Screenshots confirmed the drawer visibly enters the viewport after its transition.
- Table scroller wrappers are named and keyboard-focusable regions.
- Add User dialog and table usability were checked at 320px. User CRUD and report/settings interactions remain covered by the Task 03 testing record.

## Defect Found and Fixes

- The Users table's intrinsic width expanded the root scroll area. `contain: layout` on the main content region isolates that overflow while the named table region retains horizontal scrolling.
- `html { min-width: 320px }` caused a 15px document overflow where the browser's content viewport was 305px at a requested 320px width. The minimum was removed; the full page now matches the available content viewport.
- The old 1100/760/500px rules were removed from `style.css`; mobile defaults, explicit 768/1024/1440px breakpoints, and reduced-motion rules now live in `responsive.css`.

## Remaining Limitations

- Automated visual captures cannot be exported to `docs/screenshots/` from this integrated browser. Capture the actual page manually using DevTools' Command Menu (`Ctrl+Shift+P`) > **Capture screenshot**, set Device Toolbar to each requested width, and save as `dashboard-320px.png`, `dashboard-768px.png`, `dashboard-1024px.png`, `dashboard-1440px.png`, and `dashboard-dark-theme.png`.
- Zoom at 200%, screen-reader behavior, physical mobile touch, and other browser engines were not tested in this run.
- Browser geometry and computed-color checks do not constitute a contrast audit or complete WCAG conformance evaluation.

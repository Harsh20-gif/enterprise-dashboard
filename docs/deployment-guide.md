# Deployment Guide

## Current Deployment Target

This repository is a static HTML/CSS/JavaScript application. The correct publish directory is `client/`; the repository root contains `netlify.toml` with that setting. There is no build command, package installation, runtime environment variable, or backend service required for the current static app.

No hosting account was accessed and no live deployment URL has been created. The application is not yet deployed.

## Netlify via GitHub

1. Push the intended commit to `main` on `https://github.com/Harsh20-gif/enterprise-dashboard`.
2. In Netlify, choose **Add new site** > **Import an existing project** and authorize/select the GitHub repository `Harsh20-gif/enterprise-dashboard`.
3. Select the `main` production branch.
4. Confirm the build settings: base directory blank/repository root, build command blank, publish directory `client` (also specified in `netlify.toml`). Do not add secrets or environment variables for this static frontend.
5. Start the deploy and wait for the platform’s own successful deploy status. Only then copy the assigned site URL into the README live deployment field.

A provider-side API CORS restriction cannot be repaired with a static-site setting. Verify the FakeStoreAPI endpoints from the deployed site’s Network panel. If the API still lacks permissive CORS or returns an upstream error, the catalog should show its Retry/error state. Do not add an unapproved open proxy; a controlled serverless proxy would need a separate design and security review.

## Alternative: Cloudflare Pages or Vercel

Connect the same GitHub repository and branch. Set the build command to none/blank and output directory to `client`. Do not set a framework preset that expects a build directory. Direct HTML pages have their own `.html` URLs and use relative asset/module paths, so no SPA fallback rewrite is needed.

## Deployment Verification

After the hosting provider reports deployment success:

1. Open the published root and confirm it serves `index.html`.
2. Open `/login.html`, use the documented demo credentials, and confirm the redirect to Overview.
3. Directly open `/products.html`, `/manage-products.html`, `/users.html`, `/reports.html`, and `/settings.html` after signing in.
4. Check CSS and JavaScript requests in DevTools for 200 responses and check the console for uncaught errors.
5. Check FakeStoreAPI requests from the deployed origin; record actual HTTP/CORS outcomes rather than assuming they succeed.
6. Add/edit/delete a local demo product and user, reload, and confirm browser-local persistence.
7. Test cart updates, logout/protected redirects, theme choice, keyboard focus, and mobile widths.
8. Confirm the provider's current deployment URL and write it into README only after this verification.

## Troubleshooting

- **404 for a page:** Confirm publish directory is `client`, not repository root.
- **Missing CSS/modules:** Preserve relative references such as `css/style.css` and `js/products.js`; do not deploy only the HTML file.
- **Modules blocked from `file://`:** Use the hosting origin or a local HTTP server; native ES modules generally cannot be verified by double-clicking files.
- **FakeStoreAPI CORS/522:** The frontend reports this and offers retry. It indicates provider/network availability, not a local fallback dataset.
- **Demo session not retained:** Session uses `sessionStorage`, which is tab-scoped; start the demo login again in a new tab.
- **Local CRUD missing on another device:** These records are stored in that browser only, not in a remote database.

## Live URL

Not deployed yet. Add the provider-issued URL here only after successful deployment and verification: **[deployment URL pending]**.

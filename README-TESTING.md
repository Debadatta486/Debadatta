# Portfolio browser tests

This folder adds real Chromium browser tests to the **nine-panel portfolio**. It does not change the portfolio's HTML or animations.

## What gets checked

- All nine panels load, only one is active, and each is captured in a screenshot.
- Mouse-wheel, keyboard, and mobile touch navigation.
- The delayed ID card entrance and flip interaction.
- The analog Hyderabad clock and light/dark styling.
- All five stages of the Documentation Rescue Mission, including replay.
- Résumé PDF, contact links, chatbot, and feedback controls.
- Uncaught JavaScript errors.

A failing check means something needs investigation. Screenshots are *recorded*, not automatically visually compared with a reference design.

## Installation — GitHub Desktop (easiest)

1. Open the **actual GitHub repository that deploys `debadatta-portfolio.vercel.app`**. Do not put this into an unrelated project.
2. In GitHub Desktop, choose **File → Clone repository** (or **Repository → Show in Finder/Explorer** if already cloned).
3. Make sure the repo's root contains your latest nine-page `index.html` and `resume.pdf`.
4. Copy the contents of this ZIP into the repository root, preserving folders:
   - `.github/workflows/portfolio-tests.yml`
   - `tests/portfolio.spec.mjs`
   - `scripts/serve.mjs`
   - `playwright.config.mjs`
   - `package.json`
   - `README-TESTING.md`
5. In GitHub Desktop, review the added files. Commit as `Add Playwright browser regression tests` and click **Push origin**.
6. On GitHub.com, open your portfolio repository → **Actions** → **Portfolio browser tests**. The run should start after the push to `main`.
7. Open the run → **Chromium — desktop and mobile** to see test results. Download the **portfolio-browser-report** artifact for screenshots, traces, and an HTML report.

**Important:** The folder `.github` starts with a dot and may be hidden in file managers. Ensure the workflow file is actually uploaded. If the repository already has `package.json`, merge the `@playwright/test` dependency and test scripts instead of replacing the existing file.

## Browser-only alternative

Use the GitHub.com **Add file → Upload files** option for `package.json`, `playwright.config.mjs`, and `README-TESTING.md`. Create nested paths using **Add file → Create new file** and type the complete path (for example `.github/workflows/portfolio-tests.yml`). Copy each nested file's content from this kit. Repeat for `tests/portfolio.spec.mjs` and `scripts/serve.mjs`. Commit changes to `main`.

## Manual live-site run

1. In GitHub → **Actions** → **Portfolio browser tests**, click **Run workflow**.
2. Optionally enter `https://debadatta-portfolio.vercel.app/` in **test_url**.
3. Click **Run workflow** again to start.

When `test_url` is blank, tests use the committed `index.html` and `resume.pdf` via a local web server **inside GitHub Actions**. When `test_url` is set, tests check that deployed URL instead. A deployed site with an older version will fail tests for newer features.

## Known limitation in the supplied portfolio version

The version of `index.html` used to prepare this test kit contains JavaScript references to `#thumbs-up` and `#thumbs-down`, but those controls are missing from its HTML. The feedback test and the uncaught-JavaScript-error test may therefore fail on the first run. That is a **real regression to fix**, not a reason to disable the tests. Other failures may reveal additional issues.

## Running locally (optional)

Install Node.js 22+, then run:

```bash
npm install
npx playwright install chromium
npm test
npm run test:report
```

The `npm test` command uses a local server unless you set `TEST_BASE_URL` to an existing deployed URL.

## What this does not do

- Does not publish or change the website by itself.
- Does not guarantee visual perfection: screenshots require human review.
- Does not automatically block Vercel deployment; that requires branch protection or a deployment gate.
- Does not collect passwords or require secrets.

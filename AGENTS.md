# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; picks the UI version from the URL (`?v=1` / `?v=2`, default latest), and lazy-loads that version's `mount`
- `src/versioning/versions.ts` - The version list and URL helpers. Each version has its own version dropdown beside the org button (`src/v1/components/erp/VersionMenu.tsx`, `src/v2/account/VersionMenu.tsx`)
- `src/v1/` - v1, the original UI: `App.tsx`, `components/erp/`, and its own `index.css`. Frozen; do not change it when working on a newer version
- `src/v2/` - v2, the same app rebuilt with the ZF Design Canon: `App.tsx` (routing + shell chrome), `Frame.tsx` (the `SettingsShell` every screen renders in), `screens/`, `account/`, `data/`, and its own `index.css`
- `src/canon/` - The ZF Design Canon (copied from the canon repo, stories excluded). Imported as `'@canon'` only. Local additions: an `actions` slot on `SettingsBar` and `barActions` on `SettingsShell`

## UI versions

Each version is a self-contained app with its own stylesheet, and only one version's CSS is loaded per page (switching versions reloads the page). This matters because the canon resets Tailwind's spacing and font-weight scales, which would break v1's classes if both stylesheets were loaded. Each version's `index.css` uses `@import 'tailwindcss' source(none)` with `@source` limited to its own folders.

To add a version: create `src/vN/main.tsx` exporting `mount(el)`, add it to `VERSIONS` in `src/versioning/versions.ts`, add its loader in `src/main.tsx`, and give it a version dropdown in its header.
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

Each version's `main.tsx` imports its own `index.css` (`src/v1/index.css`, `src/v2/index.css`), so global font wiring belongs there. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults. v2 screens follow the canon's rules: compose from `'@canon'` and use canon tokens, not raw colours or pixel values.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.

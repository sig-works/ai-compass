# AI Compass

AI Compass is a public AI knowledge hub built with Astro, React, and Tailwind CSS. It organizes practical AI guides, glossary entries, prompt patterns, and LLM comparison data into a compact documentation-style website.

## Requirements

- Node.js 22.12 or later
- npm

## Development

```sh
npm install
npm run dev
```

The local development server runs at `http://127.0.0.1:4322/`.

## Build

```sh
npm run build
npm run preview
```

## Quality Check

Run the strict final check before publishing changes:

```sh
npm run check:site
```

## LLM Data

LLM data is updated manually:

```sh
npm run update:llm-data
```

Do not update LLM data on page access. Keep scheduled or automatic update workflows disabled unless they are intentionally changed to manual `workflow_dispatch` runs.

## GitHub Pages

This repository includes a GitHub Pages deployment workflow at `.github/workflows/deploy-pages.yml`.

In the GitHub repository settings, set Pages to use **GitHub Actions** as the build and deployment source. The Astro config automatically sets the correct base path for project pages through GitHub Actions environment variables.

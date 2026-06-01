# Repository Guidelines

## Project Purpose
- Public-facing AI knowledge hub.
- Collect information from official sites, GitHub, and trusted articles, then reorganize it into practical, readable pages.
- Help readers understand AI, compare tools, and find useful prompts.

## Editorial Rules
- Prioritize readability, searchability, calm layout, and practical usefulness.
- Keep pages compact and avoid repeated navigation or unnecessary vertical space.
- Reframe source material instead of copying it.
- Check official or current sources before changing content that can become outdated.
- Avoid the old "8 categories" classification approach.

## Information Architecture
- Keep guide pages and utility/reference pages visually distinct.
- Ship search pages only when they provide real value.
- Use the glossary as the source of truth for specialized terms and tooltips.

## UI Direction
- Base the design on a shadcn dashboard/docs hybrid.
- Keep the interface dense, scannable, calm, and polished.
- Use restrained transparency, blur, border highlights, and layered surfaces.
- Support both light and dark themes intentionally.
- Treat code and prompt blocks as documentation blocks with copy support.

## Operations
- `npm run update:llm-data` is the manual update path for LLM data.
- LLM update workflows must remain manual with `workflow_dispatch`.
- `npm run check:site` is the strict final check before publishing.

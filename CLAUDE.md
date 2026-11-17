# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static Astro 5 blog ("a decision log on engineering, investing, and thinking"), deployed at https://www.chenkai.blog.
No client-side JS framework: just `.astro` components, Markdown/MDX content, and plain CSS.

## Commands

- `npm run dev`: dev server at `localhost:4321`. Drafts are visible here.
- `npm run build`: production build to `./dist/`. This is the only verification step. There is no test suite, linter, or
  formatter configured, and `astro check` is not installed (it would need `@astrojs/check`).
- `npm run preview`: serve the built `dist/`.
- `npx astro sync`: regenerate `.astro/` content types after changing `src/content.config.ts`.

## Repo gotcha

There is no `.gitignore`. `node_modules/`, `.astro/`, and `.DS_Store` files are committed, so `npm install` and builds
show up in `git status`. Stage files explicitly instead of `git add -A` unless dependency changes are intended.

## Architecture

**Entries pipeline.** Posts live in `src/content/blog/*.{md,mdx}` and are loaded by the glob loader in
`src/content.config.ts`. The file name is the entry id and URL (`/blog/<id>/`). Every page and the RSS feed must read
posts through `src/lib/entries.ts`, never `getCollection` directly. That module owns:

- draft filtering (drafts included only when `import.meta.env.DEV`)
- ordering (`getEntries()` returns newest first)
- numbering: entry numbers (001, 002, …) are computed at build time by ascending `pubDate` among published entries.
  Nothing is stored in frontmatter, so changing a `pubDate` or publishing a draft renumbers later entries.
- prev/next (`getAdjacentEntries` assumes newest-first input: `previous` is the older entry)
- URL builders (`entryUrl`, `topicUrl`). Use these instead of hand-writing paths.

**Topics.** `TOPICS` in `src/consts.ts` is the single source. `TOPIC_SLUGS` feeds the `topic` zod enum in the content
schema, and `src/pages/topics/[topic].astro` generates one page per topic from it. Adding a topic means editing only
`TOPICS`. `consts.ts` also holds `SITE` metadata and `SOCIAL_LINKS` (icons are SVG path data in a 16×16 viewBox).

**Layouts.** `BaseLayout.astro` is the html shell (BaseHead, Header, Footer, skip link). `BlogPost.astro` (entry page)
and `Page.astro` (plain pages like About) wrap it. `BaseHead.astro` imports the fonts and `global.css`, so a page only
gets styles if it renders through `BaseLayout`. Pass `image`/`ogType` through to `BaseHead` for link previews. An
entry's `heroImage` doubles as its OG image.

**Frontmatter** (schema in `content.config.ts`): `title`, `description`, `topic`, `pubDate`, optional `updatedDate`,
optional `heroImage` (path relative to the post, e.g. `'../../assets/x.png'`, processed by `astro:assets`), and
`draft` (default `false`). `src/content/blog/markdown-style-guide.md` is a permanent draft used to check typography in
dev. Don't publish or delete it.

## Styling

The design imitates engineering computation paper, a pale-green grid pad. The grid shows through the page background,
while "printed" parts (header band, entry title blocks, ledger rows) sit on solid `var(--pad)` so the grid is hidden behind them.

- All design tokens live in `src/styles/tokens.css`. `global.css` has base styles and the `.prose` rules for post bodies.
  Components use scoped `<style>` blocks that reference tokens. Use `:global(...)` to style a child component's
  class (e.g. `.entry-row :global(.entry-date)`).
- Spacing: use multiples of `var(--grid)` (20px, whole pixels so grid lines stay crisp).
- Type: only the scale tokens (`--text-sm` … `--text-3xl`, Bringhurst's 14/16/18/21/24/30/36/48/60). `--font-lettering`
  (Barlow Semi Condensed 500/600) is for headings, nav, numbers, and labels. `--font-text` (Literata) is for body text.
  Both stacks include CJK fallbacks.
- Color rules: `--red-pencil` is only for annotations (active nav, updated dates). `--royal-ink` is for links and focus.
  `--graphite` is for meta text.
- Keep labels in sentence case.

## Code style

Tabs for indentation, single quotes, semicolons. Components declare an `interface Props` (or `type Props`) with JSDoc on
non-obvious props. Shared types (`Entry`, `AdjacentEntries`, `TopicSlug`) come from `lib/entries.ts` and `consts.ts`.

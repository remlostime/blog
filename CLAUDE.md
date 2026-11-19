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

**Languages.** The site is bilingual: English is unprefixed (`/`, `/blog/<slug>/`, `/about/`, `/rss.xml`) and Chinese
lives under `/zh/` (`/zh/`, `/zh/blog/<slug>/`, …). Every page is in exactly one language.

- `src/lib/i18n.ts` holds `LOCALES`, `LOCALE_META` (html lang, og locale, date locale, endonym), and path helpers
  (`localizePath`, `pageAlternates`, `homeUrl`, `aboutUrl`, `feedUrl`, `formatDate`). Keep `LOCALES` in sync with the
  `i18n` and `sitemap` blocks in `astro.config.mjs`.
- `src/lib/ui.ts` holds every interface string per locale. Add a key to `UiStrings` and both locales; a missing key
  renders `undefined`, and the build doesn't type-check.
- Components get their locale from `getLocale(Astro.currentLocale)`, never from props. `getStaticPaths` can't see the
  locale, so route files pass a literal (`getEntryPaths('zh')`).
- Page markup lives in `src/views/*.astro`. Each page has two thin route files, `src/pages/X` and `src/pages/zh/X`,
  that render the same view. Adding a page means one view and two routes. About is the exception: its bio is prose,
  so each route passes its own paragraphs into `AboutView`.
- Entry route files must declare `export async function getStaticPaths()`. An arrow-function export makes the Astro
  compiler hoist the frontmatter's `await render(Astro.props…)` out of the component, and the build fails.
- The header switch goes to the same page in the other language, or to that language's entry list when an entry has
  no translation. The entry title block lists the available versions and circles the current one.

**Entries pipeline.** Posts live in `src/content/blog/<locale>/<slug>.{md,mdx}` and are loaded by the glob loader in
`src/content.config.ts`. Files with the same slug in different locale folders are translations of one entry. A file
outside a locale folder, or a `slug:` frontmatter override, makes the build throw. Every page and the RSS feeds must
read posts through `src/lib/entries.ts`, never `getCollection` directly. That module owns:

- draft filtering (drafts included only when `import.meta.env.DEV`)
- translation groups: `getEntries(locale)` returns one `Entry` per group, newest first, showing the requested
  locale's version or, if there is none, the original. Such entries keep their own language and link to their
  original page, tagged with a `LanguageTag`. Translations must share `topic` (the build throws otherwise) and should
  keep the original's `pubDate`.
- numbering: entry numbers (001, 002, …) are computed at build time per translation group, by ascending `pubDate`
  of the earliest published version, and shared by every version. Nothing is stored in frontmatter, so changing a
  `pubDate` or publishing a draft renumbers later entries.
- prev/next (`getAdjacentEntries` walks the locale's own list, newest first: `previous` is the older entry)
- URL builders (`entryUrl`, `entryAlternates`, `entriesUrl`, `topicUrl`). Use these instead of hand-writing paths.
  `entryUrl(post)` uses the post's own language folder.

Feeds (`src/lib/feed.ts`, routed from `pages/rss.xml.js` and `pages/zh/rss.xml.js`) carry only entries written in
their own language.

**Topics.** `TOPICS` in `src/consts.ts` is the single source, with a label and summary per locale. `TOPIC_SLUGS` feeds
the `topic` zod enum in the content schema, and the two `topics/[topic].astro` routes generate one page per topic from
it. Adding a topic means editing only `TOPICS`. `consts.ts` also holds `SITE` metadata and `SOCIAL_LINKS` (icons are
SVG path data in a 16×16 viewBox; site-relative hrefs are localized when rendered).

**Layouts.** `BaseLayout.astro` is the html shell (`<html lang>`, BaseHead, Header, Footer, skip link). `BlogPost.astro`
(entry page) and `Page.astro` (plain pages like About) wrap it. `BaseHead.astro` imports the fonts and `global.css`,
so a page only gets styles if it renders through `BaseLayout`. It also writes the canonical URL, `hreflang` links,
and `og:locale` from the page's `alternates` (every locale at the same path by default; entries pass
`entryAlternates`). Pass `image`/`ogType` through to `BaseHead` for link previews. An entry's `heroImage` doubles as
its OG image.

**Frontmatter** (schema in `content.config.ts`): `title`, `description`, `topic`, `pubDate`, optional `updatedDate`,
optional `heroImage` (path relative to the post, e.g. `'../../../assets/x.png'`, processed by `astro:assets`), and
`draft` (default `false`). `src/content/blog/en/markdown-style-guide.md` is a permanent draft used to check typography
in dev. Don't publish or delete it.

## Styling

The design imitates engineering computation paper, a pale-green grid pad. The grid shows through the page background,
while "printed" parts (header band, entry title blocks, ledger rows) sit on solid `var(--pad)` so the grid is hidden behind them.

- All design tokens live in `src/styles/tokens.css`. `global.css` has base styles and the `.prose` rules for post bodies.
  Components use scoped `<style>` blocks that reference tokens. Use `:global(...)` to style a child component's
  class (e.g. `.entry-row :global(.entry-date)`).
- Spacing: use multiples of `var(--grid)` (20px, whole pixels so grid lines stay crisp).
- Type: only the scale tokens (`--text-sm` … `--text-3xl`, Bringhurst's 14/16/18/21/24/30/36/48/60). `--font-lettering`
  (Barlow Semi Condensed 500/600) is for headings, nav, numbers, and labels. `--font-text` (Literata) is for body text.
  Both stacks fall back to system CJK faces after their Latin fallbacks.
- Chinese: `global.css` has a `:lang(zh)` section (1.8 body leading, looser headings, `--measure-cjk`, emphasis dots
  instead of italics). Components with their own tight Latin leading add a local `:lang(zh)` override. Set `lang` on
  any title shown in the other language.
- Color rules: `--red-pencil` is only for annotations (active nav, updated dates, the circled current language).
  `--royal-ink` is for links and focus. `--graphite` is for meta text.
- Keep labels in sentence case.

## Code style

Tabs for indentation, single quotes, semicolons. Components declare an `interface Props` (or `type Props`) with JSDoc on
non-obvious props. Shared types (`Entry`, `AdjacentEntries`, `EntryPageProps`, `TopicSlug`, `Locale`, `Alternates`) come from
`lib/entries.ts`, `consts.ts`, and `lib/i18n.ts`.

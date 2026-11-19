# chenkai.blog

Kai Chen's decision log on engineering, investing, and thinking. Built with [Astro](https://astro.build).
It is live at <https://www.chenkai.blog>.

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start the dev server at `localhost:4321`     |
| `npm run build`   | Build the production site to `./dist/`       |
| `npm run preview` | Preview the production build locally         |

## Adding an entry

Create a Markdown or MDX file in `src/content/blog/en/` (English) or `src/content/blog/zh/` (Chinese). The file name
becomes the URL: `/blog/<file-name>/` for English, `/zh/blog/<file-name>/` for Chinese.

```yaml
---
title: 'What the title says'
description: 'One sentence for the entry list, RSS, and link previews.'
topic: engineering # engineering | investing | thinking
pubDate: 'Feb 2 2026'
updatedDate: 'Mar 1 2026' # optional; shown in red pencil in the title block
heroImage: '../../../assets/your-image.png' # optional; also used as the link-preview image
draft: true # optional; shows in `npm run dev`, hidden from the build and RSS
---
```

To translate an entry, add a file with the same name in the other language's folder. Keep the same `topic` and
`pubDate`. The two versions share one entry number, link to each other from the title block, and get `hreflang`
links. An entry without a translation still appears in the other language's lists, tagged with its language, and
opens in the original.

Entry numbers (001, 002, …) are assigned by publish date among published entries. Nothing is stored in the file.
`src/content/blog/en/markdown-style-guide.md` is a permanent draft for checking typography in dev.

## Languages

English pages are unprefixed and Chinese pages live under `/zh/`. Each page exists in both languages: a view in
`src/views/` holds the markup, and two thin route files (`src/pages/X` and `src/pages/zh/X`) render it. Interface
strings are in `src/lib/ui.ts`, locale settings and path helpers in `src/lib/i18n.ts`. Each language has its own RSS
feed (`/rss.xml`, `/zh/rss.xml`) with only the entries written in it.

## Structure

```text
src/
├── consts.ts             Site info, social links, and the topic list (labels per language)
├── content.config.ts     Frontmatter schema for entries
├── content/blog/
│   ├── en/               English entries
│   └── zh/               Chinese entries; same file name = translation
├── lib/
│   ├── entries.ts        Draft filtering, translation groups, numbering, prev/next, URLs
│   ├── i18n.ts           Locales, locale metadata, localized paths, dates
│   ├── ui.ts             Interface strings per language
│   └── feed.ts           RSS for each language
├── layouts/
│   ├── BaseLayout.astro  html/head/header/footer shell
│   ├── BlogPost.astro    Entry page: title block, hero, body, pager
│   └── Page.astro        Plain page (About)
├── components/           Header, Footer, EntryList, EntryTitleBlock, EntryPager, LanguageTag, TopicNav, …
├── views/                Page markup shared by both languages (home, entries, topic, about)
├── pages/
│   ├── index.astro       Intro + latest entries
│   ├── blog/             All entries by year, and each entry page
│   ├── topics/[topic]    One page per topic
│   ├── about.astro
│   ├── rss.xml.js
│   └── zh/               The same routes in Chinese
└── styles/
    ├── tokens.css        Colors, type, scale, grid
    └── global.css        Base styles, `.prose`, and Chinese (`:lang(zh)`) rules
```

All pages and the RSS feeds read entries through `src/lib/entries.ts`. Add new listing logic there.

## Design

The design follows engineering computation paper, the pale-green grid pad. The grid ghosts through faintly, the
way it does on a real pad. The printed parts of a sheet are solid paper: the header band, entry title blocks, and ledger rows.
The grid shows only where you'd write by hand.

| Token          | Value     | Use                                                                       |
| :------------- | :-------- | :------------------------------------------------------------------------ |
| `--pad`        | `#f2f5ed` | Page ground                                                               |
| `--rule`       | `#ccd8c2` | Grid and row rules                                                        |
| `--ink`        | `#1e2a44` | Text and headings                                                         |
| `--royal-ink`  | `#24479a` | Links and focus ring                                                      |
| `--red-pencil` | `#b0281c` | Annotations only: active nav, updated dates, the circled current language |
| `--graphite`   | `#566352` | Meta text, labels, title-block lines                                      |

- **Barlow Semi Condensed** (500, 600): headings, navigation, entry numbers, and labels.
- **Literata** (variable, with italics): body text at 18px with 1.7 line height and a 34em measure.
- Chinese falls back to system faces (PingFang SC / Noto Sans SC for lettering, Songti SC / Noto Serif SC for text) at
  1.8 line height and a 36em measure, with emphasis dots instead of italics.

Type sizes follow Bringhurst's scale: 14, 16, 18, 21, 24, 30, 36, 48, 60.
Keep labels in sentence case, and keep red pencil for annotations.

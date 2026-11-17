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

Create a Markdown or MDX file in `src/content/blog/`. The file name becomes the URL: `/blog/<file-name>/`.

```yaml
---
title: 'What the title says'
description: 'One sentence for the entry list, RSS, and link previews.'
topic: engineering # engineering | investing | thinking
pubDate: 'Feb 2 2026'
updatedDate: 'Mar 1 2026' # optional; shown in red pencil in the title block
heroImage: '../../assets/your-image.png' # optional; also used as the link-preview image
draft: true # optional; shows in `npm run dev`, hidden from the build and RSS
---
```

Entry numbers (001, 002, …) are assigned by publish date among published entries. Nothing is stored in the file.
`src/content/blog/markdown-style-guide.md` is a permanent draft for checking typography in dev.

## Structure

```text
src/
├── consts.ts             Site info, social links, and the topic list
├── content.config.ts     Frontmatter schema for entries
├── lib/entries.ts        Draft filtering, ordering, numbering, prev/next, URLs
├── layouts/
│   ├── BaseLayout.astro  html/head/header/footer shell
│   ├── BlogPost.astro    Entry page: title block, hero, body, pager
│   └── Page.astro        Plain page (About)
├── components/           Header, Footer, EntryList, EntryTitleBlock, EntryPager, TopicNav, …
├── pages/
│   ├── index.astro       Intro + latest entries
│   ├── blog/             All entries by year, and each entry page
│   ├── topics/[topic]    One page per topic
│   ├── about.astro
│   └── rss.xml.js
└── styles/
    ├── tokens.css        Colors, type, scale, grid
    └── global.css        Base styles and `.prose`
```

All pages and the RSS feed read entries through `src/lib/entries.ts`. Add new listing logic there.

## Design

The design follows engineering computation paper, the pale-green grid pad. The grid ghosts through faintly, the
way it does on a real pad. The printed parts of a sheet are solid paper: the header band, entry title blocks, and ledger rows.
The grid shows only where you'd write by hand.

| Token          | Value     | Use                                         |
| :------------- | :-------- | :------------------------------------------ |
| `--pad`        | `#f2f5ed` | Page ground                                 |
| `--rule`       | `#ccd8c2` | Grid and row rules                          |
| `--ink`        | `#1e2a44` | Text and headings                           |
| `--royal-ink`  | `#24479a` | Links and focus ring                        |
| `--red-pencil` | `#b0281c` | Annotations only: active nav, updated dates |
| `--graphite`   | `#566352` | Meta text, labels, title-block lines        |

- **Barlow Semi Condensed** (500, 600): headings, navigation, entry numbers, and labels.
- **Literata** (variable, with italics): body text at 18px with 1.7 line height and a 34em measure.

Type sizes follow Bringhurst's scale: 14, 16, 18, 21, 24, 30, 36, 48, 60.
Keep labels in sentence case, and keep red pencil for annotations.

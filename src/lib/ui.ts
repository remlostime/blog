import type { Locale } from './i18n';

// Every interface string, per locale. Long-form copy (About, entries) lives in its own page or content file.

export interface UiStrings {
	skipLink: string;
	nav: { label: string; entries: string; about: string; rss: string };
	/** Each language's name, written in this locale. Used to tag entries in another language. */
	languageNames: Record<Locale, string>;
	entry: { label: string; topic: string; date: string; updated: string; language: string; draft: string };
	pager: { label: string; previous: string; next: string; all: string };
	home: { title: string; lede: string; latest: string; all: string };
	entries: { title: string; lede: string; description: string };
	topics: { navLabel: string; empty: (topic: string) => string; seeAll: string };
	about: { title: string; description: string; topicSeparator: string };
	feed: { title: string };
}

const en: UiStrings = {
	skipLink: 'Skip to content',
	nav: { label: 'Main', entries: 'Entries', about: 'About', rss: 'RSS' },
	languageNames: { en: 'English', zh: 'Chinese' },
	entry: { label: 'Entry', topic: 'Topic', date: 'Date', updated: 'Updated', language: 'Language', draft: 'Draft' },
	pager: { label: 'More entries', previous: 'Previous entry', next: 'Next entry', all: 'See all entries' },
	home: {
		title: 'A decision log on engineering, investing, and thinking.',
		lede: "I'm Kai Chen, an iOS engineer in the San Francisco Bay Area. I write things down before I know how they turn out, then come back to see what held up.",
		latest: 'Latest entries',
		all: 'All entries',
	},
	entries: {
		title: 'Entries',
		lede: "Everything I've written down, newest first.",
		description: "Every entry in Kai Chen's decision log, newest first.",
	},
	topics: {
		navLabel: 'Topics',
		empty: (topic) => `Nothing filed under ${topic} yet.`,
		seeAll: 'See all entries',
	},
	about: {
		title: 'About',
		description: 'Kai Chen is an iOS engineer in the San Francisco Bay Area.',
		topicSeparator: ': ',
	},
	feed: { title: 'Kai Chen' },
};

const zh: UiStrings = {
	skipLink: '跳到正文',
	nav: { label: '主导航', entries: '文章', about: '关于', rss: 'RSS' },
	languageNames: { en: '英文', zh: '中文' },
	entry: { label: '编号', topic: '主题', date: '日期', updated: '更新', language: '语言', draft: '草稿' },
	pager: { label: '更多文章', previous: '上一篇', next: '下一篇', all: '查看全部文章' },
	home: {
		title: '一份关于工程、投资和思考的决策日志。',
		lede: '我是 Kai Chen，在旧金山湾区做 iOS 工程师。我会在结果揭晓之前把判断写下来，之后再回来看哪些站住了。',
		latest: '最新文章',
		all: '全部文章',
	},
	entries: {
		title: '文章',
		lede: '我写下的所有文章，最新的在前。',
		description: 'Kai Chen 决策日志里的全部文章，最新的在前。',
	},
	topics: {
		navLabel: '主题',
		empty: (topic) => `“${topic}”下还没有文章。`,
		seeAll: '查看全部文章',
	},
	about: {
		title: '关于',
		description: 'Kai Chen 是旧金山湾区的一名 iOS 工程师。',
		topicSeparator: '：',
	},
	feed: { title: 'Kai Chen（中文）' },
};

export const UI = { en, zh } as const satisfies Record<Locale, UiStrings>;

export function ui(locale: Locale): UiStrings {
	return UI[locale];
}

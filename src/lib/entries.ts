import { type CollectionEntry, getCollection } from 'astro:content';
import { TOPICS, type TopicSlug } from '../consts';
import { type Alternates, isLocale, LOCALES, type Locale, localizePath } from './i18n';

// Single source of truth for which posts are published, how translations pair up, how entries are ordered and
// numbered, and what their URLs are. Every page and feed reads entries through this module.
//
// Posts live in `src/content/blog/<locale>/<slug>.md`. Files with the same slug are translations of one entry.

export type Post = CollectionEntry<'blog'>;

/** The versions of one entry, keyed by locale. */
export type Versions = Partial<Record<Locale, Post>>;

export interface Entry {
	/** The version to show: the requested locale's if it exists, otherwise the original. */
	post: Post;
	/** Language of `post`, taken from its folder. */
	locale: Locale;
	/** Translation key: the file name without its locale folder. */
	slug: string;
	/** Position in the log, counted from the oldest published entry and shared by every version. Drafts have none. */
	number?: number;
	/** Every visible version of this entry, including `post`. */
	versions: Versions;
}

export interface AdjacentEntries {
	/** The entry written before this one. */
	previous?: Entry;
	/** The entry written after this one. */
	next?: Entry;
}

export interface EntryPageProps extends AdjacentEntries {
	entry: Entry;
}

export interface EntriesByYear {
	year: number;
	entries: Entry[];
}

interface EntryGroup {
	slug: string;
	versions: Versions;
	/** The earliest published version, or the earliest draft if nothing is published. */
	original: Post;
	number?: number;
}

function parseId(id: string): { locale: Locale; slug: string } {
	const [folder, ...rest] = id.split('/');
	if (!isLocale(folder) || rest.length === 0) {
		throw new Error(`Entry "${id}" must live in src/content/blog/<${LOCALES.join('|')}>/.`);
	}
	return { locale: folder, slug: rest.join('/') };
}

const byPubDateAscending = (a: Post, b: Post) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf();

/** Translation groups, oldest first. Drafts are included only in `astro dev`. */
async function getGroups(): Promise<EntryGroup[]> {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	const versionsBySlug = new Map<string, Versions>();
	for (const post of posts) {
		const { locale, slug } = parseId(post.id);
		versionsBySlug.set(slug, { ...versionsBySlug.get(slug), [locale]: post });
	}

	const groups = [...versionsBySlug].map(([slug, versions]) => {
		// LOCALES order breaks pubDate ties, so the default locale counts as the original.
		const all = LOCALES.flatMap((locale) => versions[locale] ?? []);
		const topics = new Set(all.map((post) => post.data.topic));
		if (topics.size > 1) throw new Error(`Translations of "${slug}" disagree on topic: ${[...topics].join(', ')}.`);
		const published = all.filter((post) => !post.data.draft);
		const [original] = [...(published.length > 0 ? published : all)].sort(byPubDateAscending);
		return { slug, versions, original, isPublished: published.length > 0 };
	});

	groups.sort((a, b) => byPubDateAscending(a.original, b.original) || a.slug.localeCompare(b.slug));
	let published = 0;
	return groups.map(({ isPublished, ...group }) => ({ ...group, number: isPublished ? ++published : undefined }));
}

/** The log as read in `locale`, newest first. Entries without a `locale` version appear in their original language. */
export async function getEntries(locale: Locale): Promise<Entry[]> {
	const groups = await getGroups();
	return groups
		.map(({ slug, versions, original, number }) => {
			const post = versions[locale] ?? original;
			return { post, locale: parseId(post.id).locale, slug, versions, number: post.data.draft ? undefined : number };
		})
		.reverse();
}

export async function getEntriesByTopic(locale: Locale, topic: TopicSlug): Promise<Entry[]> {
	const entries = await getEntries(locale);
	return entries.filter(({ post }) => post.data.topic === topic);
}

/** Static paths for the entry pages of `locale`: one per entry written in that locale. */
export async function getEntryPaths(locale: Locale) {
	const entries = await getEntries(locale);
	return entries
		.filter((entry) => entry.locale === locale)
		.map((entry) => ({
			params: { slug: entry.slug },
			props: { entry, ...getAdjacentEntries(entries, entry.slug) } satisfies EntryPageProps,
		}));
}

export function getTopicPaths() {
	return TOPICS.map((topic) => ({ params: { topic: topic.slug }, props: { topic: topic.slug } }));
}

/** Neighbours of `slug` within `entries`, which must be ordered newest first. */
export function getAdjacentEntries(entries: Entry[], slug: string): AdjacentEntries {
	const index = entries.findIndex((entry) => entry.slug === slug);
	if (index === -1) return {};
	return { previous: entries[index + 1], next: entries[index - 1] };
}

export function groupEntriesByYear(entries: Entry[]): EntriesByYear[] {
	const groups = new Map<number, Entry[]>();
	for (const entry of entries) {
		const year = entry.post.data.pubDate.getFullYear();
		groups.set(year, [...(groups.get(year) ?? []), entry]);
	}
	return [...groups].map(([year, entries]) => ({ year, entries }));
}

/** The post's own page, in the post's own language. */
export function entryUrl(post: Post): string {
	const { locale, slug } = parseId(post.id);
	return localizePath(locale, `/blog/${slug}/`);
}

export function entryAlternates(entry: Entry): Alternates {
	return Object.fromEntries(
		LOCALES.flatMap((locale) => {
			const post = entry.versions[locale];
			return post ? [[locale, entryUrl(post)]] : [];
		}),
	);
}

export function entriesUrl(locale: Locale): string {
	return localizePath(locale, '/blog/');
}

export function topicUrl(locale: Locale, topic: TopicSlug): string {
	return localizePath(locale, `/topics/${topic}/`);
}

export function formatEntryNumber(number: number): string {
	return String(number).padStart(3, '0');
}

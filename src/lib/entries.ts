import { type CollectionEntry, getCollection } from 'astro:content';
import type { TopicSlug } from '../consts';

// Single source of truth for which posts are published, how they are ordered, and how they are numbered.
// Every page and feed reads entries through this module.

export type Post = CollectionEntry<'blog'>;

export interface Entry {
	post: Post;
	/** Position in the log, counted from the oldest published entry. Drafts have no number. */
	number?: number;
}

export interface AdjacentEntries {
	/** The entry written before this one. */
	previous?: Entry;
	/** The entry written after this one. */
	next?: Entry;
}

export interface EntriesByYear {
	year: number;
	entries: Entry[];
}

const byPubDateAscending = (a: Post, b: Post) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf();

/** Published entries, newest first. Drafts are included only in `astro dev`. */
export async function getEntries(): Promise<Entry[]> {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	let published = 0;
	return [...posts]
		.sort(byPubDateAscending)
		.map((post) => ({ post, number: post.data.draft ? undefined : ++published }))
		.reverse();
}

export async function getEntriesByTopic(topic: TopicSlug): Promise<Entry[]> {
	const entries = await getEntries();
	return entries.filter(({ post }) => post.data.topic === topic);
}

/** Neighbours of `id` within `entries`, which must be ordered newest first. */
export function getAdjacentEntries(entries: Entry[], id: string): AdjacentEntries {
	const index = entries.findIndex(({ post }) => post.id === id);
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

export function entryUrl(post: Post): string {
	return `/blog/${post.id}/`;
}

export function topicUrl(topic: TopicSlug): string {
	return `/topics/${topic}/`;
}

export function formatEntryNumber(number: number): string {
	return String(number).padStart(3, '0');
}

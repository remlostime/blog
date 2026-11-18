// Site-wide data. Import from anywhere with `import { SITE } from '../consts'`.

export const SITE = {
	title: 'Kai Chen',
	description: 'A decision log on engineering, investing, and thinking.',
	author: 'Kai Chen',
	url: 'https://www.chenkai.blog',
} as const;

export interface SocialLink {
	label: string;
	href: string;
	/** SVG path data drawn in a 16×16 viewBox. */
	iconPath: string;
	external: boolean;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
	{
		label: 'GitHub',
		href: 'https://github.com/remlostime',
		external: true,
		iconPath:
			'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z',
	},
	{
		label: 'RSS feed',
		href: '/rss.xml',
		external: false,
		iconPath:
			'M2 1a1 1 0 0 0 0 2c6.08 0 11 4.92 11 11a1 1 0 1 0 2 0C15 6.82 9.18 1 2 1zm0 4.5a1 1 0 0 0 0 2A6.5 6.5 0 0 1 8.5 14a1 1 0 1 0 2 0A8.5 8.5 0 0 0 2 5.5zM3.5 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
	},
];

export const TOPICS = [
	{
		slug: 'engineering',
		label: 'Engineering',
		summary: 'iOS, architecture, building with AI agents, and the cost of technical decisions.',
	},
	{
		slug: 'investing',
		label: 'Investing',
		summary: 'Not recommendations. Frameworks, risk, and post-mortems.',
	},
	{
		slug: 'thinking',
		label: 'Thinking',
		summary: 'How I reason about uncertainty, incentives, and long-term trade-offs.',
	},
] as const;

export type Topic = (typeof TOPICS)[number];
export type TopicSlug = Topic['slug'];

export const TOPIC_SLUGS = TOPICS.map((topic) => topic.slug) as [TopicSlug, ...TopicSlug[]];

export function getTopic(slug: TopicSlug): Topic {
	const topic = TOPICS.find((candidate) => candidate.slug === slug);
	if (!topic) throw new Error(`Unknown topic: ${slug}`);
	return topic;
}

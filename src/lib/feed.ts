import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getTopic, SITE } from '../consts';
import { entryUrl, getEntries } from './entries';
import { getLocale, homeUrl, LOCALE_META } from './i18n';
import { ui } from './ui';

/** RSS for the requesting locale. Each feed carries only entries written in its language. */
export async function GET(context: APIContext) {
	const locale = getLocale(context.currentLocale);
	const entries = (await getEntries(locale)).filter((entry) => entry.locale === locale);
	return rss({
		title: ui(locale).feed.title,
		description: SITE.description[locale],
		// The channel links to this locale's home page; item paths are root-relative, so they resolve the same way.
		site: new URL(homeUrl(locale), context.site ?? SITE.url).href,
		customData: `<language>${LOCALE_META[locale].htmlLang}</language>`,
		items: entries.map(({ post }) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: entryUrl(post),
			categories: [getTopic(post.data.topic, locale).label],
		})),
	});
}

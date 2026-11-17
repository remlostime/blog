import rss from '@astrojs/rss';
import { getTopic, SITE } from '../consts';
import { entryUrl, getEntries } from '../lib/entries';

export async function GET(context) {
	const entries = await getEntries();
	return rss({
		title: SITE.title,
		description: SITE.description,
		site: context.site,
		items: entries.map(({ post }) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: entryUrl(post),
			categories: [getTopic(post.data.topic).label],
		})),
	});
}

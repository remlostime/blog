// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.chenkai.blog',
	// Keep in sync with LOCALES and LOCALE_META in src/lib/i18n.ts. English is unprefixed; Chinese lives under /zh/.
	i18n: {
		locales: ['en', 'zh'],
		defaultLocale: 'en',
		routing: { prefixDefaultLocale: false },
	},
	integrations: [mdx(), sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-CN' } } })],
	markdown: {
		shikiConfig: {
			theme: 'github-light',
		},
	},
});

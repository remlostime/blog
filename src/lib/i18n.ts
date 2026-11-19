// Locales, their metadata, and locale-aware path helpers. No Astro imports, so `consts.ts` and `ui.ts` can use these
// types without an import cycle. Keep `LOCALES` in sync with the `i18n` block in `astro.config.mjs`.

export const LOCALES = ['en', 'zh'] as const;

export type Locale = (typeof LOCALES)[number];

/** Served without a URL prefix. Every other locale lives under `/<locale>/`. */
export const DEFAULT_LOCALE = 'en' satisfies Locale;

export interface LocaleMeta {
	/** BCP 47 tag for `<html lang>`, `hreflang`, and RSS `<language>`. */
	htmlLang: string;
	/** Open Graph locale, e.g. `en_US`. */
	ogLocale: string;
	/** Locale passed to `toLocaleDateString`. */
	dateLocale: string;
	/** The language's name in itself, used by language switches. */
	endonym: string;
}

export const LOCALE_META = {
	en: { htmlLang: 'en', ogLocale: 'en_US', dateLocale: 'en-US', endonym: 'English' },
	zh: { htmlLang: 'zh-CN', ogLocale: 'zh_CN', dateLocale: 'zh-CN', endonym: '中文' },
} as const satisfies Record<Locale, LocaleMeta>;

/** One page's URL path in each locale where that page exists. */
export type Alternates = Partial<Record<Locale, string>>;

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}

/** Narrows `Astro.currentLocale` (or `context.currentLocale` in endpoints) to a `Locale`. */
export function getLocale(current: string | undefined): Locale {
	const locale = current ?? DEFAULT_LOCALE;
	if (!isLocale(locale)) throw new Error(`Unknown locale "${locale}". Update LOCALES in src/lib/i18n.ts.`);
	return locale;
}

export function otherLocales(locale: Locale): Locale[] {
	return LOCALES.filter((candidate) => candidate !== locale);
}

/** Prefixes a site path for `locale`: `('zh', '/')` → `/zh/`, `('zh', '/rss.xml')` → `/zh/rss.xml`. */
export function localizePath(locale: Locale, path: string): string {
	return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

/** Strips a locale prefix on a segment boundary: `/zh` and `/zh/` → `/`, `/zh/about/` → `/about/`. */
export function unlocalizePath(pathname: string): string {
	for (const locale of otherLocales(DEFAULT_LOCALE)) {
		const prefix = new RegExp(`^/${locale}(?=/|$)`);
		if (prefix.test(pathname)) return pathname.replace(prefix, '') || '/';
	}
	return pathname;
}

/** Alternates for a page that exists in every locale, such as About or a topic page. */
export function pageAlternates(pathname: string): Alternates {
	const path = unlocalizePath(pathname);
	const withSlash = path.endsWith('/') || /\.\w+$/.test(path) ? path : `${path}/`;
	return Object.fromEntries(LOCALES.map((locale) => [locale, localizePath(locale, withSlash)]));
}

export function homeUrl(locale: Locale): string {
	return localizePath(locale, '/');
}

export function aboutUrl(locale: Locale): string {
	return localizePath(locale, '/about/');
}

export function feedUrl(locale: Locale): string {
	return localizePath(locale, '/rss.xml');
}

export function formatDate(date: Date, locale: Locale): string {
	return date.toLocaleDateString(LOCALE_META[locale].dateLocale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

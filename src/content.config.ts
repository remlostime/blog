import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { TOPIC_SLUGS } from './consts';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			topic: z.enum(TOPIC_SLUGS),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// Drafts render in `astro dev` but are left out of production builds and the RSS feed.
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };

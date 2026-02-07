import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'settings',
  title: 'Global Settings',
  type: 'document',
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'features', title: 'Features' },
    { name: 'social', title: 'Social' },
  ],
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'localizedString',
      group: 'seo',
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description (SEO)',
      type: 'localizedString',
      group: 'seo',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image (Default)',
      type: 'image',
      options: { hotspot: true },
      group: 'seo',
    }),
    defineField({
      name: 'isRetroMode',
      title: 'Retro Mode Active',
      type: 'boolean',
      description: 'Activates 8-bit visual elements globally.',
      initialValue: false,
      group: 'features',
    }),
    defineField({
      name: 'socials',
      title: 'Social Links',
      type: 'array',
      group: 'social',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', type: 'string', title: 'Platform' },
            { name: 'url', type: 'url', title: 'URL' },
          ],
        },
      ],
    }),
  ],
})

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  groups: [
    { name: 'details', title: 'Details' },
    { name: 'content', title: 'Content Modules' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      group: 'details',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      group: 'details',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'localizedString',
      group: 'details',
    }),
    defineField({
      name: 'icon',
      title: 'Icon (SVG Code)',
      type: 'text',
      rows: 5,
      description: 'Paste the raw SVG code here.',
      group: 'details',
    }),
    defineField({
      name: 'modules',
      title: 'Page Modules',
      type: 'array',
      group: 'content',
      of: [
        { type: 'blockHero' },
        { type: 'blockContent' },
        { type: 'blockGallery' },
        { type: 'blockComparisonSlider' },
        { type: 'blockCta' },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title.fr',
      subtitle: 'shortDescription.fr',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Service',
        subtitle: subtitle || '',
      }
    },
  },
})

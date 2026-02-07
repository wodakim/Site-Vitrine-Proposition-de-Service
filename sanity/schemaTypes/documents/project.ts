import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'details', title: 'Details' },
    { name: 'media', title: 'Media' },
    { name: 'content', title: 'Content Modules' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Project Name',
      type: 'string',
      group: 'details',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      group: 'details',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Web Design', value: 'web-design' },
          { title: 'Identity', value: 'identity' },
          { title: 'App Smartphone', value: 'app-smartphone' },
          { title: 'Vectorisation', value: 'vectorisation' },
        ],
      },
      group: 'details',
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'tech' } }],
      group: 'details',
    }),
    defineField({
      name: 'demoUrl',
      title: 'Demo URL',
      type: 'url',
      group: 'details',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      group: 'media',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
    defineField({
      name: 'gallery',
      title: 'Project Gallery (Quick View)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      group: 'media',
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
      title: 'title',
      media: 'mainImage',
      category: 'category',
    },
    prepare({ title, media, category }) {
      return {
        title,
        subtitle: category,
        media,
      }
    },
  },
})

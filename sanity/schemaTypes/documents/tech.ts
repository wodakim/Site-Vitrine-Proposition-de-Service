import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'tech',
  title: 'Technology Stack',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Official Website',
      type: 'url',
    }),
    defineField({
      name: 'icon',
      title: 'Icon (SVG/PNG)',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'icon',
    },
  },
})

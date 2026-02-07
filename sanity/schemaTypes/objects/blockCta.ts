import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'blockCta',
  title: 'Call to Action',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (Optional)',
      type: 'localizedString',
    }),
    defineField({
      name: 'link',
      title: 'Link URL',
      type: 'url',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https', 'mailto', 'tel'],
      }),
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'localizedString',
    }),
  ],
  preview: {
    select: {
      title: 'title.fr',
      button: 'buttonText.fr',
    },
    prepare({ title, button }) {
      return {
        title: title || button || 'Call to Action',
        subtitle: 'CTA Component',
      }
    },
  },
})

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'blockComparisonSlider',
  title: 'Before/After Slider',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    }),
    defineField({
      name: 'imageBefore',
      title: 'Image Before (Original)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
    defineField({
      name: 'labelBefore',
      title: 'Label Before',
      type: 'localizedString',
      initialValue: { fr: 'Avant', en: 'Before' },
    }),
    defineField({
      name: 'imageAfter',
      title: 'Image After (Processed)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
    defineField({
      name: 'labelAfter',
      title: 'Label After',
      type: 'localizedString',
      initialValue: { fr: 'Après', en: 'After' },
    }),
  ],
  preview: {
    select: {
      title: 'title.fr',
      media: 'imageAfter',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Before/After Slider',
        subtitle: 'Interactive Component',
        media,
      }
    },
  },
})

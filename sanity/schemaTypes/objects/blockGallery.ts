import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'blockGallery',
  title: 'Image Gallery',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'localizedString',
              title: 'Alternative Text',
            }
          ]
        }
      ],
      options: {
        layout: 'grid',
      },
    }),
    defineField({
      name: 'caption',
      title: 'Caption (Optional)',
      type: 'localizedString',
    }),
  ],
  preview: {
    select: {
      images: 'images',
      caption: 'caption.fr',
    },
    prepare({ images, caption }) {
      return {
        title: caption || `Gallery (${images?.length || 0} images)`,
        media: images?.[0],
      }
    },
  },
})

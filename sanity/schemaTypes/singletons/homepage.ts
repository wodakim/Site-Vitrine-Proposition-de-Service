import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'localizedString',
    }),
    defineField({
      name: 'featuredProjects',
      title: 'Featured Projects',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'project' } }],
    }),
  ],
  preview: {
    select: {
      title: 'heroTitle.fr',
    },
    prepare({ title }) {
      return {
        title: title || 'Home Page',
      }
    },
  },
})

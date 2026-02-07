import { defineField, defineType, defineArrayMember } from 'sanity'

const portableText = [
  defineArrayMember({
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'},
      {title: 'H2', value: 'h2'},
      {title: 'H3', value: 'h3'},
      {title: 'Quote', value: 'blockquote'},
    ],
    lists: [{title: 'Bullet', value: 'bullet'}],
    marks: {
      decorators: [
        {title: 'Strong', value: 'strong'},
        {title: 'Emphasis', value: 'em'},
        {title: 'Code', value: 'code'},
      ],
      annotations: [
        {
          title: 'URL',
          name: 'link',
          type: 'object',
          fields: [
            {
              title: 'URL',
              name: 'href',
              type: 'url',
            },
          ],
        },
      ],
    },
  }),
  defineArrayMember({
    type: 'image',
    options: {hotspot: true},
  }),
]

export default defineType({
  name: 'blockContent',
  title: 'Rich Text Block',
  type: 'object',
  fields: [
    defineField({
      name: 'fr',
      title: 'Français',
      type: 'array',
      of: portableText,
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: portableText,
    }),
  ],
  preview: {
    select: {
      fr: 'fr',
    },
    prepare({ fr }) {
      // Try to find the first text block
      const title = fr?.find((block: any) => block._type === 'block' && block.children?.[0]?.text)?.children[0].text
      return {
        title: title ? `${title.substring(0, 30)}...` : 'Rich Text',
        subtitle: 'Content Block',
      }
    },
  },
})

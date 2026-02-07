import { defineType } from 'sanity'

export default defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  fieldsets: [
    {
      name: 'translations',
      title: 'Translations',
      options: { collapsible: true, collapsed: false }
    }
  ],
  fields: [
    {
      name: 'fr',
      title: 'Français',
      type: 'string',
      validation: (Rule) => Rule.required(),
      fieldset: 'translations',
    },
    {
      name: 'en',
      title: 'English',
      type: 'string',
      fieldset: 'translations',
    },
  ],
})

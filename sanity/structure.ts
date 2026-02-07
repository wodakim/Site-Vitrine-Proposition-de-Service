import { type StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Singletons
      S.listItem()
        .title('Global Settings')
        .id('settings')
        .child(S.document().schemaType('settings').documentId('settings')),
      S.listItem()
        .title('Home Page')
        .id('homepage')
        .child(S.document().schemaType('homepage').documentId('homepage')),

      S.divider(),

      // Documents
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('service').title('Services'),
      S.documentTypeListItem('tech').title('Technologies'),
    ])

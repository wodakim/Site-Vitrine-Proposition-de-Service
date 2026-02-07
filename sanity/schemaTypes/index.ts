import { type SchemaTypeDefinition } from 'sanity'

import localizedString from './objects/localizedString'
import blockHero from './objects/blockHero'
import blockContent from './objects/blockContent'
import blockGallery from './objects/blockGallery'
import blockComparisonSlider from './objects/blockComparisonSlider'
import blockCta from './objects/blockCta'

import tech from './documents/tech'
import project from './documents/project'
import service from './documents/service'

import settings from './singletons/settings'
import homepage from './singletons/homepage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Objects
    localizedString,
    blockHero,
    blockContent,
    blockGallery,
    blockComparisonSlider,
    blockCta,

    // Documents
    tech,
    project,
    service,

    // Singletons
    settings,
    homepage,
  ],
}

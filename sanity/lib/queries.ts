import { groq } from 'next-sanity'

// Fetch the global settings (for site title, retro mode, etc.)
export const settingsQuery = groq`
  *[_type == "settings"][0] {
    siteTitle,
    siteDescription,
    ogImage,
    isRetroMode
  }
`

// Fetch the Home Page content
export const homePageQuery = groq`
  *[_type == "homepage"][0] {
    "title": heroTitle.fr,
    "subtitle": heroSubtitle.fr,
    featuredProjects[]->{
      title,
      "slug": slug.current,
      category,
      "imageUrl": mainImage.asset->url
    }
  }
`

// Fetch all Services for the grid
export const servicesQuery = groq`
  *[_type == "service"] | order(title.fr asc) {
    _id,
    "title": title.fr,
    "slug": slug.current,
    "shortDescription": shortDescription.fr,
    icon
  }
`

import { client } from "@/sanity/lib/client"
import { homePageQuery, servicesQuery, settingsQuery, projectsQuery } from "@/sanity/lib/queries"
import { Hero } from "@/components/sections/Hero"
import { Services } from "@/components/sections/Services"
import { FeaturedWork } from "@/components/sections/FeaturedWork"

export const revalidate = 60 // ISR: Revalidate every 60 seconds

export default async function Home() {
  let homeData = null;
  let servicesData = [];
  let settingsData = null;
  let projectsData = [];

  try {
    // Fetch data concurrently for performance
    [homeData, servicesData, settingsData, projectsData] = await Promise.all([
      client.fetch(homePageQuery),
      client.fetch(servicesQuery),
      client.fetch(settingsQuery),
      client.fetch(projectsQuery),
    ])
  } catch (error) {
    console.error("Sanity fetch failed:", error);
    // Fallback to empty/default data if fetch fails (e.g. invalid dataset)
  }

  // Fallback for empty data (Initial deployment state)
  const heroTitle = homeData?.title || settingsData?.siteTitle?.fr || "LogoLoom"
  const heroSubtitle = homeData?.subtitle || settingsData?.siteDescription?.fr || "Tisser votre identité numérique."

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-accent-primary selection:text-background">
      {/*
        Hero Section:
        Passes down title/subtitle from Sanity or defaults.
      */}
      <Hero
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      {/*
        Services Section:
        Displays the grid of services fetched from Sanity.
      */}
      <Services services={servicesData || []} />

      {/*
        Featured Work Section:
        Displays the selected projects in an asymmetric grid.
      */}
      <FeaturedWork projects={projectsData || []} />

      {/*
        Footer (Temporary - ideally moved to layout later)
      */}
      <footer className="py-12 border-t border-white/5 bg-surface text-center">
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
          {settingsData?.siteTitle?.fr || "LogoLoom"} &copy; {new Date().getFullYear()} — System Active
        </p>
      </footer>
    </main>
  )
}

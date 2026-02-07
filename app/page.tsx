import { client } from "@/sanity/lib/client"
import { homePageQuery, servicesQuery, settingsQuery, projectsQuery } from "@/sanity/lib/queries"
import { Hero } from "@/components/sections/Hero"
import { Services } from "@/components/sections/Services"
import { FeaturedWork } from "@/components/sections/FeaturedWork"

// ISR: Revalidate every 60 seconds
export const revalidate = 60

export default async function Home() {
  let homeData = null;
  let servicesData = [];
  let settingsData = null;
  let projectsData = [];

  // Attempt to fetch data from Sanity
  try {
    const results = await Promise.all([
      client.fetch(homePageQuery),
      client.fetch(servicesQuery),
      client.fetch(settingsQuery),
      client.fetch(projectsQuery),
    ]);

    homeData = results[0];
    servicesData = results[1];
    settingsData = results[2];
    projectsData = results[3];
  } catch (error) {
    console.error("Sanity fetch failed (likely missing credentials/dataset):", error);
    // Continue execution to render fallback UI
  }

  // Fallback content logic
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
        Footer (Simple implementation for now)
      */}
      <footer className="py-12 border-t border-white/5 bg-surface text-center mt-auto">
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
          {settingsData?.siteTitle?.fr || "LogoLoom"} &copy; {new Date().getFullYear()} — System Active
        </p>
      </footer>
    </main>
  )
}

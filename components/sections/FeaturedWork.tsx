import { ProjectCard } from "@/components/ui/ProjectCard"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { cn } from "@/lib/utils"

interface ProjectProps {
  _id: string
  title: string
  slug: string
  category?: string
  mainImage?: {
    url: string
    metadata?: {
      lqip: string
      dimensions?: {
        width: number
        height: number
      }
    }
  }
  techStack?: {
    name: string
    iconUrl?: string
  }[]
}

interface FeaturedWorkProps {
  projects: ProjectProps[]
  className?: string
}

export function FeaturedWork({ projects, className }: FeaturedWorkProps) {
  if (!projects || projects.length === 0) {
    return (
      <section className={cn("py-24 bg-background", className)}>
        <div className="container mx-auto px-4 text-center">
          <SectionTitle title="Selected Works" subtitle="Portfolio" align="center" />
          <p className="mt-8 font-mono text-xs text-gray-500 uppercase tracking-widest">
            [ARCHIVE]: No projects indexed.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={cn("py-24 md:py-32 bg-background relative z-10", className)}>
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <SectionTitle
          title="Selected Works"
          subtitle="Portfolio Showcase"
          align="left"
          className="mb-16 md:mb-24"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {projects.map((project, index) => (
            <div
              key={project._id}
              className={cn(
                // Asymmetric grid logic: Push second item down on desktop
                index % 2 === 1 ? "md:mt-24" : ""
              )}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

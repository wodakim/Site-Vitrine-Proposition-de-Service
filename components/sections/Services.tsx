import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

interface Service {
  _id: string
  title: string
  slug: string
  shortDescription?: string
  icon?: string
}

interface ServicesProps {
  services: Service[]
}

export function Services({ services }: ServicesProps) {
  if (!services || services.length === 0) {
    return (
      <section className="py-24 bg-surface/50 border-t border-b border-white/5">
        <div className="container mx-auto px-4 text-center">
          <SectionTitle title="Services" align="center" subtitle="Modules Offline" />
          <p className="font-mono text-sm text-gray-500 mt-8">
            [SYSTEM MESSAGE]: No service modules detected. Please initialize via Sanity Studio.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 md:py-32 relative bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <SectionTitle
          title="Nos Services"
          subtitle="System Modules"
          align="left"
          className="mb-16 md:mb-24"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service) => (
            <Card key={service._id} className="h-full flex flex-col justify-between group">
              <CardHeader>
                <div className="mb-4 text-accent-primary opacity-80 group-hover:opacity-100 transition-opacity">
                  {/* Render SVG string safely or use a fallback icon */}
                  {service.icon ? (
                    <div
                      className="w-10 h-10 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: service.icon }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse" />
                  )}
                </div>
                <CardTitle className="text-2xl">{service.title}</CardTitle>
                <CardDescription className="mt-2 font-mono text-xs uppercase tracking-wider text-gray-500">
                  Module: {service.slug}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-foreground/70 leading-relaxed font-sans">
                  {service.shortDescription || "Description pending initialization..."}
                </p>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  variant="link"
                  className="p-0 h-auto text-accent-primary hover:text-accent-secondary transition-colors group-hover:translate-x-1 duration-300"
                >
                  Explorer le module &rarr;
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

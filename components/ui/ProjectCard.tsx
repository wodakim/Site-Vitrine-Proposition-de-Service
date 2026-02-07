"use client"

import Image from "next/image"
import { motion } from "framer-motion"
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

interface ProjectCardProps {
  project: ProjectProps
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const { title, category, mainImage, techStack } = project

  return (
    <motion.div
      className={cn("group relative w-full overflow-hidden rounded-lg bg-surface border border-white/5", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden">
        {mainImage?.url ? (
          <Image
            src={mainImage.url}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            placeholder={mainImage.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={mainImage.metadata?.lqip}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-900">
            <span className="font-mono text-xs text-gray-600">NO SIGNAL</span>
          </div>
        )}

        {/* Overlay Gradient (Always visible but stronger on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-block h-1 w-1 rounded-full bg-accent-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-accent-primary/80">
            {category || "Project"}
          </p>
        </div>

        <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-4 group-hover:text-white transition-colors">
          {title}
        </h3>

        {/* Tech Stack Badges */}
        {techStack && techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1 backdrop-blur-sm"
              >
                {tech.iconUrl && (
                  <div className="relative h-3 w-3 overflow-hidden">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tech.iconUrl}
                      alt=""
                      className="h-full w-full object-contain opacity-70"
                    />
                  </div>
                )}
                <span className="font-mono text-[10px] uppercase text-gray-300">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

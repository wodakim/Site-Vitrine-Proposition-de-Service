'use client'

import { Button } from "@/components/ui/Button"
import { GlitchText } from "@/components/ui/GlitchText"
import { motion } from "framer-motion"

interface HeroProps {
  title?: string
  subtitle?: string
}

export function Hero({
  title = "LogoLoom",
  subtitle = "Tisser votre identité numérique."
}: HeroProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  }

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden px-4 md:px-8 bg-background">
      {/* Retro Grid Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(74, 246, 38, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(74, 246, 38, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
        }}
      />

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-4xl w-full flex flex-col items-center space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
            <GlitchText
            text={title}
            size="hero"
            as="h1"
            className="mb-4 text-5xl md:text-7xl lg:text-8xl tracking-tighter"
            />
        </motion.div>

        <motion.p
          variants={item}
          className="text-lg md:text-2xl font-sans text-foreground/80 max-w-2xl font-light leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8"
        >
          <Button size="lg" className="min-w-[160px]">
            Voir les projets
          </Button>
          <Button variant="retro" size="lg" className="min-w-[160px]">
            Start Game
          </Button>
        </motion.div>
      </motion.div>

      {/* Decorative 'Scanline' Animation Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-gradient-to-b from-transparent via-white to-transparent h-[10px] w-full animate-[scan_8s_linear_infinite]" />
    </section>
  )
}

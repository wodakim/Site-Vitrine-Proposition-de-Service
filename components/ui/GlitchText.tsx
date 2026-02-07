"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { HTMLMotionProps, motion } from "framer-motion"

const glitchTextVariants = cva(
  "relative inline-block overflow-hidden transition-colors",
  {
    variants: {
      size: {
        default: "text-base",
        lg: "text-lg md:text-xl",
        xl: "text-2xl md:text-4xl",
        hero: "text-4xl md:text-7xl",
      },
      variant: {
        default: "font-serif text-foreground",
        retro: "font-mono uppercase text-accent-primary",
        ghost: "font-sans text-gray-500",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

interface GlitchTextProps
  extends Omit<HTMLMotionProps<"span">, "size">,
    VariantProps<typeof glitchTextVariants> {
  text: string
  as?: "span" | "h1" | "h2" | "h3" | "p"
}

export function GlitchText({
  className,
  size,
  variant,
  text,
  as: Component = "span",
  ...props
}: GlitchTextProps) {
  return (
    <motion.span
      className={cn(glitchTextVariants({ size, variant }), "group", className)}
      {...props}
    >
      <span className="relative inline-block">
        {/* Main Text */}
        <span className="relative z-10">{text}</span>

        {/* Glitch Effect Layer 1 (Red/Cyan Split) */}
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 -z-10 w-full h-full text-accent-secondary opacity-0 group-hover:opacity-70 group-hover:animate-glitch translate-x-[2px]"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)", animationDuration: "2s" }}
        >
          {text}
        </span>

        {/* Glitch Effect Layer 2 (Green/Magenta Split) */}
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 -z-10 w-full h-full text-accent-primary opacity-0 group-hover:opacity-70 group-hover:animate-glitch translate-x-[-2px]"
          style={{ clipPath: "polygon(0 60%, 100% 60%, 100% 100%, 0 100%)", animationDuration: "3s", animationDirection: "reverse" }}
        >
          {text}
        </span>
      </span>
    </motion.span>
  )
}

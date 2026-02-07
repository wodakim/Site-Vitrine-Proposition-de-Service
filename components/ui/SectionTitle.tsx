"use client"

import { cn } from "@/lib/utils"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string
  subtitle?: string
  className?: string
  align?: "left" | "center" | "right"
}

export function SectionTitle({
  title,
  subtitle,
  className,
  align = "left",
  ...props
}: SectionTitleProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col mb-12",
        {
          "items-start text-left": align === "left",
          "items-center text-center": align === "center",
          "items-end text-right": align === "right",
        },
        className
      )}
      {...props}
    >
      {subtitle && (
        <motion.span
          className="text-xs font-mono uppercase tracking-widest text-accent-primary mb-2"
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {subtitle}
        </motion.span>
      )}

      <motion.h2
        className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight text-foreground"
        variants={container}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
      >
        {title.split(" ").map((word, i) => (
          <motion.span key={i} className="inline-block mr-[0.2em]" variants={item}>
            {word}
          </motion.span>
        ))}
      </motion.h2>

      <motion.div
        className="w-24 h-[1px] bg-gradient-to-r from-accent-primary to-transparent mt-6"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
    </div>
  )
}

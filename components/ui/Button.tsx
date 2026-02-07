"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { HTMLMotionProps, motion } from "framer-motion"
import { forwardRef } from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-accent-primary hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]",
        outline: "border border-input bg-transparent hover:bg-accent-primary hover:text-black hover:border-transparent",
        ghost: "hover:bg-accent-secondary/10 hover:text-accent-secondary",
        retro: "bg-surface border border-accent-primary text-accent-primary font-mono uppercase tracking-widest hover:bg-accent-primary hover:text-black hover:shadow-[0_0_10px_#4af626] active:translate-y-1 active:shadow-none",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3",
        lg: "h-12 rounded-sm px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Note: If using `asChild`, we would normally use Radix Slot, but for simplicity we stick to button unless requested.
    // Given "Zero Compromise", we might want to ensure accessibility.
    // For now, simple button with Framer Motion props.

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileTap={{ scale: 0.95 }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

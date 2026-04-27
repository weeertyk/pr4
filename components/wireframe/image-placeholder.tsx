"use client"

import { cn } from "@/lib/utils"

interface ImagePlaceholderProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function ImagePlaceholder({ className, size = "md" }: ImagePlaceholderProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-full h-32",
  }

  return (
    <div
      className={cn(
        "border-2 border-foreground bg-muted flex items-center justify-center relative",
        sizeClasses[size],
        className
      )}
    >
      <svg
        className="w-full h-full absolute inset-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}

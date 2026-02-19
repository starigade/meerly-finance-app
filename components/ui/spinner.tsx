import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
  size?: "sm" | "default" | "lg"
}

const sizeMap = {
  sm: "h-4 w-4",
  default: "h-5 w-5",
  lg: "h-8 w-8",
}

export function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", sizeMap[size], className)}
      {...props}
    />
  )
}

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded-md overflow-hidden", className)}
      style={{
        background: "linear-gradient(90deg, var(--muted) 25%, var(--border) 50%, var(--muted) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
      }}
      {...props}
    />
  )
}

export { Skeleton }

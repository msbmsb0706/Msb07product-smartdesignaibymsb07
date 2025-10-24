import { Badge } from "@/components/ui/badge"

interface VersionIndicatorProps {
  version?: string
  className?: string
}

export function VersionIndicator({ version = "6.0", className }: VersionIndicatorProps) {
  return (
    <Badge variant="secondary" className={`text-xs ${className}`}>
      v{version}
    </Badge>
  )
}

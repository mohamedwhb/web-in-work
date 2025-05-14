import { Badge } from "@/components/ui/badge"

interface CategoryBadgeProps {
  name: string
  color: string
  className?: string
}

export function CategoryBadge({ name, color, className = "" }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1.5 font-normal ${className}`}
      style={{ borderColor: color + "40" }} // Add transparency to the border
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
      {name}
    </Badge>
  )
}

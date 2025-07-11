import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./card"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon, trend, className }, ref) => {
    return (
      <Card
        ref={ref}
        variant="elevated"
        className={cn("hover:scale-105 transition-transform duration-200", className)}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center space-x-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "+" : ""}{trend.value}
                </span>
                <span className="text-xs text-muted-foreground">ពីខែមុន</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-lg text-white shadow-lg">
              {icon}
            </div>
          )}
        </div>
      </Card>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }
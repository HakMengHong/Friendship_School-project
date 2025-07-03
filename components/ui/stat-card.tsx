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
            <p className="text-3xl font-bold text-foreground">{value}</p>
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
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
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
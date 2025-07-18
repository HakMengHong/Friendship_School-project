import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"
import { Badge } from "./badge"
import { User, Calendar, MapPin } from "lucide-react"

interface StudentCardProps {
  student: {
    id: number
    firstName: string
    lastName: string
    class: string
    age?: number
    photo?: string
    status?: "active" | "inactive" | "graduated"
    address?: {
      village?: string
      district?: string
      province?: string
    }
  }
  onClick?: () => void
  className?: string
}

const StudentCard = React.forwardRef<HTMLDivElement, StudentCardProps>(
  ({ student, onClick, className }, ref) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      graduated: "bg-blue-100 text-blue-800",
    }

    const statusLabels = {
      active: "កំពុងសិក្សា",
      inactive: "បោះបង់",
      graduated: "បញ្ចប់ការសិក្សា",
    }

    return (
      <Card
        ref={ref}
        variant="elevated"
        className={cn(
          "cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg",
          className
        )}
        onClick={onClick}
      >
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={`${student.lastName} ${student.firstName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent truncate">
                    {student.lastName} {student.firstName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-muted-foreground">ថ្នាក់ {student.class}</span>
                    {student.age && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{student.age} ឆ្នាំ</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {student.address && (
                    <div className="flex items-center space-x-1 mt-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">
                        {student.address.village}, {student.address.district}
                      </span>
                    </div>
                  )}
                </div>
                
                {student.status && (
                  <Badge
                    className={cn(
                      "text-xs",
                      statusColors[student.status]
                    )}
                  >
                    {statusLabels[student.status]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
StudentCard.displayName = "StudentCard"

export { StudentCard }
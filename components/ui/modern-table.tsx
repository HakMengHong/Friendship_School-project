import * as React from "react"
import { cn } from "@/lib/utils"

const ModernTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm table-modern", className)}
      {...props}
    />
  </div>
))
ModernTable.displayName = "ModernTable"

const ModernTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("", className)} {...props} />
))
ModernTableHeader.displayName = "ModernTableHeader"

const ModernTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
ModernTableBody.displayName = "ModernTableBody"

const ModernTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium",
      className
    )}
    {...props}
  />
))
ModernTableFooter.displayName = "ModernTableFooter"

const ModernTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
ModernTableRow.displayName = "ModernTableRow"

const ModernTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-6 text-left align-middle font-semibold text-foreground bg-muted border-b border-border",
      className
    )}
    {...props}
  />
))
ModernTableHead.displayName = "ModernTableHead"

const ModernTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-6 align-middle text-foreground border-b border-border last:border-b-0", className)}
    {...props}
  />
))
ModernTableCell.displayName = "ModernTableCell"

const ModernTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
ModernTableCaption.displayName = "ModernTableCaption"

export {
  ModernTable,
  ModernTableHeader,
  ModernTableBody,
  ModernTableFooter,
  ModernTableHead,
  ModernTableRow,
  ModernTableCell,
  ModernTableCaption,
}
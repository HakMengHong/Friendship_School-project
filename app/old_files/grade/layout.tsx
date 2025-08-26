import type React from "react"
import { MainLayout } from "@/components/layout/main-layout"

export default function GradeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}

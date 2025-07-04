import { MainLayout } from "@/components/layout/main-layout"

export default function DarkModeDemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
} 
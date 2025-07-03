import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider" // update path as needed

export const metadata: Metadata = {
  title: "កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស",
  description: "School Program Management System",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="km" suppressHydrationWarning>
      <head>
        <link href="https://fonts.cdnfonts.com/css/khmer-busra" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-khmer antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

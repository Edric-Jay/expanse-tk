"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { useAuth } from "@/components/auth/auth-provider"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Handle authentication redirects
  useEffect(() => {
    if (!loading) {
      // If user is logged in and on auth page, redirect to dashboard
      if (user && pathname === "/auth") {
        router.push("/")
        return
      }

      // If user is not logged in and not on auth page, redirect to auth
      if (!user && pathname !== "/auth") {
        router.push("/auth")
        return
      }
    }
  }, [user, loading, pathname, router])

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't show sidebar on auth page
  if (pathname === "/auth") {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} className="lg:hidden" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto lg:mx-8 p-4 lg:p-6 lg:max-w-[calc(100vw-256px)] max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

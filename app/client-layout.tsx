"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { useAuth } from "@/components/auth/auth-provider"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
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

  // Don't show sidebar on auth page
  const isAuthPage = pathname === "/auth"

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar - Fixed height */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar - Fixed height */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} className="lg:hidden" />

      {/* Main Content Area - Fixed height */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* Mobile Header - Fixed height */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className=" mx-auto lg:mx-8 p-4 lg:p-6 lg:max-w-[calc(100vw-256px)] max-w-7xl ">{children}</div>
        </main>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    </div>
  )
}

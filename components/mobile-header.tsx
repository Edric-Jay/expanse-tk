"use client"

import { ArrowLeft, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard"
      case "/transactions":
        return "Transactions"
      case "/transactions/new":
        return "New Transaction"
      case "/categories":
        return "Categories"
      case "/wallets":
        return "Wallets"
      case "/goals":
        return "Goals"
      case "/analytics":
        return "Analytics"
      case "/ai-insights":
        return "AI Insights"
      case "/settings":
        return "Settings"
      default:
        return "Expense Tracker"
    }
  }

  const canGoBack = () => {
    return pathname === "/transactions/new"
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm lg:hidden">
      <div className="flex items-center gap-3">
        {canGoBack() ? (
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
      </div>
    </header>
  )
}

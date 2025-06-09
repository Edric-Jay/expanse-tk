"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Settings,
  Sparkles,
  Tag,
  Wallet,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Goals", href: "/goals", icon: PiggyBank },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Insights", href: "/ai-insights", icon: Sparkles },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface AppSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

export function AppSidebar({ isOpen = true, onClose, className }: AppSidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleLinkClick = () => {
    // Close mobile sidebar when navigating
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none",
          !isOpen && "-translate-x-full lg:translate-x-0",
          className,
        )}
      >
        {/* Header - Fixed height */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold" onClick={handleLinkClick}>
            <Home className="h-5 w-5 text-blue-600" />
            <span>Expense Tracker</span>
          </Link>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation - Scrollable area */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section - Fixed at bottom */}
        <div className="shrink-0 border-t bg-gray-50 p-4">
          <div className="mb-3 text-xs text-gray-500 truncate">Signed in as: {user?.email}</div>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}

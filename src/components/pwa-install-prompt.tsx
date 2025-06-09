"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    setIsStandalone(standalone)

    // Check if already dismissed
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    const dismissedTime = localStorage.getItem("pwa-install-dismissed-time")

    // Show again after 7 days
    if (dismissed && dismissedTime) {
      const daysSinceDismissed = (Date.now() - Number.parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        return
      }
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      console.log("beforeinstallprompt event fired")
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after a short delay
      setTimeout(() => {
        if (!standalone) {
          setShowPrompt(true)
        }
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // For iOS, show manual install instructions
    if (iOS && !standalone && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      console.log(`User response to the install prompt: ${outcome}`)

      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error("Error during install prompt:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
    localStorage.setItem("pwa-install-dismissed-time", Date.now().toString())
  }

  // Don't show if already installed or if conditions aren't met
  if (!showPrompt || isStandalone) return null

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-96 shadow-lg border-2 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {isIOS ? <Smartphone className="h-6 w-6 text-blue-600" /> : <Download className="h-6 w-6 text-blue-600" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-900">
              {isIOS ? "Add to Home Screen" : "Install Expense Tracker"}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {isIOS
                ? "Tap the share button and select 'Add to Home Screen' for the best experience."
                : "Install our app for offline access, push notifications, and a native app experience."}
            </p>
            <div className="flex gap-2 mt-3">
              {!isIOS && deferredPrompt && (
                <Button size="sm" onClick={handleInstall} className="bg-blue-600 hover:bg-blue-700">
                  Install App
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleDismiss}>
                {isIOS ? "Maybe Later" : "Not Now"}
              </Button>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={handleDismiss} className="h-6 w-6 flex-shrink-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

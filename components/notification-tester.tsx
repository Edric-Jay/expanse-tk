"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, TestTube, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function NotificationTester() {
  const [permission, setPermission] = useState(Notification.permission)
  const [testResults, setTestResults] = useState<string[]>([])
  const { toast } = useToast()

  const addTestResult = (result: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      addTestResult(`Permission ${result}`)

      if (result === "granted") {
        toast({
          title: "Notifications Enabled! 🔔",
          description: "You'll now receive expense tracking reminders",
        })
      } else {
        toast({
          title: "Notifications Disabled",
          description: "Enable notifications in your browser settings to get reminders",
          variant: "destructive",
        })
      }
    } catch (error) {
      addTestResult(`Permission error: ${error}`)
    }
  }

  const testBasicNotification = () => {
    if (permission !== "granted") {
      toast({
        title: "Permission Required",
        description: "Please enable notifications first",
        variant: "destructive",
      })
      return
    }

    try {
      new Notification("Expense Tracker Test", {
        body: "This is a test notification! 🧪",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "test-notification",
      })
      addTestResult("Basic notification sent")
      toast({
        title: "Test Notification Sent! 📱",
        description: "Check if you received the notification",
      })
    } catch (error) {
      addTestResult(`Basic notification error: ${error}`)
    }
  }

  const testExpenseReminder = () => {
    if (permission !== "granted") {
      toast({
        title: "Permission Required",
        description: "Please enable notifications first",
        variant: "destructive",
      })
      return
    }

    const reminders = [
      "Don't forget to track your morning coffee! ☕",
      "Lunch expenses - remember to log them! 🍽️",
      "Evening check-in: How did your spending go? 📊",
    ]

    const randomReminder = reminders[Math.floor(Math.random() * reminders.length)]

    try {
      new Notification("Expense Reminder", {
        body: randomReminder,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "expense-reminder",
        requireInteraction: true,
      })
      addTestResult("Expense reminder sent")
      toast({
        title: "Expense Reminder Sent! 💰",
        description: "Check your notification",
      })
    } catch (error) {
      addTestResult(`Expense reminder error: ${error}`)
    }
  }

  const testDelayedNotification = () => {
    if (permission !== "granted") {
      toast({
        title: "Permission Required",
        description: "Please enable notifications first",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Delayed Notification Scheduled ⏰",
      description: "You'll receive a notification in 5 seconds",
    })

    setTimeout(() => {
      new Notification("Delayed Test", {
        body: "This notification was delayed by 5 seconds! ⏰",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "delayed-test",
      })
      addTestResult("Delayed notification sent (5s)")
    }, 5000)
  }

  const testServiceWorkerNotification = () => {
    if ("serviceWorker" in navigator && "Notification" in window) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification("Service Worker Test", {
            body: "This notification came from the service worker! 🔧",
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            tag: "sw-test",
            actions: [
              { action: "view", title: "View App" },
              { action: "dismiss", title: "Dismiss" },
            ],
          })
          addTestResult("Service worker notification sent")
          toast({
            title: "Service Worker Notification! 🔧",
            description: "Advanced notification with actions sent",
          })
        })
        .catch((error) => {
          addTestResult(`Service worker error: ${error}`)
        })
    } else {
      addTestResult("Service worker not supported")
      toast({
        title: "Service Worker Not Available",
        description: "Your browser doesn't support service worker notifications",
        variant: "destructive",
      })
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Granted
          </Badge>
        )
      case "denied":
        return (
          <Badge variant="destructive">
            <BellOff className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Bell className="w-3 h-3 mr-1" />
            Default
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Notification Tester
          </CardTitle>
          <CardDescription>Test notification functionality for the expense tracker app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Permission Status:</span>
            {getPermissionBadge()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={requestPermission} variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Request Permission
            </Button>

            <Button onClick={testBasicNotification} disabled={permission !== "granted"}>
              <TestTube className="w-4 h-4 mr-2" />
              Test Basic
            </Button>

            <Button onClick={testExpenseReminder} disabled={permission !== "granted"}>
              💰 Test Expense Reminder
            </Button>

            <Button onClick={testDelayedNotification} disabled={permission !== "granted"}>
              <Clock className="w-4 h-4 mr-2" />
              Test Delayed (5s)
            </Button>

            <Button onClick={testServiceWorkerNotification} disabled={permission !== "granted"}>
              🔧 Test Service Worker
            </Button>

            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

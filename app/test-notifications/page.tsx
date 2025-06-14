"use client"

import { NotificationTester } from "@/components/notification-tester"

export default function TestNotificationsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Notification Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test and debug notification functionality for the expense tracker app
          </p>
        </div>

        <NotificationTester />
      </div>
    </div>
  )
}

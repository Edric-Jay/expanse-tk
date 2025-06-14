"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useNotifications() {
  const { toast } = useToast()

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }

  const scheduleNotifications = () => {
    const notificationTimes = ["06:00", "12:00", "20:00"]
    const messages = [
      "Good morning! Don't forget to track your expenses today 💰",
      "Lunch time! Remember to log any purchases you've made 🍽️",
      "Evening check-in! How did your spending go today? 📊",
    ]

    notificationTimes.forEach((time, index) => {
      const [hours, minutes] = time.split(":").map(Number)
      const now = new Date()
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }

      const timeUntilNotification = scheduledTime.getTime() - now.getTime()

      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("Expense Tracker Reminder", {
            body: messages[index],
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            tag: `expense-reminder-${index}`,
          })
        }

        // Schedule the next day's notification
        setInterval(
          () => {
            if (Notification.permission === "granted") {
              new Notification("Expense Tracker Reminder", {
                body: messages[index],
                icon: "/icon-192x192.png",
                badge: "/icon-192x192.png",
                tag: `expense-reminder-${index}`,
              })
            }
          },
          24 * 60 * 60 * 1000,
        ) // 24 hours
      }, timeUntilNotification)
    })
  }

  useEffect(() => {
    // Request permission on component mount
    requestNotificationPermission().then((granted) => {
      if (granted) {
        scheduleNotifications()
      }
    })
  }, [])

  return {
    requestNotificationPermission,
    scheduleNotifications,
  }
}

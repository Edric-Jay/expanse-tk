"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState<Theme>("system")
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (user) {
      fetchTheme()
    } else {
      // Load theme from localStorage for non-authenticated users
      const savedTheme = localStorage.getItem("theme") as Theme
      if (savedTheme) {
        setThemeState(savedTheme)
      }
    }
  }, [user])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    let effectiveTheme: "light" | "dark"

    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    } else {
      effectiveTheme = theme
    }

    root.classList.add(effectiveTheme)
    setActualTheme(effectiveTheme)

    // Save to localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  const fetchTheme = async () => {
    try {
      const { data, error } = await supabase.from("user_settings").select("theme").eq("user_id", user?.id).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data?.theme) {
        setThemeState(data.theme as Theme)
      }
    } catch (error) {
      console.error("Error fetching theme:", error)
    }
  }

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme)

      if (user) {
        await supabase.from("user_settings").upsert({
          user_id: user.id,
          theme: newTheme,
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error updating theme:", error)
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

interface CurrencyContextType {
  currency: string
  setCurrency: (currency: string) => void
  formatCurrency: (amount: number) => string
  getCurrencySymbol: () => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const currencyConfig = {
  PHP: { symbol: "₱", locale: "en-PH" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "en-EU" },
  GBP: { symbol: "£", locale: "en-GB" },
  JPY: { symbol: "¥", locale: "ja-JP" },
  SGD: { symbol: "S$", locale: "en-SG" },
}

type CurrencyCode = keyof typeof currencyConfig

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currency, setCurrencyState] = useState<CurrencyCode>("PHP")
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (user) {
      fetchCurrency()
    } else {
      const savedCurrency = localStorage.getItem("currency") as CurrencyCode
      if (savedCurrency && savedCurrency in currencyConfig) {
        setCurrencyState(savedCurrency)
      }
    }
  }, [user])

  const fetchCurrency = async () => {
    try {
      const { data, error } = await supabase.from("user_settings").select("currency").eq("user_id", user?.id).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data?.currency && data.currency in currencyConfig) {
        setCurrencyState(data.currency as CurrencyCode)
      }
    } catch (error) {
      console.error("Error fetching currency:", error)
    }
  }

  const setCurrency = async (newCurrency: string) => {
    try {
      const currencyCode = newCurrency as CurrencyCode
      if (!(currencyCode in currencyConfig)) {
        console.error("Invalid currency code:", newCurrency)
        return
      }

      setCurrencyState(currencyCode)
      localStorage.setItem("currency", currencyCode)

      if (user) {
        await supabase.from("user_settings").upsert({
          user_id: user.id,
          currency: currencyCode,
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error updating currency:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    const config = currencyConfig[currency]
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getCurrencySymbol = () => {
    return currencyConfig[currency].symbol
  }

  const contextValue = {
    currency,
    setCurrency,
    formatCurrency,
    getCurrencySymbol,
  }

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}

"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase, type Budget, type Transaction } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"

export interface BudgetWithSpending extends Budget {
  spent: number
  remaining: number
  percentage: number
  status: "on-track" | "at-risk" | "exceeded"
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Calculate spending for each budget
  const calculateBudgetSpending = (budgets: Budget[], transactions: Transaction[]): BudgetWithSpending[] => {
    return budgets.map((budget) => {
      const startDate = new Date(budget.start_date)
      const endDate = new Date(budget.end_date)

      // Filter transactions for this budget's category and date range
      const relevantTransactions = transactions.filter(
        (transaction) =>
          transaction.category_id === budget.category_id &&
          transaction.type === "expense" &&
          new Date(transaction.date) >= startDate &&
          new Date(transaction.date) <= endDate,
      )

      // Calculate total spent - ensure we're using positive values for expenses
      const spent = relevantTransactions.reduce((total, transaction) => total + Math.abs(transaction.amount), 0)

      // Calculate remaining amount - SUBTRACT spent from limit (not add)
      const remaining = budget.limit_amount - spent

      // Calculate percentage of budget used
      const percentage = (spent / budget.limit_amount) * 100

      // Determine budget status
      let status: "on-track" | "at-risk" | "exceeded" = "on-track"
      if (percentage >= 100) {
        status = "exceeded"
      } else if (percentage >= 80) {
        status = "at-risk"
      }

      return {
        ...budget,
        spent,
        remaining,
        percentage,
        status,
      }
    })
  }

  // Fetch budgets from Supabase
  const fetchBudgets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!supabase || !user) {
        setError("Supabase client or user not available")
        return
      }

      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (budgetsError) {
        throw new Error(budgetsError.message)
      }

      // Fetch transactions for spending calculation
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "expense")

      if (transactionsError) {
        throw new Error(transactionsError.message)
      }

      const budgetsWithSpending = calculateBudgetSpending(budgetsData, transactionsData || [])
      setBudgets(budgetsWithSpending)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch budgets")
      toast({
        title: "Error",
        description: "Failed to load budgets. Please try again.",
        variant: "destructive",
      })
      setBudgets([])
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new budget
  const createBudget = async (budgetData: Omit<Budget, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      if (!supabase || !user) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in.",
          variant: "destructive",
        })
        return false
      }

      const newBudget = {
        ...budgetData,
        user_id: user.id,
      }

      const { error } = await supabase.from("budgets").insert(newBudget)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Success",
        description: "Budget created successfully",
      })

      // Refresh budgets
      fetchBudgets()
      return true
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create budget",
        variant: "destructive",
      })
      return false
    }
  }

  // Update an existing budget
  const updateBudget = async (id: string, budgetData: Partial<Budget>) => {
    try {
      if (!supabase || !user) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in.",
          variant: "destructive",
        })
        return false
      }

      const { error } = await supabase
        .from("budgets")
        .update({ ...budgetData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Success",
        description: "Budget updated successfully",
      })

      // Refresh budgets
      fetchBudgets()
      return true
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update budget",
        variant: "destructive",
      })
      return false
    }
  }

  // Delete a budget
  const deleteBudget = async (id: string) => {
    try {
      if (!supabase || !user) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in.",
          variant: "destructive",
        })
        return false
      }

      const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Success",
        description: "Budget deleted successfully",
      })

      // Refresh budgets
      fetchBudgets()
      return true
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete budget",
        variant: "destructive",
      })
      return false
    }
  }

  // Calculate end date based on period and start date
  const calculateEndDate = (startDate: Date, period: string, customEndDate?: Date): Date => {
    const start = new Date(startDate)

    switch (period) {
      case "weekly":
        // End date is 6 days after start date (7 days total)
        return new Date(new Date(start).setDate(start.getDate() + 6))
      case "monthly":
        // End date is last day of the month
        return new Date(start.getFullYear(), start.getMonth() + 1, 0)
      case "quarterly":
        // End date is 3 months after start date
        return new Date(new Date(start).setMonth(start.getMonth() + 3, 0))
      case "yearly":
        // End date is 1 year after start date
        return new Date(new Date(start).setFullYear(start.getFullYear() + 1, start.getMonth(), start.getDate() - 1))
      case "custom":
        // Use the provided custom end date
        return customEndDate || new Date(new Date(start).setMonth(start.getMonth() + 1, 0))
      default:
        return new Date(new Date(start).setMonth(start.getMonth() + 1, 0))
    }
  }

  // Load budgets on component mount
  useEffect(() => {
    fetchBudgets()
  }, [user])

  return {
    budgets,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    calculateEndDate,
    refreshBudgets: fetchBudgets,
  }
}

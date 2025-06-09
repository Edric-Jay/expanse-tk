"use client"

import { useState, useEffect } from "react"
import { supabase, type Transaction } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

export function useTransactions() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          wallets(name),
          categories(name, color)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (
    transactionData: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">,
  ) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...transactionData, user_id: user?.id }])
        .select(`
          *,
          wallets(name),
          categories(name, color)
        `)
        .single()

      if (error) throw error

      // Update wallet balance
      const { error: walletError } = await supabase.rpc("update_wallet_balance", {
        wallet_id: transactionData.wallet_id,
        amount_change: transactionData.amount,
      })

      if (walletError) throw walletError

      setTransactions((prev) => [data, ...prev])
      toast({
        title: "Success",
        description: "Transaction created successfully",
      })
      return data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select(`
          *,
          wallets(name),
          categories(name, color)
        `)
        .single()

      if (error) throw error

      setTransactions((prev) => prev.map((transaction) => (transaction.id === id ? data : transaction)))
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      })
      return data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      // Get transaction details first
      const transaction = transactions.find((t) => t.id === id)
      if (!transaction) throw new Error("Transaction not found")

      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user?.id)

      if (error) throw error

      // Reverse wallet balance change
      const { error: walletError } = await supabase.rpc("update_wallet_balance", {
        wallet_id: transaction.wallet_id,
        amount_change: -transaction.amount,
      })

      if (walletError) throw walletError

      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  }
}

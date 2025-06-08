"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

export function useWallets() {
  const [wallets, setWallets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchWallets()
    }
  }, [user])

  const fetchWallets = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setWallets(data || [])
    } catch (error: any) {
      console.error("Error fetching wallets:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createWallet = async (walletData: any) => {
    try {
      const { data, error } = await supabase.from("wallets").insert([
        {
          user_id: user?.id,
          name: walletData.name,
          type: walletData.type,
          balance: walletData.balance,
          color: walletData.color,
          icon: walletData.icon,
        },
      ])

      if (error) throw error

      await fetchWallets()
      return data
    } catch (error: any) {
      console.error("Error creating wallet:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateWallet = async (id: string, walletData: any) => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .update({
          name: walletData.name,
          type: walletData.type,
          balance: walletData.balance,
          color: walletData.color,
          icon: walletData.icon,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user?.id)

      if (error) throw error

      await fetchWallets()
      return data
    } catch (error: any) {
      console.error("Error updating wallet:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteWallet = async (id: string) => {
    try {
      const { error } = await supabase.from("wallets").delete().eq("id", id).eq("user_id", user?.id)

      if (error) throw error

      setWallets((prev) => prev.filter((wallet) => wallet.id !== id))
      toast({
        title: "Success",
        description: "Wallet deleted successfully!",
      })
    } catch (error: any) {
      console.error("Error deleting wallet:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const transferFunds = async (fromWalletId: string, toWalletId: string, amount: number) => {
    try {
      // Get the source and destination wallets
      const sourceWallet = wallets.find((w) => w.id === fromWalletId)
      const destWallet = wallets.find((w) => w.id === toWalletId)

      if (!sourceWallet || !destWallet) {
        throw new Error("Invalid wallet selection")
      }

      if (sourceWallet.balance < amount) {
        throw new Error("Insufficient funds in the source wallet")
      }

      // Start a transaction
      const { error: transactionError } = await supabase.rpc("transfer_funds", {
        p_from_wallet_id: fromWalletId,
        p_to_wallet_id: toWalletId,
        p_amount: amount,
        p_user_id: user?.id,
      })

      if (transactionError) throw transactionError

      // Refresh wallets
      await fetchWallets()

      return true
    } catch (error: any) {
      console.error("Error transferring funds:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  return { wallets, loading, createWallet, updateWallet, deleteWallet, transferFunds }
}

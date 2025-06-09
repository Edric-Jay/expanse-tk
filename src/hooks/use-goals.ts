"use client"

import { useState, useEffect } from "react"
import { supabase, type Goal } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

export function useGoals() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch goals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async (goalData: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .insert([{ ...goalData, user_id: user?.id }])
        .select()
        .single()

      if (error) throw error

      setGoals((prev) => [data, ...prev])
      toast({
        title: "Success",
        description: "Goal created successfully",
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

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single()

      if (error) throw error

      setGoals((prev) => prev.map((goal) => (goal.id === id ? data : goal)))
      toast({
        title: "Success",
        description: "Goal updated successfully",
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

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", user?.id)

      if (error) throw error

      setGoals((prev) => prev.filter((goal) => goal.id !== id))
      toast({
        title: "Success",
        description: "Goal deleted successfully",
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
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals,
  }
}

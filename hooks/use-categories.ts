"use client"

import { useState, useEffect } from "react"
import { supabase, type Category } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

export function useCategories() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      if (!supabase || !user) {
        setLoading(false)
        setCategories([])
        return
      }

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (categoryData: Omit<Category, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      if (!supabase || !user) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in.",
          variant: "destructive",
        })
        throw new Error("Authentication required")
      }

      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...categoryData, user_id: user?.id }])
        .select()
        .single()

      if (error) throw error

      setCategories((prev) => [...prev, data])
      toast({
        title: "Success",
        description: "Category created successfully",
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

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      if (!supabase || !user) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in.",
          variant: "destructive",
        })
        throw new Error("Authentication required")
      }

      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single()

      if (error) throw error

      setCategories((prev) => prev.map((category) => (category.id === id ? data : category)))
      toast({
        title: "Success",
        description: "Category updated successfully",
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

  const deleteCategory = async (id: string) => {
    try {
      if (!supabase || !user) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in.",
          variant: "destructive",
        })
        throw new Error("Authentication required")
      }

      const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user?.id)

      if (error) throw error

      setCategories((prev) => prev.filter((category) => category.id !== id))
      toast({
        title: "Success",
        description: "Category deleted successfully",
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
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}

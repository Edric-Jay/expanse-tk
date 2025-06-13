import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if the environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your environment variables.")
}

export const supabase =
  typeof window !== "undefined"
    ? createClient(supabaseUrl || "", supabaseAnonKey || "", {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  name: string
  type: "cash" | "bank" | "digital" | "savings"
  balance: number
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: "income" | "expense"
  color: string
  icon: string
  budget_limit?: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  wallet_id: string
  category_id: string
  description: string
  amount: number
  type: "income" | "expense"
  date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date: string
  category: string
  priority: "low" | "medium" | "high"
  status: "active" | "completed" | "paused"
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  name: string
  limit_amount: number
  period: "weekly" | "custom" | "monthly" | "quarterly" | "yearly" | string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  PiggyBank,
} from "lucide-react"
import Link from "next/link"
import { useWallets } from "@/hooks/use-wallets"
import { useTransactions } from "@/hooks/use-transactions"
import { useGoals } from "@/hooks/use-goals"
import { useAuth } from "@/components/auth/auth-provider"

export default function Dashboard() {
  const { user } = useAuth()
  const { wallets, loading: walletsLoading } = useWallets()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { goals, loading: goalsLoading } = useGoals()
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([])

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)

  // Calculate monthly income and expenses from transactions
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
  })

  const monthlyIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = Math.abs(
    monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
  )

  const monthlySavings = monthlyIncome - monthlyExpenses

  // Get recent transactions (last 4)
  const recentTransactions = transactions.slice(0, 4)

  // Calculate expenses by category - FIX: Added proper dependency array
  useEffect(() => {
    if (!transactionsLoading && monthlyTransactions.length > 0) {
      const categoryMap: Record<string, { name: string; value: number; color: string }> = {}

      monthlyTransactions
        .filter((t) => t.type === "expense")
        .forEach((transaction: any) => {
          const categoryName = transaction.categories?.name || "Others"
          const categoryColor = transaction.categories?.color || "#64748b"

          if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = { name: categoryName, value: 0, color: categoryColor }
          }
          categoryMap[categoryName].value += Math.abs(transaction.amount)
        })

      setExpensesByCategory(Object.values(categoryMap))
    } else {
      setExpensesByCategory([])
    }
  }, [transactionsLoading, transactions.length]) // Only depend on these stable values

  if (walletsLoading || transactionsLoading || goalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/transactions/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Link>
            </Button>
          </div>
        </div>

        {/* Rest of the component remains the same */}
        {/* ... */}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {wallets.length} wallets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{monthlyIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₱{monthlyExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₱{monthlySavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses by Category</CardTitle>
                <CardDescription>Your spending breakdown for this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <p>No expense data for this month</p>
                        <Button asChild className="mt-4">
                          <Link href="/transactions/new">Add your first transaction</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/transactions">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}
                          >
                            {transaction.type === "income" ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {transaction.categories?.name || "Uncategorized"} •{" "}
                              {transaction.wallets?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "income" ? "+" : ""}₱{Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No transactions yet</p>
                      <Button asChild className="mt-4">
                        <Link href="/transactions/new">Add your first transaction</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Wallets */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Wallets & Accounts</CardTitle>
                  <CardDescription>Your money sources</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/wallets">Manage</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wallets.length > 0 ? (
                    wallets.map((wallet) => (
                      <div key={wallet.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full" style={{ backgroundColor: `${wallet.color}20` }}>
                            {wallet.type === "cash" && <Banknote className="w-4 h-4" style={{ color: wallet.color }} />}
                            {wallet.type === "bank" && (
                              <CreditCard className="w-4 h-4" style={{ color: wallet.color }} />
                            )}
                            {wallet.type === "digital" && (
                              <Wallet className="w-4 h-4" style={{ color: wallet.color }} />
                            )}
                            {wallet.type === "savings" && (
                              <PiggyBank className="w-4 h-4" style={{ color: wallet.color }} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{wallet.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{wallet.type}</p>
                          </div>
                        </div>
                        <p className="font-semibold">₱{wallet.balance.toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No wallets yet</p>
                      <Button asChild className="mt-2" size="sm">
                        <Link href="/wallets">Add wallet</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Financial Goals</CardTitle>
                  <CardDescription>Track your progress</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/goals">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.length > 0 ? (
                    goals.slice(0, 3).map((goal) => {
                      const progress = (goal.current_amount / goal.target_amount) * 100
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{goal.name}</p>
                            <Badge variant="outline">{progress.toFixed(0)}%</Badge>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>₱{goal.current_amount.toLocaleString()}</span>
                            <span>₱{goal.target_amount.toLocaleString()}</span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No goals yet</p>
                      <Button asChild className="mt-2" size="sm">
                        <Link href="/goals">Create goal</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Getting Started
                </CardTitle>
                <CardDescription>Complete your financial setup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">💡 Add Transactions</p>
                    <p className="text-sm text-blue-700">Start tracking by adding your income and expenses.</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900">🎯 Set Goals</p>
                    <p className="text-sm text-green-700">Create financial goals to track your progress.</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-900">💰 Add Wallets</p>
                    <p className="text-sm text-yellow-700">Set up your bank accounts and wallets.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

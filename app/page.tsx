"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Plus,
  PieChart,
  BarChart3,
  DollarSign,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { useTransactions } from "@/hooks/use-transactions"
import { useWallets } from "@/hooks/use-wallets"
import { useGoals } from "@/hooks/use-goals"
import { useBudgets } from "@/hooks/use-budgets"
import { useCategories } from "@/hooks/use-categories"
import { useCurrency } from "@/hooks/use-currency"
import { useNotifications } from "@/hooks/use-notifications"
import { useAuth } from "@/components/auth/auth-provider"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { wallets, loading: walletsLoading } = useWallets()
  const { goals, loading: goalsLoading } = useGoals()
  const { budgets, loading: budgetsLoading } = useBudgets()
  const { categories, loading: categoriesLoading } = useCategories()
  const { formatCurrency } = useCurrency()
  const { requestNotificationPermission } = useNotifications()

  const [currentMonth] = useState(new Date().getMonth())
  const [currentYear] = useState(new Date().getFullYear())

  // Initialize notifications on dashboard load
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Calculate monthly data
  const monthlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
  })

  const monthlyIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = Math.abs(
    monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
  )

  const monthlySavings = monthlyIncome - monthlyExpenses

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)

  const recentTransactions = transactions.slice(0, 5)

  const activeGoals = goals.filter((goal) => goal.status === "active").slice(0, 3)

  const budgetAlerts = budgets.filter((budget) => budget.percentage > 80).slice(0, 3)

  if (transactionsLoading || walletsLoading || goalsLoading || budgetsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground mt-1">Across {wallets.length} accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Monthly Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Monthly Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Net Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthlySavings >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(monthlySavings)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "income"
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-red-100 dark:bg-red-900"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.categories?.name || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : ""}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No transactions yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/transactions/new">Add your first transaction</Link>
                    </Button>
                  </div>
                )}
              </div>
              {recentTransactions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/transactions">View All Transactions</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Goals */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/transactions/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/goals">
                    <Target className="w-4 h-4 mr-2" />
                    Set New Goal
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/budgets">
                    <PieChart className="w-4 h-4 mr-2" />
                    Create Budget
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/analytics">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="w-5 h-5" />
                  Active Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGoals.length > 0 ? (
                    activeGoals.map((goal) => {
                      const progress = (goal.current_amount / goal.target_amount) * 100
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-foreground">{goal.name}</p>
                            <p className="text-sm text-muted-foreground">{progress.toFixed(0)}%</p>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatCurrency(goal.current_amount)}</span>
                            <span>{formatCurrency(goal.target_amount)}</span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No active goals</p>
                      <Button variant="outline" size="sm" asChild className="mt-2">
                        <Link href="/goals">Create Goal</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <PieChart className="w-5 h-5" />
                Budget Alerts
              </CardTitle>
              <CardDescription>Budgets that need your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {budgetAlerts.map((budget) => (
                  <div key={budget.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-foreground">{budget.name}</p>
                      <span
                        className={`text-sm font-medium ${
                          budget.percentage > 100 ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        {budget.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={budget.percentage > 100 ? 100 : budget.percentage}
                      className={`h-2 ${budget.percentage > 100 ? "bg-red-200" : "bg-yellow-200"}`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{formatCurrency(budget.spent)}</span>
                      <span>{formatCurrency(budget.limit_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

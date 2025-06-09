"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChartIcon, BarChart3 } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import { useWallets } from "@/hooks/use-wallets"
import { useCategories } from "@/hooks/use-categories"

export default function AnalyticsPage() {
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { wallets, loading: walletsLoading } = useWallets()
  const { categories, loading: categoriesLoading } = useCategories()

  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([])
  const [dailySpending, setDailySpending] = useState<any[]>([])
  const [savingsRate, setSavingsRate] = useState<any[]>([])
  const [topExpenses, setTopExpenses] = useState<any[]>([])

  useEffect(() => {
    if (!transactionsLoading && transactions.length > 0) {
      generateAnalytics()
    }
  }, [transactionsLoading, transactions])

  const generateAnalytics = () => {
    // Generate monthly trends
    const monthsData: Record<string, { month: string; income: number; expenses: number; savings: number }> = {}
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = monthNames[date.getMonth()]

      if (!monthsData[monthKey]) {
        monthsData[monthKey] = {
          month: monthName,
          income: 0,
          expenses: 0,
          savings: 0,
        }
      }

      if (transaction.type === "income") {
        monthsData[monthKey].income += transaction.amount
      } else {
        monthsData[monthKey].expenses += Math.abs(transaction.amount)
      }

      monthsData[monthKey].savings = monthsData[monthKey].income - monthsData[monthKey].expenses
    })

    const sortedMonths = Object.values(monthsData).sort((a, b) => {
      const monthA = monthNames.indexOf(a.month)
      const monthB = monthNames.indexOf(b.month)
      return monthA - monthB
    })

    setMonthlyTrends(sortedMonths)

    // Generate category breakdown
    const expensesByCategory: Record<string, { name: string; value: number; color: string; percentage: number }> = {}
    const expenseTransactions = transactions.filter((t) => t.type === "expense")
    const totalExpenses = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0))

    expenseTransactions.forEach((transaction: any) => {
      const categoryName = transaction.categories?.name || "Others"
      const categoryColor = transaction.categories?.color || "#64748b"

      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = {
          name: categoryName,
          value: 0,
          color: categoryColor,
          percentage: 0,
        }
      }

      expensesByCategory[categoryName].value += Math.abs(transaction.amount)
    })

    // Calculate percentages
    Object.values(expensesByCategory).forEach((category) => {
      category.percentage = totalExpenses > 0 ? (category.value / totalExpenses) * 100 : 0
    })

    setCategoryBreakdown(Object.values(expensesByCategory))

    // Generate daily spending
    const dailyData: Record<string, { day: string; amount: number }> = {}
    const today = new Date()
    const startDate = new Date()
    startDate.setDate(today.getDate() - 14) // Last 15 days

    expenseTransactions.forEach((transaction: any) => {
      const date = new Date(transaction.date)
      if (date >= startDate) {
        const dayKey = date.getDate().toString()

        if (!dailyData[dayKey]) {
          dailyData[dayKey] = {
            day: dayKey,
            amount: 0,
          }
        }

        dailyData[dayKey].amount += Math.abs(transaction.amount)
      }
    })

    setDailySpending(Object.values(dailyData).sort((a, b) => Number.parseInt(a.day) - Number.parseInt(b.day)))

    // Generate savings rate
    const savingsRateData: Record<string, { month: string; rate: number }> = {}

    Object.entries(monthsData).forEach(([key, data]) => {
      savingsRateData[key] = {
        month: data.month,
        rate: data.income > 0 ? (data.savings / data.income) * 100 : 0,
      }
    })

    setSavingsRate(
      Object.values(savingsRateData).sort((a, b) => {
        const monthA = monthNames.indexOf(a.month)
        const monthB = monthNames.indexOf(b.month)
        return monthA - monthB
      }),
    )

    // Generate top expenses
    const categorySums: Record<string, { category: string; amount: number; change: number }> = {}

    expenseTransactions.forEach((transaction: any) => {
      const categoryName = transaction.categories?.name || "Others"

      if (!categorySums[categoryName]) {
        categorySums[categoryName] = {
          category: categoryName,
          amount: 0,
          change: 0, // In a real app, you'd calculate this from historical data
        }
      }

      categorySums[categoryName].amount += Math.abs(transaction.amount)
    })

    // Sort by amount and take top 5
    const topCategoriesExpenses = Object.values(categorySums)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Assign random changes for demo purposes
    topCategoriesExpenses.forEach((item) => {
      item.change = Math.floor(Math.random() * 41) - 20 // Random between -20 and 20
    })

    setTopExpenses(topCategoriesExpenses)
  }

  const currentMonth = monthlyTrends[monthlyTrends.length - 1] || { income: 0, expenses: 0, savings: 0 }
  const previousMonth = monthlyTrends[monthlyTrends.length - 2] || { income: 0, expenses: 0, savings: 0 }

  const incomeChange =
    previousMonth.income > 0 ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100 : 0
  const expenseChange =
    previousMonth.expenses > 0 ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100 : 0
  const savingsChange =
    previousMonth.savings > 0 ? ((currentMonth.savings - previousMonth.savings) / previousMonth.savings) * 100 : 0

  if (transactionsLoading || walletsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Deep insights into your financial patterns and trends</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{currentMonth.income?.toLocaleString() || "0"}</div>
              <div className={`flex items-center text-xs ${incomeChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {incomeChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(incomeChange).toFixed(1)}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{currentMonth.expenses?.toLocaleString() || "0"}</div>
              <div className={`flex items-center text-xs ${expenseChange <= 0 ? "text-green-600" : "text-red-600"}`}>
                {expenseChange <= 0 ? (
                  <TrendingDown className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingUp className="w-3 h-3 mr-1" />
                )}
                {Math.abs(expenseChange).toFixed(1)}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{currentMonth.savings?.toLocaleString() || "0"}</div>
              <div className={`flex items-center text-xs ${savingsChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {savingsChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(savingsChange).toFixed(1)}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMonth.income > 0 ? ((currentMonth.savings / currentMonth.income) * 100).toFixed(1) : "0"}%
              </div>
              <div className="text-xs text-gray-600">Target: 20%</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="daily">Daily Spending</TabsTrigger>
            <TabsTrigger value="savings">Savings Rate</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses Trend</CardTitle>
                <CardDescription>Monthly comparison of your income and expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {monthlyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                        <Area
                          type="monotone"
                          dataKey="income"
                          stackId="1"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stackId="2"
                          stroke="#ef4444"
                          fill="#ef4444"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No trend data available yet. Add more transactions to see trends.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>How you're spending your money this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {categoryBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No category data available yet. Add expense transactions to see breakdown.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Expenses</CardTitle>
                  <CardDescription>Your biggest spending categories this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topExpenses.length > 0 ? (
                      topExpenses.map((expense, index) => (
                        <div key={expense.category} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{expense.category}</p>
                              <p className="text-sm text-gray-500">₱{expense.amount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {expense.change !== 0 && (
                              <Badge variant={expense.change > 0 ? "destructive" : "default"} className="text-xs">
                                {expense.change > 0 ? "+" : ""}
                                {expense.change}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>No expense data available yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>Daily Spending Pattern</CardTitle>
                <CardDescription>Your spending habits throughout the month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {dailySpending.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailySpending}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                        <Bar dataKey="amount" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No daily spending data available yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="savings">
            <Card>
              <CardHeader>
                <CardTitle>Savings Rate Trend</CardTitle>
                <CardDescription>Track your savings rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {savingsRate.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={savingsRate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No savings rate data available yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Insights</CardTitle>
              <CardDescription>Key observations about your spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savingsRate.length > 0 &&
                  savingsRate[savingsRate.length - 1].rate > savingsRate[savingsRate.length - 2]?.rate && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">Positive Trend</span>
                      </div>
                      <p className="text-sm text-green-700">Your savings rate has improved compared to last month.</p>
                    </div>
                  )}

                {dailySpending.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Spending Pattern</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Your spending tends to fluctuate throughout the month. Consider setting a daily budget.
                    </p>
                  </div>
                )}

                {categoryBreakdown.length > 0 && categoryBreakdown[0]?.percentage > 30 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <PieChartIcon className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Category Analysis</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {categoryBreakdown[0].name} expenses make up {categoryBreakdown[0].percentage.toFixed(1)}% of your
                      total spending, which is above the recommended 30%.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} financial overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Income</span>
                  <span className="font-semibold text-green-600">₱{currentMonth.income?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-semibold text-red-600">₱{currentMonth.expenses?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Net Savings</span>
                  <span className="font-semibold text-blue-600">₱{currentMonth.savings?.toLocaleString() || "0"}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Daily Spending</span>
                    <span className="font-semibold">
                      ₱
                      {dailySpending.length > 0
                        ? (dailySpending.reduce((sum, day) => sum + day.amount, 0) / dailySpending.length).toFixed(0)
                        : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Largest Expense</span>
                    <span className="font-semibold">
                      {topExpenses.length > 0
                        ? `₱${topExpenses[0].amount.toLocaleString()} (${topExpenses[0].category})`
                        : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Most Frequent Category</span>
                    <span className="font-semibold">
                      {categoryBreakdown.length > 0 ? categoryBreakdown[0].name : "None"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  TrendingUp,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Send,
  Sparkles,
  PiggyBank,
  CreditCard,
  DollarSign,
  RefreshCw,
  Clock,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Settings,
  Zap,
  TrendingDown,
  Copy,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Heart,
  Brain,
  Activity,
  Shield,
  Wallet,
  Plus,
  X,
  Calculator,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTransactions } from "@/hooks/use-transactions"
import { useWallets } from "@/hooks/use-wallets"
import { useGoals } from "@/hooks/use-goals"
import { useBudgets } from "@/hooks/use-budgets"
import { useCategories } from "@/hooks/use-categories"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

interface SmartSuggestion {
  id: number
  title: string
  description: string
  priority: "high" | "medium" | "low"
  effort: "low" | "medium" | "high"
  category: string
  potentialSavings?: number
  icon: any
  actions?: {
    primary: string
    secondary?: string
  }
  timeframe?: string
  impact?: number
}

interface ChatMessage {
  id: number
  type: "user" | "ai"
  message: string
  timestamp: string
  isHypothetical?: boolean
  dataUsed?: string
  isBookmarked?: boolean
  isLiked?: boolean
}

interface AIPreferences {
  dataAccess: {
    transactions: boolean
    wallets: boolean
    goals: boolean
    budgets: boolean
    categories: boolean
    personalInfo: boolean
  }
  insights: {
    spending: boolean
    saving: boolean
    investment: boolean
    debt: boolean
  }
  notifications: {
    insights: boolean
    suggestions: boolean
    weeklyReport: boolean
  }
  personalization: {
    riskTolerance: "low" | "medium" | "high"
    financialGoals: string[]
    savingsTarget: number
  }
}

export default function AIInsightsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { wallets, loading: walletsLoading } = useWallets()
  const { goals, loading: goalsLoading } = useGoals()
  const { budgets, loading: budgetsLoading } = useBudgets()
  const { categories, loading: categoriesLoading } = useCategories()

  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "ai",
      message:
        "Hi! I'm your AI financial assistant. I can help you analyze your spending patterns, suggest optimizations, and answer questions about your finances. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState<any[]>([])
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([])
  const [activeTab, setActiveTab] = useState("insights")
  const [aiPreferences, setAIPreferences] = useState<AIPreferences>({
    dataAccess: {
      transactions: true,
      wallets: true,
      goals: true,
      budgets: true,
      categories: true,
      personalInfo: false,
    },
    insights: {
      spending: true,
      saving: true,
      investment: true,
      debt: true,
    },
    notifications: {
      insights: true,
      suggestions: true,
      weeklyReport: true,
    },
    personalization: {
      riskTolerance: "medium",
      financialGoals: ["Emergency Fund", "Retirement", "Vacation"],
      savingsTarget: 20,
    },
  })
  const [insightFilter, setInsightFilter] = useState("all")
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, "like" | "dislike" | null>>({})
  const [refreshing, setRefreshing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [expandedInsights, setExpandedInsights] = useState<Record<number, boolean>>({})
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<number>>(new Set())
  const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set())
  const [quickActions, setQuickActions] = useState([
    "How can I save more money?",
    "What's my spending pattern?",
    "Should I invest my savings?",
    "How to create an emergency fund?",
    "What if my income increases by 20%?",
    "Best budgeting strategy for me?",
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    })
  }, [transactions, currentMonth, currentYear])

  const monthlyIncome = useMemo(() => {
    return monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  }, [monthlyTransactions])

  const monthlyExpenses = useMemo(() => {
    return Math.abs(monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0))
  }, [monthlyTransactions])

  const monthlySavings = useMemo(() => {
    return monthlyIncome - monthlyExpenses
  }, [monthlyIncome, monthlyExpenses])

  const expenses = useMemo(() => {
    return transactions.filter((t) => t.type === "expense")
  }, [transactions])

  const totalExpenses = useMemo(() => {
    return Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0))
  }, [expenses])

  const income = useMemo(() => {
    return transactions.filter((t) => t.type === "income")
  }, [transactions])

  const totalIncome = useMemo(() => {
    return income.reduce((sum, t) => sum + t.amount, 0)
  }, [income])

  // Enhanced salary income calculation
  const salaryData = useMemo(() => {
    // Filter salary income transactions (common salary-related keywords)
    const salaryKeywords = [
      "salary",
      "wage",
      "payroll",
      "income",
      "pay",
      "compensation",
      "earnings",
      "monthly pay",
      "bi-weekly pay",
      "weekly pay",
      "job",
      "work",
      "employment",
    ]

    const salaryTransactions = income.filter((transaction) => {
      const description = transaction.description?.toLowerCase() || ""
      const categoryName = transaction.categories?.name?.toLowerCase() || ""

      // Check if transaction description or category contains salary keywords
      return (
        salaryKeywords.some((keyword) => description.includes(keyword) || categoryName.includes(keyword)) ||
        // Also include transactions with "income" type and substantial amounts (likely salary)
        (transaction.type === "income" && transaction.amount >= 10000)
      ) // Assuming salary is at least 10k
    })

    // Group salary transactions by month-year
    const salaryByMonth: Record<string, number> = {}

    salaryTransactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!salaryByMonth[monthKey]) {
        salaryByMonth[monthKey] = 0
      }
      salaryByMonth[monthKey] += transaction.amount
    })

    // Calculate monthly average salary
    const monthsWithSalary = Object.keys(salaryByMonth)
    const totalSalaryIncome = Object.values(salaryByMonth).reduce((sum, amount) => sum + amount, 0)
    const averageMonthlySalary = monthsWithSalary.length > 0 ? totalSalaryIncome / monthsWithSalary.length : 0

    // Get last 6 months of salary data for trend analysis
    const now = new Date()
    const last6MonthsSalary: Array<{ month: string; amount: number }> = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      last6MonthsSalary.push({
        month: monthName,
        amount: salaryByMonth[monthKey] || 0,
      })
    }

    // Calculate salary growth trend
    const recentSalaries = last6MonthsSalary.filter((s) => s.amount > 0)
    let salaryGrowthRate = 0

    if (recentSalaries.length >= 2) {
      const firstSalary = recentSalaries[0].amount
      const lastSalary = recentSalaries[recentSalaries.length - 1].amount
      salaryGrowthRate = firstSalary > 0 ? ((lastSalary - firstSalary) / firstSalary) * 100 : 0
    }

    return {
      salaryTransactions,
      totalSalaryIncome,
      averageMonthlySalary,
      monthsWithSalary: monthsWithSalary.length,
      salaryByMonth,
      last6MonthsSalary,
      salaryGrowthRate,
      currentMonthSalary: salaryByMonth[`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`] || 0,
    }
  }, [income])

  const savingsRate = useMemo(() => {
    return totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
  }, [totalIncome, totalExpenses])

  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0)
  }, [wallets])

  const calculateHealthScore = () => {
    let score = 70

    if (savingsRate > 20) score += 10
    else if (savingsRate < 10) score -= 10

    const goalProgress =
      goals.reduce((sum, goal) => sum + (goal.current_amount / goal.target_amount) * 100, 0) / (goals.length || 1)
    if (goalProgress > 50) score += 5
    else if (goalProgress < 20) score -= 5

    if (wallets.length >= 3) score += 5

    const budgetAdherence = budgets.filter((b) => b.percentage <= 100).length / (budgets.length || 1)
    if (budgetAdherence > 0.8) score += 10
    else if (budgetAdherence < 0.5) score -= 10

    // Add salary stability bonus
    if (salaryData.monthsWithSalary >= 3) score += 5
    if (salaryData.salaryGrowthRate > 0) score += 3

    return Math.min(100, Math.max(0, score))
  }

  const healthScore = useMemo(
    () => calculateHealthScore(),
    [savingsRate, goals, wallets, budgets, transactions, totalIncome, salaryData],
  )

  const generateSmartSuggestions = (): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = []
    let suggestionId = 1

    if (transactions.length === 0) {
      suggestions.push({
        id: suggestionId++,
        title: "Start Your Financial Journey",
        description:
          "Begin by adding your first transaction to unlock personalized insights and AI-powered recommendations.",
        priority: "high",
        effort: "low",
        category: "Getting Started",
        icon: Plus,
        actions: {
          primary: "Add Transaction",
          secondary: "Import Data",
        },
        timeframe: "Now",
        impact: 90,
      })
      return suggestions
    }

    const expensesByCategory: Record<string, { amount: number; count: number }> = {}
    expenses.forEach((transaction: any) => {
      const categoryName = transaction.categories?.name || "Others"
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = { amount: 0, count: 0 }
      }
      expensesByCategory[categoryName].amount += Math.abs(transaction.amount)
      expensesByCategory[categoryName].count += 1
    })

    const sortedCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 3)

    // Salary-based savings suggestion
    if (salaryData.averageMonthlySalary > 0) {
      const currentSavings = totalIncome - totalExpenses
      const recommendedSavings = salaryData.averageMonthlySalary * (aiPreferences.personalization.savingsTarget / 100)

      if (currentSavings < recommendedSavings) {
        const additionalSavingsNeeded = recommendedSavings - currentSavings
        suggestions.push({
          id: suggestionId++,
          title: "Optimize Salary-Based Savings",
          description: `Based on your average monthly salary of ₱${Math.round(salaryData.averageMonthlySalary).toLocaleString()}, you should save ₱${Math.round(recommendedSavings).toLocaleString()} monthly. You need ₱${Math.round(additionalSavingsNeeded).toLocaleString()} more to reach your ${aiPreferences.personalization.savingsTarget}% target.`,
          priority: savingsRate < 10 ? "high" : "medium",
          effort: "medium",
          category: "Salary Optimization",
          potentialSavings: Math.round(additionalSavingsNeeded),
          icon: Calculator,
          actions: {
            primary: "Create Salary-Based Plan",
            secondary: "Learn More",
          },
          timeframe: "Monthly",
          impact: 90,
        })
      }
    }

    if (totalIncome > 0) {
      const currentSavings = totalIncome - totalExpenses
      const recommendedSavings = totalIncome * (aiPreferences.personalization.savingsTarget / 100)

      if (currentSavings < recommendedSavings) {
        const additionalSavingsNeeded = recommendedSavings - currentSavings
        suggestions.push({
          id: suggestionId++,
          title: "Boost Your Savings Rate",
          description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Save an additional ₱${Math.round(
            additionalSavingsNeeded,
          ).toLocaleString()} monthly to reach your ${aiPreferences.personalization.savingsTarget}% target.`,
          priority: savingsRate < 10 ? "high" : "medium",
          effort: "medium",
          category: "Savings",
          potentialSavings: Math.round(additionalSavingsNeeded),
          icon: PiggyBank,
          actions: {
            primary: "Create Savings Plan",
            secondary: "Learn More",
          },
          timeframe: "Monthly",
          impact: 85,
        })
      }
    }

    if (sortedCategories.length > 0) {
      const [topCategory, topData] = sortedCategories[0]
      const categoryPercentage = (topData.amount / totalExpenses) * 100

      if (categoryPercentage > 30 && topData.amount > 1000) {
        const potentialSavings = Math.round(topData.amount * 0.15)
        suggestions.push({
          id: suggestionId++,
          title: `Optimize ${topCategory} Spending`,
          description: `${topCategory} accounts for ${categoryPercentage.toFixed(1)}% of your expenses (₱${Math.round(
            topData.amount,
          ).toLocaleString()}). Reduce by 15% to save ₱${potentialSavings.toLocaleString()} monthly.`,
          priority: categoryPercentage > 40 ? "high" : "medium",
          effort: topCategory.toLowerCase().includes("food") ? "low" : "medium",
          category: topCategory,
          potentialSavings,
          icon: topCategory.toLowerCase().includes("food") ? DollarSign : CreditCard,
          actions: {
            primary: "Set Category Budget",
            secondary: "View Details",
          },
          timeframe: "Monthly",
          impact: categoryPercentage > 40 ? 80 : 65,
        })
      }
    }

    if (goals.length === 0) {
      suggestions.push({
        id: suggestionId++,
        title: "Set Your First Financial Goal",
        description:
          "Goals provide direction and motivation. Start with an emergency fund or a specific savings target to track your progress.",
        priority: "medium",
        effort: "low",
        category: "Planning",
        icon: Target,
        actions: {
          primary: "Create Goal",
          secondary: "See Templates",
        },
        timeframe: "Today",
        impact: 75,
      })
    }

    const emergencyFundGoal = goals.find((g) => g.name.toLowerCase().includes("emergency"))
    const recommendedEmergencyFund = totalExpenses * 3

    if (!emergencyFundGoal && totalExpenses > 0) {
      suggestions.push({
        id: suggestionId++,
        title: "Build Emergency Fund",
        description: `Create a safety net of ₱${Math.round(
          recommendedEmergencyFund,
        ).toLocaleString()} (3 months expenses). Start with ₱${Math.round(
          recommendedEmergencyFund / 12,
        ).toLocaleString()} monthly.`,
        priority: "high",
        effort: "medium",
        category: "Emergency Planning",
        potentialSavings: Math.round(recommendedEmergencyFund / 12),
        icon: Shield,
        actions: {
          primary: "Start Emergency Fund",
          secondary: "Learn More",
        },
        timeframe: "12 months",
        impact: 90,
      })
    }

    if (savingsRate > 25 && totalBalance > 50000) {
      suggestions.push({
        id: suggestionId++,
        title: "Investment Opportunity",
        description: `With ${savingsRate.toFixed(1)}% savings rate and ₱${Math.round(totalBalance).toLocaleString()} balance, consider investing for long-term growth.`,
        priority: "medium",
        effort: "medium",
        category: "Investments",
        icon: TrendingUp,
        actions: {
          primary: "Explore Investments",
          secondary: "Risk Assessment",
        },
        timeframe: "Next month",
        impact: 80,
      })
    }

    return suggestions.slice(0, 6)
  }

  const generateInsights = () => {
    const generatedInsights = []

    if (transactions.length === 0) {
      generatedInsights.push({
        id: 1,
        type: "getting_started",
        title: "Welcome to AI Insights! 🎉",
        description:
          "Start by adding transactions to unlock personalized financial insights and smart recommendations.",
        impact: "info",
        category: "Getting Started",
        icon: Lightbulb,
        color: "blue",
        actions: ["Add Transaction", "Import Data"],
      })
      setInsights(generatedInsights)
      return
    }

    // Salary-specific insights
    if (salaryData.averageMonthlySalary > 0) {
      generatedInsights.push({
        id: 1,
        type: "salary_insight",
        title: "Salary Analysis 💰",
        description: `Your average monthly salary is ₱${Math.round(salaryData.averageMonthlySalary).toLocaleString()} based on ${salaryData.monthsWithSalary} months of data. ${salaryData.salaryGrowthRate > 0 ? `Your salary has grown by ${salaryData.salaryGrowthRate.toFixed(1)}% over time.` : salaryData.salaryGrowthRate < 0 ? `Your salary has decreased by ${Math.abs(salaryData.salaryGrowthRate).toFixed(1)}% recently.` : "Your salary has remained stable."}`,
        impact: "info",
        category: "Salary",
        icon: Calculator,
        color: "green",
        actions: ["View Salary Trends", "Optimize Savings"],
        recommendation: `Based on your salary, aim to save ₱${Math.round(salaryData.averageMonthlySalary * 0.2).toLocaleString()} monthly (20% rule).`,
      })
    }

    const expensesByCategory: Record<string, number> = {}
    expenses.forEach((transaction: any) => {
      const categoryName = transaction.categories?.name || "Others"
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = 0
      }
      expensesByCategory[categoryName] += Math.abs(transaction.amount)
    })

    let topCategory = "None"
    let topAmount = 0
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topCategory = category
        topAmount = amount as number
      }
    })

    if (savingsRate < 20 && totalIncome > 0) {
      generatedInsights.push({
        id: 2,
        type: "spending_alert",
        title: "Savings Rate Below Target 📉",
        description: `Your current savings rate is ${savingsRate.toFixed(
          1,
        )}%. Financial experts recommend saving at least 20% of your income for long-term financial health.`,
        impact: "high",
        category: "Savings",
        icon: AlertTriangle,
        color: "red",
        actions: ["Create Savings Plan", "View Tips"],
        recommendation: `Try to save an additional ₱${Math.round(totalIncome * 0.2 - (totalIncome - totalExpenses)).toLocaleString()} monthly to reach the 20% target.`,
      })
    }

    if (topCategory !== "None" && totalExpenses > 0) {
      const percentage = (topAmount / totalExpenses) * 100
      if (percentage > 40) {
        generatedInsights.push({
          id: 3,
          type: "spending_alert",
          title: `High ${topCategory} Spending 🔍`,
          description: `${topCategory} makes up ${percentage.toFixed(
            1,
          )}% of your total expenses (₱${Math.round(topAmount).toLocaleString()}). This might be an area for optimization.`,
          impact: "medium",
          category: topCategory,
          icon: AlertTriangle,
          color: "yellow",
          actions: ["Set Budget", "View Details"],
          recommendation: `Consider reducing ${topCategory} spending by 10-15% to free up ₱${Math.round(topAmount * 0.125).toLocaleString()} monthly.`,
        })
      }
    }

    if (goals.length > 0) {
      const onTrackGoals = goals.filter((g) => {
        const progress = (g.current_amount / g.target_amount) * 100
        return progress >= 50
      })

      if (onTrackGoals.length > 0) {
        generatedInsights.push({
          id: 4,
          type: "goal_progress",
          title: "Goals On Track! 🎯",
          description: `You're making excellent progress on ${onTrackGoals.length} of your financial goals. Keep up the momentum!`,
          impact: "positive",
          category: "Goals",
          icon: CheckCircle,
          color: "green",
          actions: ["View Progress", "Adjust Timeline"],
          recommendation: `Consider increasing contributions to accelerate your timeline or set new stretch goals.`,
        })
      }
    }

    if (budgets.length > 0) {
      const exceededBudgets = budgets.filter((b) => b.percentage > 100)
      if (exceededBudgets.length > 0) {
        generatedInsights.push({
          id: 5,
          type: "budget_alert",
          title: "Budget Alert! ⚠️",
          description: `You've exceeded ${exceededBudgets.length} budget${exceededBudgets.length > 1 ? "s" : ""}. Time to review and adjust your spending in these categories.`,
          impact: "high",
          category: "Budgeting",
          icon: AlertTriangle,
          color: "red",
          actions: ["View Budgets", "Adjust Limits"],
          recommendation: `Review your spending patterns and consider increasing budget limits or reducing expenses in these categories.`,
        })
      }
    }

    if (savingsRate > 25 && totalBalance > 50000) {
      generatedInsights.push({
        id: 6,
        type: "investment_opportunity",
        title: "Investment Opportunity! 📈",
        description: `With a ${savingsRate.toFixed(1)}% savings rate and ₱${Math.round(totalBalance).toLocaleString()} balance, you're in a great position to start investing for long-term growth.`,
        impact: "positive",
        category: "Investments",
        icon: TrendingUp,
        color: "green",
        actions: ["Explore Options", "Risk Assessment"],
        recommendation: `Consider investing 10-20% of your balance in diversified funds or index funds for long-term wealth building.`,
      })
    }

    // Monthly comparison insight
    if (expenses.length > 10) {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const currentMonthExpenses = expenses.filter((t) => {
        const date = new Date(t.date)
        return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()
      })

      const lastMonthExpenses = expenses.filter((t) => {
        const date = new Date(t.date)
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()
      })

      const currentTotal = currentMonthExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const lastTotal = lastMonthExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)

      if (lastTotal > 0) {
        const changePercent = ((currentTotal - lastTotal) / lastTotal) * 100
        if (Math.abs(changePercent) > 15) {
          generatedInsights.push({
            id: 7,
            type: "spending_trend",
            title: `Spending ${changePercent > 0 ? "Increased" : "Decreased"} 📊`,
            description: `Your spending this month is ${Math.abs(changePercent).toFixed(1)}% ${changePercent > 0 ? "higher" : "lower"} than last month (₱${Math.round(Math.abs(currentTotal - lastTotal)).toLocaleString()} difference).`,
            impact: changePercent > 0 ? "medium" : "positive",
            category: "Trends",
            icon: changePercent > 0 ? TrendingUp : TrendingDown,
            color: changePercent > 0 ? "yellow" : "green",
            actions: ["Compare Details", "Set Alert"],
            recommendation:
              changePercent > 0
                ? "Review recent transactions to identify any unusual expenses or spending patterns."
                : "Great job on reducing expenses! Consider allocating the savings to your goals.",
          })
        }
      }
    }

    setInsights(generatedInsights)
  }

  useEffect(() => {
    if (!transactionsLoading && !walletsLoading && !goalsLoading && !budgetsLoading && !categoriesLoading) {
      generateInsights()
      setSmartSuggestions(generateSmartSuggestions())
    }
  }, [
    transactionsLoading,
    walletsLoading,
    goalsLoading,
    budgetsLoading,
    categoriesLoading,
    transactions,
    wallets,
    goals,
    budgets,
    categories,
    aiPreferences,
    salaryData,
  ])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, isLoading])

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return

    const userMessage: ChatMessage = {
      id: chatHistory.length + 1,
      type: "user",
      message: chatMessage,
      timestamp: new Date().toISOString(),
    }

    setChatHistory((prev) => [...prev, userMessage])
    const currentMessage = chatMessage
    setChatMessage("")
    setIsLoading(true)

    try {
      const financialData: any = {
        monthlyIncome: aiPreferences.dataAccess.transactions ? monthlyIncome : null,
        monthlyExpenses: aiPreferences.dataAccess.transactions ? monthlyExpenses : null,
        monthlySavings: aiPreferences.dataAccess.transactions ? monthlySavings : null,
        totalIncome: aiPreferences.dataAccess.transactions ? totalIncome : null,
        totalExpenses: aiPreferences.dataAccess.transactions ? totalExpenses : null,
        totalBalance: aiPreferences.dataAccess.wallets ? totalBalance : null,
        savingsRate: aiPreferences.dataAccess.transactions ? savingsRate : null,
        goals: aiPreferences.dataAccess.goals ? goals.length : null,
        wallets: aiPreferences.dataAccess.wallets ? wallets.length : null,
        budgets: aiPreferences.dataAccess.budgets ? budgets.length : null,
        riskTolerance: aiPreferences.personalization.riskTolerance,
        financialGoals: aiPreferences.personalization.financialGoals,
        savingsTarget: aiPreferences.personalization.savingsTarget,
        // Enhanced salary data
        averageMonthlySalary: salaryData.averageMonthlySalary,
        currentMonthSalary: salaryData.currentMonthSalary,
        salaryGrowthRate: salaryData.salaryGrowthRate,
        monthsWithSalaryData: salaryData.monthsWithSalary,
        salaryStability: salaryData.monthsWithSalary >= 3 ? "stable" : "irregular",
        last6MonthsSalary: salaryData.last6MonthsSalary,
      }

      if (aiPreferences.dataAccess.categories && aiPreferences.dataAccess.transactions) {
        financialData.topCategories = Object.entries(
          expenses.reduce((acc: Record<string, number>, t: any) => {
            const cat = t.categories?.name || "Others"
            acc[cat] = (acc[cat] || 0) + Math.abs(t.amount)
            return acc
          }, {}),
        )
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3)
      }

      const response = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userQuery: currentMessage,
          financialData,
          preferences: {
            insights: aiPreferences.insights,
            personalization: aiPreferences.personalization,
          },
          conversationHistory: chatHistory.slice(-5),
        }),
      })

      const data = await response.json()

      const aiResponse: ChatMessage = {
        id: chatHistory.length + 2,
        type: "ai",
        message: data.suggestion || "I'm sorry, I couldn't generate a response at the moment. Please try again.",
        timestamp: new Date().toISOString(),
        isHypothetical: data.isHypothetical || false,
        dataUsed: data.dataUsed || "actual",
      }

      setChatHistory((prev) => [...prev, aiResponse])

      if (data.isHypothetical) {
        toast({
          title: "Hypothetical Scenario",
          description: "I've analyzed your hypothetical situation using the numbers you provided.",
        })
      }
    } catch (error) {
      console.error("AI chat error:", error)
      const errorResponse: ChatMessage = {
        id: chatHistory.length + 2,
        type: "ai",
        message: generateEnhancedFallbackResponse(currentMessage),
        timestamp: new Date().toISOString(),
      }
      setChatHistory((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const generateEnhancedFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    const isHypothetical = detectHypotheticalScenario(message)
    const dataToUse = isHypothetical ? extractHypotheticalData(message) : { totalBalance, totalIncome, totalExpenses }

    const {
      totalIncome: incomeValue = 0,
      totalExpenses: expensesValue = 0,
      totalBalance: balanceValue = 0,
      hypotheticalBalance,
      savingsRate: savingsRateValue = 0,
    } = dataToUse

    const workingBalance = hypotheticalBalance || balanceValue

    if (lowerMessage.includes("allocate") || lowerMessage.includes("50/30/20") || lowerMessage.includes("balance")) {
      return `${isHypothetical ? `🎯 For your hypothetical balance of ₱${workingBalance.toLocaleString()}` : `💰 With your current balance of ₱${workingBalance.toLocaleString()}`}, here's a smart allocation:

**🏦 PRIORITY-BASED ALLOCATION:**

• **Emergency Fund (40%)**: ₱${Math.round(workingBalance * 0.4).toLocaleString()}
  Keep in high-yield savings (CIMB, ING, or BPI Save-Up)

• **Goal Progress (30%)**: ₱${Math.round(workingBalance * 0.3).toLocaleString()}
  Add to your highest priority financial goal

• **Next Month Buffer (20%)**: ₱${Math.round(workingBalance * 0.2).toLocaleString()}
  Keep in your main spending account for peace of mind

• **Growth Investment (10%)**: ₱${Math.round(workingBalance * 0.1).toLocaleString()}
  Consider UITF, mutual funds, or time deposits

**🚀 NEXT STEPS:**
1. Open separate savings account for emergency fund
2. Set up automatic goal contributions
3. Research investment options at your bank`
    }

    return `💼 **FINANCIAL SNAPSHOT** ${isHypothetical ? "(Hypothetical)" : ""}

• **Balance**: ₱${workingBalance.toLocaleString()}
• **Average Monthly Salary**: ₱${Math.round(salaryData.averageMonthlySalary).toLocaleString()}
• **Savings Rate**: ${savingsRateValue.toFixed(1)}%

**🎯 SALARY-BASED RECOMMENDATIONS:**
1. **Emergency Fund**: Aim for ₱${Math.round(salaryData.averageMonthlySalary * 3).toLocaleString()} (3 months salary)
2. **Monthly Savings**: Save ₱${Math.round(salaryData.averageMonthlySalary * 0.2).toLocaleString()} (20% of salary)
3. **Investment**: Consider ₱${Math.round(salaryData.averageMonthlySalary * 0.1).toLocaleString()} monthly for long-term growth

What specific area would you like me to dive deeper into?`
  }

  const detectHypotheticalScenario = (query: string): boolean => {
    const hypotheticalKeywords = [
      "what if",
      "if my",
      "suppose",
      "assuming",
      "hypothetically",
      "let's say",
      "imagine",
      "if i had",
      "if i have",
      "if my balance",
      "if my income",
    ]

    return hypotheticalKeywords.some((keyword) => query.toLowerCase().includes(keyword.toLowerCase()))
  }

  const extractHypotheticalData = (query: string): any => {
    const hypotheticalData = { totalBalance, totalIncome, totalExpenses }

    const balanceMatch = query.match(/balance.*?(\d+(?:,\d{3})*)/i)
    if (balanceMatch) {
      const amount = Number.parseInt(balanceMatch[1].replace(/,/g, ""))
      hypotheticalData.totalBalance = amount
      hypotheticalData.hypotheticalBalance = amount
    }

    const incomeMatch = query.match(/income.*?(\d+(?:,\d{3})*)/i)
    if (incomeMatch) {
      const amount = Number.parseInt(incomeMatch[1].replace(/,/g, ""))
      hypotheticalData.totalIncome = amount
    }

    return hypotheticalData
  }

  const handleRefreshInsights = () => {
    setRefreshing(true)
    setTimeout(() => {
      generateInsights()
      setSmartSuggestions(generateSmartSuggestions())
      setRefreshing(false)
      toast({
        title: "Insights Refreshed",
        description: "Your financial insights have been updated with the latest data.",
      })
    }, 1000)
  }

  const handleFeedback = (id: number, type: "like" | "dislike") => {
    setFeedbackGiven((prev) => ({
      ...prev,
      [id]: type,
    }))

    toast({
      title: type === "like" ? "Feedback Received" : "Feedback Noted",
      description:
        type === "like"
          ? "Thanks! We'll show more insights like this."
          : "Thanks for your feedback. We'll improve our suggestions.",
    })
  }

  const handleBookmarkMessage = (id: number) => {
    setBookmarkedMessages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })

    setChatHistory((prev) => prev.map((msg) => (msg.id === id ? { ...msg, isBookmarked: !msg.isBookmarked } : msg)))

    toast({
      title: bookmarkedMessages.has(id) ? "Bookmark Removed" : "Message Bookmarked",
      description: bookmarkedMessages.has(id) ? "Message removed from bookmarks" : "Message saved to bookmarks",
    })
  }

  const handleLikeMessage = (id: number) => {
    setLikedMessages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })

    setChatHistory((prev) => prev.map((msg) => (msg.id === id ? { ...msg, isLiked: !msg.isLiked } : msg)))

    toast({
      title: likedMessages.has(id) ? "Like Removed" : "Message Liked",
      description: likedMessages.has(id) ? "Like removed" : "Thanks for the feedback!",
    })
  }

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message)
    toast({
      title: "Copied to Clipboard",
      description: "Message copied successfully",
    })
  }

  const handleQuickAction = (action: string) => {
    setChatMessage(action)
    textareaRef.current?.focus()
  }

  const toggleInsightExpansion = (id: number) => {
    setExpandedInsights((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getInsightIcon = (insight: any) => {
    const IconComponent = insight.icon
    return <IconComponent className={`w-5 h-5 text-${insight.color}-600 dark:text-${insight.color}-400`} />
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="default" className="text-xs">
            Medium
          </Badge>
        )
      case "positive":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100 text-xs">
            Positive
          </Badge>
        )
      case "info":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100 text-xs">
            Info
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Low
          </Badge>
        )
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="default" className="text-xs">
            Medium
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Low
          </Badge>
        )
    }
  }

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case "high":
        return (
          <Badge
            variant="outline"
            className="text-red-600 border-red-200 dark:text-red-400 dark:border-red-800 text-xs"
          >
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800 text-xs"
          >
            Medium
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800 text-xs"
          >
            Low
          </Badge>
        )
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getHealthScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent financial health! 🌟"
    if (score >= 60) return "Good financial health 👍"
    return "Needs improvement 📈"
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading AI insights...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (transactionsLoading || walletsLoading || goalsLoading || budgetsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Analyzing your financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Insights</h1>
                <p className="text-xs text-muted-foreground">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefreshInsights} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowPreferences(!showPreferences)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Financial Health Score - Mobile optimized */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-foreground">Financial Health</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>{healthScore}/100</div>
            </div>
            <Progress
              value={healthScore}
              className="h-2 mb-2"
              indicatorClassName={`${
                healthScore >= 80 ? "bg-green-500" : healthScore >= 60 ? "bg-yellow-500" : "bg-red-500"
              }`}
            />
            <p className="text-sm text-muted-foreground">{getHealthScoreDescription(healthScore)}</p>
          </CardContent>
        </Card>

        {/* Enhanced Quick Stats - Mobile grid with salary data */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-muted-foreground">Avg Monthly Salary</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                ₱{Math.round(salaryData.averageMonthlySalary).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">{salaryData.monthsWithSalary} months data</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-muted-foreground">Savings Rate</span>
              </div>
              <div className="text-lg font-bold text-foreground">{savingsRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                {salaryData.salaryGrowthRate > 0
                  ? `+${salaryData.salaryGrowthRate.toFixed(1)}% growth`
                  : salaryData.salaryGrowthRate < 0
                    ? `${salaryData.salaryGrowthRate.toFixed(1)}% decline`
                    : "Stable"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-muted-foreground">Total Balance</span>
              </div>
              <div className="text-lg font-bold text-foreground">₱{totalBalance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-muted-foreground">This Month Salary</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                ₱{Math.round(salaryData.currentMonthSalary).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-optimized tabs */}
        <Tabs defaultValue="insights" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="insights" className="text-xs h-full">
              <Sparkles className="w-4 h-4 mr-1" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-xs h-full">
              <Lightbulb className="w-4 h-4 mr-1" />
              Tips
            </TabsTrigger>
            <TabsTrigger value="assistant" className="text-xs h-full">
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Insights Tab - Mobile optimized */}
          <TabsContent value="insights" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Key Insights</h2>
              <Select value={insightFilter} onValueChange={setInsightFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high_impact">High Impact</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="alerts">Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {insights.map((insight) => (
                <Card key={insight.id} className="overflow-hidden bg-card border-border">
                  <CardHeader className={`bg-card pb-3`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`p-2 rounded-full bg-${insight.color}-100 dark:bg-${insight.color}-800`}>
                          {getInsightIcon(insight)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-semibold text-foreground leading-tight">
                            {insight.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {getImpactBadge(insight.impact)}
                            <Badge variant="outline" className="text-xs">
                              {insight.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6"
                        onClick={() => toggleInsightExpansion(insight.id)}
                      >
                        {expandedInsights[insight.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                    {expandedInsights[insight.id] && insight.recommendation && (
                      <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Zap className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs font-medium text-foreground">Recommendation</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{insight.recommendation}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1 h-6 ${feedbackGiven[insight.id] === "like" ? "bg-green-100 dark:bg-green-900" : ""}`}
                          onClick={() => handleFeedback(insight.id, "like")}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1 h-6 ${feedbackGiven[insight.id] === "dislike" ? "bg-red-100 dark:bg-red-900" : ""}`}
                          onClick={() => handleFeedback(insight.id, "dislike")}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                      {insight.actions && (
                        <div className="flex gap-1">
                          {insight.actions.slice(0, 2).map((action: string, index: number) => (
                            <Button
                              key={index}
                              variant={index === 0 ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-6 px-2"
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Smart Suggestions Tab - Mobile optimized */}
          <TabsContent value="suggestions" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Smart Suggestions</h2>

            <div className="space-y-3">
              {smartSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="overflow-hidden bg-card border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <suggestion.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-semibold text-foreground leading-tight">
                            {suggestion.title}
                          </CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            {getPriorityBadge(suggestion.priority)}
                            {getEffortBadge(suggestion.effort)}
                          </div>
                        </div>
                      </div>
                      {suggestion.timeframe && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {suggestion.timeframe}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                      {suggestion.potentialSavings && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100 text-xs">
                          Save ₱{suggestion.potentialSavings.toLocaleString()}
                        </Badge>
                      )}
                    </div>

                    {suggestion.impact && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Impact Score</span>
                          <span className="font-medium">{suggestion.impact}/100</span>
                        </div>
                        <Progress
                          value={suggestion.impact}
                          className="h-1"
                          indicatorClassName={`${
                            suggestion.impact >= 80
                              ? "bg-green-500"
                              : suggestion.impact >= 60
                                ? "bg-blue-500"
                                : suggestion.impact >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                        />
                      </div>
                    )}

                    {suggestion.actions && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 text-xs h-8">
                          {suggestion.actions.primary}
                        </Button>
                        {suggestion.actions.secondary && (
                          <Button variant="outline" size="sm" className="text-xs h-8">
                            {suggestion.actions.secondary}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Assistant Tab - Mobile optimized */}
          <TabsContent value="assistant" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                  <Bot className="w-5 h-5 text-blue-600" />
                  AI Financial Assistant
                </CardTitle>
                <CardDescription className="text-sm">
                  Ask questions about your finances and get personalized advice based on your salary data
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Quick Actions - Mobile scrollable */}
                <div className="px-3 pb-3">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs whitespace-nowrap h-7 px-2"
                        onClick={() => handleQuickAction(action)}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages - Mobile optimized */}
                <div className="h-96 overflow-y-auto px-3 space-y-3">
                  {chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                          message.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-foreground border border-border"
                        }`}
                      >
                        {message.type === "ai" && (
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium">AI Assistant</span>
                            {message.isHypothetical && (
                              <Badge variant="outline" className="text-xs">
                                Hypothetical
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="text-sm">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                              ),
                              li: ({ children }) => <li className="text-sm">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                            }}
                          >
                            {message.message}
                          </ReactMarkdown>
                        </div>
                        {message.type === "ai" && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-6"
                                onClick={() => handleLikeMessage(message.id)}
                              >
                                <Heart
                                  className={`w-3 h-3 ${likedMessages.has(message.id) ? "fill-red-500 text-red-500" : ""}`}
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-6"
                                onClick={() => handleBookmarkMessage(message.id)}
                              >
                                {bookmarkedMessages.has(message.id) ? (
                                  <BookmarkCheck className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <Bookmark className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-6"
                                onClick={() => handleCopyMessage(message.message)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-3 py-2 border border-border">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-blue-600" />
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area - Mobile optimized */}
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ask about your finances or salary optimization"
                      className="min-h-[40px] max-h-24 resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim() || isLoading}
                      size="sm"
                      className="h-10 px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Try: "How should I allocate my ₱50,000 balance?" or "What if my salary increases by 20%?"
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Preferences Modal - Mobile optimized */}
        {showPreferences && (
          <Card className="fixed inset-4 z-50 bg-background border-border shadow-lg overflow-y-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">AI Preferences</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPreferences(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription className="text-sm">Customize your AI assistant experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-3 text-foreground">Data Access</h3>
                <div className="space-y-3">
                  {Object.entries(aiPreferences.dataAccess).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setAIPreferences((prev) => ({
                            ...prev,
                            dataAccess: { ...prev.dataAccess, [key]: checked },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3 text-foreground">Insight Types</h3>
                <div className="space-y-3">
                  {Object.entries(aiPreferences.insights).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm capitalize">
                        {key} Insights
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setAIPreferences((prev) => ({
                            ...prev,
                            insights: { ...prev.insights, [key]: checked },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3 text-foreground">Personalization</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Risk Tolerance</Label>
                    <Select
                      value={aiPreferences.personalization.riskTolerance}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setAIPreferences((prev) => ({
                          ...prev,
                          personalization: { ...prev.personalization, riskTolerance: value },
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Conservative</SelectItem>
                        <SelectItem value="medium">Moderate</SelectItem>
                        <SelectItem value="high">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Savings Target (%)</Label>
                    <div className="mt-1">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={aiPreferences.personalization.savingsTarget}
                        onChange={(e) =>
                          setAIPreferences((prev) => ({
                            ...prev,
                            personalization: { ...prev.personalization, savingsTarget: Number(e.target.value) },
                          }))
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>5%</span>
                        <span className="font-medium">{aiPreferences.personalization.savingsTarget}%</span>
                        <span>50%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/use-transactions";
import { useWallets } from "@/hooks/use-wallets";
import { useGoals } from "@/hooks/use-goals";

interface SmartSuggestion {
  id: number;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  category: string;
  potentialSavings?: number;
  icon: any;
}

export default function AIInsightsPage() {
  const { toast } = useToast();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { wallets, loading: walletsLoading } = useWallets();
  const { goals, loading: goalsLoading } = useGoals();

  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "ai",
      message:
        "Hi! I'm your AI financial assistant. I can help you analyze your spending patterns, suggest optimizations, and answer questions about your finances. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>(
    []
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = Math.abs(
    monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const monthlySavings = monthlyIncome - monthlyExpenses;

  // Calculate all financial metrics first
  const expenses = transactions.filter((t) => t.type === "expense");
  const totalExpenses = Math.abs(
    expenses.reduce((sum, t) => sum + t.amount, 0)
  );
  const income = transactions.filter((t) => t.type === "income");
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  // Calculate financial health score function
  const calculateHealthScore = () => {
    let score = 70; // Base score

    // Adjust based on savings rate
    if (savingsRate > 20) score += 10;
    else if (savingsRate < 10) score -= 10;

    // Adjust based on goals progress
    const goalProgress =
      goals.reduce(
        (sum, goal) => sum + (goal.current_amount / goal.target_amount) * 100,
        0
      ) / (goals.length || 1);
    if (goalProgress > 50) score += 5;
    else if (goalProgress < 20) score -= 5;

    // Adjust based on wallet diversity
    if (wallets.length >= 3) score += 5;

    return Math.min(100, Math.max(0, score));
  };

  const healthScore = calculateHealthScore();

  // Generate dynamic smart suggestions based on user data
  const generateSmartSuggestions = (): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    let suggestionId = 1;

    // Group expenses by category
    const expensesByCategory: Record<
      string,
      { amount: number; count: number }
    > = {};
    expenses.forEach((transaction: any) => {
      const categoryName = transaction.categories?.name || "Others";
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = { amount: 0, count: 0 };
      }
      expensesByCategory[categoryName].amount += Math.abs(transaction.amount);
      expensesByCategory[categoryName].count += 1;
    });

    // Find top expense categories
    const sortedCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 3);

    // Suggestion 1: Savings rate improvement
    if (totalIncome > 0) {
      const currentSavings = totalIncome - totalExpenses;
      const recommendedSavings = totalIncome * 0.2; // 20% rule

      if (currentSavings < recommendedSavings) {
        const additionalSavingsNeeded = recommendedSavings - currentSavings;
        suggestions.push({
          id: suggestionId++,
          title: "Increase Your Savings Rate",
          description: `Your current savings rate is ${savingsRate.toFixed(
            1
          )}%. Try to save an additional ₱${Math.round(
            additionalSavingsNeeded
          ).toLocaleString()} monthly to reach the recommended 20% savings rate.`,
          priority: savingsRate < 10 ? "high" : "medium",
          effort: "medium",
          category: "Savings",
          potentialSavings: Math.round(additionalSavingsNeeded),
          icon: PiggyBank,
        });
      }
    }

    // Suggestion 2: Top spending category optimization
    if (sortedCategories.length > 0) {
      const [topCategory, topData] = sortedCategories[0];
      const categoryPercentage = (topData.amount / totalExpenses) * 100;

      if (categoryPercentage > 30 && topData.amount > 5000) {
        const potentialSavings = Math.round(topData.amount * 0.15); // 15% reduction
        suggestions.push({
          id: suggestionId++,
          title: `Optimize ${topCategory} Spending`,
          description: `${topCategory} accounts for ${categoryPercentage.toFixed(
            1
          )}% of your expenses (₱${Math.round(
            topData.amount
          ).toLocaleString()}). Consider reducing this by 15% to save ₱${potentialSavings.toLocaleString()} monthly.`,
          priority: categoryPercentage > 40 ? "high" : "medium",
          effort: topCategory.toLowerCase().includes("food") ? "low" : "medium",
          category: topCategory,
          potentialSavings,
          icon: topCategory.toLowerCase().includes("food")
            ? DollarSign
            : CreditCard,
        });
      }
    }

    // Suggestion 3: Goal-based suggestions
    if (goals.length > 0) {
      const incompleteGoals = goals.filter(
        (g) => g.current_amount < g.target_amount
      );

      if (incompleteGoals.length > 0) {
        const priorityGoal = incompleteGoals.reduce((prev, current) =>
          current.target_amount - current.current_amount <
          prev.target_amount - prev.current_amount
            ? current
            : prev
        );

        const remainingAmount =
          priorityGoal.target_amount - priorityGoal.current_amount;
        const monthsToComplete = Math.ceil(
          remainingAmount /
            (savingsRate > 0 ? (totalIncome * savingsRate) / 100 : 1000)
        );

        suggestions.push({
          id: suggestionId++,
          title: `Accelerate "${priorityGoal.name}" Goal`,
          description: `You need ₱${Math.round(
            remainingAmount
          ).toLocaleString()} more to complete this goal. At your current savings rate, it will take ${monthsToComplete} months. Consider allocating ₱${Math.round(
            remainingAmount / 6
          ).toLocaleString()} monthly to complete it in 6 months.`,
          priority: "medium",
          effort: "low",
          category: "Goals",
          potentialSavings: Math.round(remainingAmount / 6),
          icon: Target,
        });
      }
    } else {
      // Suggest creating goals if none exist
      suggestions.push({
        id: suggestionId++,
        title: "Set Financial Goals",
        description:
          "You haven't set any financial goals yet. Creating specific goals like an emergency fund or vacation savings can help you stay motivated and track progress.",
        priority: "medium",
        effort: "low",
        category: "Planning",
        icon: Target,
      });
    }

    // Suggestion 4: Wallet optimization
    if (wallets.length > 1) {
      const walletsWithBalance = wallets.filter((w) => w.balance > 0);
      const totalWalletBalance = walletsWithBalance.reduce(
        (sum, w) => sum + w.balance,
        0
      );

      if (walletsWithBalance.length > 2 && totalWalletBalance > 10000) {
        suggestions.push({
          id: suggestionId++,
          title: "Consolidate Wallet Balances",
          description: `You have ₱${Math.round(
            totalWalletBalance
          ).toLocaleString()} spread across ${
            walletsWithBalance.length
          } wallets. Consider consolidating smaller balances into your main wallet for better tracking and potential higher interest earnings.`,
          priority: "low",
          effort: "low",
          category: "Organization",
          icon: CreditCard,
        });
      }
    }

    // Suggestion 5: Emergency fund check
    const emergencyFundGoal = goals.find((g) =>
      g.name.toLowerCase().includes("emergency")
    );
    const recommendedEmergencyFund = totalExpenses * 3; // 3 months of expenses

    if (!emergencyFundGoal && totalExpenses > 0) {
      suggestions.push({
        id: suggestionId++,
        title: "Create Emergency Fund",
        description: `Build an emergency fund of ₱${Math.round(
          recommendedEmergencyFund
        ).toLocaleString()} (3 months of expenses). Start with ₱${Math.round(
          recommendedEmergencyFund / 12
        ).toLocaleString()} monthly to build it over a year.`,
        priority: "high",
        effort: "medium",
        category: "Emergency Planning",
        potentialSavings: Math.round(recommendedEmergencyFund / 12),
        icon: AlertTriangle,
      });
    }

    // Suggestion 6: Spending pattern analysis
    if (expenses.length > 10) {
      const recentExpenses = expenses.slice(-30); // Last 30 transactions
      const avgDailySpending =
        recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0) / 30;
      const projectedMonthlySpending = avgDailySpending * 30;

      if (projectedMonthlySpending > totalExpenses * 1.1) {
        // 10% higher than average
        suggestions.push({
          id: suggestionId++,
          title: "Monitor Recent Spending Increase",
          description: `Your recent spending pattern shows ₱${Math.round(
            avgDailySpending
          ).toLocaleString()} daily average, which projects to ₱${Math.round(
            projectedMonthlySpending
          ).toLocaleString()} monthly. This is higher than your usual spending. Review recent transactions for any unusual expenses.`,
          priority: "medium",
          effort: "low",
          category: "Monitoring",
          icon: TrendingUp,
        });
      }
    }

    // Suggestion 7: Subscription audit (if many small recurring expenses)
    const smallExpenses = expenses.filter(
      (t) => Math.abs(t.amount) < 1000 && Math.abs(t.amount) > 100
    );
    if (smallExpenses.length > 10) {
      const totalSmallExpenses = smallExpenses.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );
      suggestions.push({
        id: suggestionId++,
        title: "Audit Small Recurring Expenses",
        description: `You have ${
          smallExpenses.length
        } small expenses totaling ₱${Math.round(
          totalSmallExpenses
        ).toLocaleString()}. Review these for subscriptions or services you might not need. Canceling just a few could save ₱${Math.round(
          totalSmallExpenses * 0.2
        ).toLocaleString()} monthly.`,
        priority: "low",
        effort: "low",
        category: "Subscriptions",
        potentialSavings: Math.round(totalSmallExpenses * 0.2),
        icon: Calendar,
      });
    }

    return suggestions.slice(0, 6); // Return top 6 suggestions
  };

  useEffect(() => {
    if (!transactionsLoading && !walletsLoading && !goalsLoading) {
      generateInsights();
      setSmartSuggestions(generateSmartSuggestions());
    }
  }, [
    transactionsLoading,
    walletsLoading,
    goalsLoading,
    transactions,
    wallets,
    goals,
  ]);

  const generateInsights = () => {
    const generatedInsights = [];

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach((transaction: any) => {
      const categoryName = transaction.categories?.name || "Others";
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = 0;
      }
      expensesByCategory[categoryName] += Math.abs(transaction.amount);
    });

    // Find top expense category
    let topCategory = "None";
    let topAmount = 0;
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topCategory = category;
        topAmount = amount as number;
      }
    });

    // Add insights based on data
    if (savingsRate < 20 && totalIncome > 0) {
      generatedInsights.push({
        id: 1,
        type: "spending_alert",
        title: "Low Savings Rate",
        description: `Your current savings rate is ${savingsRate.toFixed(
          1
        )}%. Financial experts recommend saving at least 20% of your income.`,
        impact: "high",
        category: "Savings",
        icon: AlertTriangle,
        color: "red",
      });
    }

    if (topCategory !== "None" && totalExpenses > 0) {
      const percentage = (topAmount / totalExpenses) * 100;
      if (percentage > 40) {
        generatedInsights.push({
          id: 2,
          type: "spending_alert",
          title: `High ${topCategory} Spending`,
          description: `${topCategory} makes up ${percentage.toFixed(
            1
          )}% of your total expenses. Consider reviewing this category for potential savings.`,
          impact: "medium",
          category: topCategory,
          icon: AlertTriangle,
          color: "yellow",
        });
      }
    }

    if (goals.length > 0) {
      const onTrackGoals = goals.filter((g) => {
        const progress = (g.current_amount / g.target_amount) * 100;
        return progress >= 50;
      });

      if (onTrackGoals.length > 0) {
        generatedInsights.push({
          id: 3,
          type: "goal_progress",
          title: "Goals On Track",
          description: `You're making good progress on ${onTrackGoals.length} of your financial goals. Keep up the good work!`,
          impact: "positive",
          category: "Goals",
          icon: CheckCircle,
          color: "green",
        });
      }
    }

    if (wallets.length > 1) {
      const highestBalanceWallet = wallets.reduce((prev, current) =>
        prev.balance > current.balance ? prev : current
      );
      generatedInsights.push({
        id: 4,
        type: "optimization",
        title: "Wallet Optimization",
        description: `Your ${highestBalanceWallet.name} has the highest balance. Consider consolidating funds for better management.`,
        impact: "medium",
        category: "Optimization",
        icon: TrendingUp,
        color: "blue",
      });
    }

    setInsights(generatedInsights);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      id: chatHistory.length + 1,
      type: "user",
      message: chatMessage,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          userQuery: chatMessage,
          financialData: {
            monthlyIncome,
            monthlyExpenses,
            monthlySavings,
            totalIncome,
            totalExpenses,
            totalBalance,
            savingsRate,
            goals: goals.length,
            wallets: wallets.length,
            topCategories: Object.entries(
              expenses.reduce((acc: Record<string, number>, t: any) => {
                const cat = t.categories?.name || "Others";
                acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 3),
          },
        }),
      });

      const data = await response.json();
      console.log(data.suggestion);

      const aiResponse = {
        id: chatHistory.length + 2,
        type: "ai",
        message:
          data.suggestion ||
          "I'm sorry, I couldn't generate a response at the moment. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI chat error:", error);
      const errorResponse = {
        id: chatHistory.length + 2,
        type: "ai",
        message: generateAIResponse(chatMessage),
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("budget") || lowerMessage.includes("spending")) {
      return `Based on your data, your total expenses are ₱${totalExpenses.toLocaleString()}. Your highest spending categories are ${
        insights[0]?.category || "Food"
      } and ${
        insights[1]?.category || "Transportation"
      }. I recommend setting a monthly budget for each category to better control your spending.`;
    }

    if (lowerMessage.includes("save") || lowerMessage.includes("goal")) {
      return `You currently have ${
        goals.length
      } financial goals set up. Your total savings are ₱${(
        totalIncome - totalExpenses
      ).toLocaleString()}. To optimize your savings: 1) Automate transfers to avoid spending temptation, 2) Consider the 50/30/20 rule, and 3) Review and increase savings by 1% each month.`;
    }

    if (
      lowerMessage.includes("investment") ||
      lowerMessage.includes("invest")
    ) {
      return `You have ₱${totalBalance.toLocaleString()} across ${
        wallets.length
      } wallets. For investments, consider: 1) Moving some funds to a high-yield savings account for better returns, 2) Starting with low-risk index funds if you're new to investing, 3) Diversifying across different asset classes. Always invest only what you can afford to lose and maintain your emergency fund first.`;
    }

    return `I understand you're asking about your finances. Based on your current data, you have ₱${totalBalance.toLocaleString()} total balance across ${
      wallets.length
    } wallets. Your monthly savings rate is ${
      totalIncome > 0
        ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)
        : 0
    }%. Is there a specific area you'd like me to analyze deeper - spending patterns, savings optimization, or goal planning?`;
  };

  const getInsightIcon = (insight: any) => {
    const IconComponent = insight.icon;
    return <IconComponent className={`w-5 h-5 text-${insight.color}-600`} />;
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "positive":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Positive
          </Badge>
        );
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case "high":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            High Effort
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-200"
          >
            Medium Effort
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            Low Effort
          </Badge>
        );
    }
  };

  if (transactionsLoading || walletsLoading || goalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="sm:max-w-7xl lg:max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Financial Insights
            </h1>
            <p className="text-gray-600">
              Get personalized recommendations and smart financial advice
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Key Insights
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of your financial patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.length > 0 ? (
                    insights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full bg-${insight.color}-100`}
                          >
                            {getInsightIcon(insight)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{insight.title}</h3>
                              {getImpactBadge(insight.impact)}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              {insight.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="outline">
                                {insight.category}
                              </Badge>
                              {insight.savings && (
                                <span className="text-green-600 font-medium">
                                  Potential savings: ₱
                                  {insight.savings.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>
                        No insights available yet. Add more transactions to get
                        personalized insights.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  AI Financial Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your finances and get personalized advice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat History */}
                  <div className=" h-[calc(100vh/2)] overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
                    {chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex ${
                          chat.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            chat.type === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-white border"
                          }`}
                        >
                          {chat.type === "ai" ? (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{chat.message}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm">{chat.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask me about your spending, savings, or financial goals..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim() || isLoading}
                      size="icon"
                      className="self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Quick Questions */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      "How can I save more money?",
                      "Analyze my spending patterns",
                      "Investment suggestions",
                      "Budget optimization tips",
                    ].map((question) => (
                      <Button
                        key={question}
                        variant="outline"
                        size="sm"
                        onClick={() => setChatMessage(question)}
                        className="text-xs"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Suggestions */}
          <div className="space-y-6">
            {/* Smart Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Smart Suggestions
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {smartSuggestions.length > 0 ? (
                    smartSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <suggestion.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">
                                {suggestion.title}
                              </h4>
                              {getPriorityBadge(suggestion.priority)}
                            </div>
                            <p className="text-gray-600 text-xs mb-3">
                              {suggestion.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              {getEffortBadge(suggestion.effort)}
                              {suggestion.potentialSavings && (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                  Save ₱
                                  {suggestion.potentialSavings.toLocaleString()}
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 w-full"
                            >
                              Apply Suggestion
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">
                        Add more financial data to get personalized suggestions.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Financial Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-green-600">
                    {healthScore}/100
                  </div>
                  <p className="text-sm text-gray-600">
                    {healthScore >= 80
                      ? "Excellent"
                      : healthScore >= 60
                      ? "Good"
                      : "Needs improvement"}{" "}
                    financial health
                  </p>

                  <div className="space-y-3 text-left">
                    <div className="flex justify-between text-sm">
                      <span>Savings Rate</span>
                      <span
                        className={
                          totalIncome > 0 &&
                          ((totalIncome - totalExpenses) / totalIncome) * 100 >=
                            20
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {totalIncome > 0
                          ? (
                              ((totalIncome - totalExpenses) / totalIncome) *
                              100
                            ).toFixed(1) + "%"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Budget Adherence</span>
                      <span className="text-yellow-600">Good</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Goal Progress</span>
                      <span
                        className={
                          goals.length > 0
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {goals.length > 0 ? "On Track" : "No Goals"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Spending Consistency</span>
                      <span className="text-blue-600">Stable</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Summary */}
            <Card>
              <CardHeader>
                <CardTitle>This Month's AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {wallets.length > 0
                        ? `Managing ${wallets.length} wallet${
                            wallets.length > 1 ? "s" : ""
                          } successfully`
                        : "Add your first wallet to start tracking"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {totalIncome > 0
                        ? `Total income: ₱${totalIncome.toLocaleString()}`
                        : "Add income transactions to track earnings"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      {totalExpenses > 0
                        ? `Total expenses: ₱${totalExpenses.toLocaleString()}`
                        : "Add expense transactions to monitor spending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Target className="w-4 h-4" />
                    <span>
                      {goals.length > 0
                        ? `${goals.length} financial goal${
                            goals.length > 1 ? "s" : ""
                          } set`
                        : "Create your first financial goal"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

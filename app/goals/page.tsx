"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Target, Calendar, TrendingUp, Trash2, CheckCircle, Clock, AlertTriangle, PiggyBank } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useGoals } from "@/hooks/use-goals"

const categories = ["savings", "travel", "technology", "investment", "housing", "education", "health", "other"]
const priorities = ["low", "medium", "high"]

export default function GoalsPage() {
  const { toast } = useToast()
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useGoals()
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [isSavingsDialogOpen, setIsSavingsDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [savingsAmount, setSavingsAmount] = useState("")
  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
    target_amount: "",
    target_date: "",
    category: "",
    priority: "medium",
  })

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount || !newGoal.target_date || !newGoal.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await createGoal({
        name: newGoal.name,
        description: newGoal.description,
        target_amount: Number.parseFloat(newGoal.target_amount),
        current_amount: 0,
        target_date: newGoal.target_date,
        category: newGoal.category,
        priority: newGoal.priority as "low" | "medium" | "high",
        status: "active",
      })

      setIsGoalDialogOpen(false)
      setNewGoal({ name: "", description: "", target_amount: "", target_date: "", category: "", priority: "medium" })
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSavings = async () => {
    if (!savingsAmount || Number.parseFloat(savingsAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const newCurrentAmount = selectedGoal.current_amount + Number.parseFloat(savingsAmount)
      await updateGoal(selectedGoal.id, {
        current_amount: newCurrentAmount,
        status: newCurrentAmount >= selectedGoal.target_amount ? "completed" : "active",
      })

      setIsSavingsDialogOpen(false)
      setSavingsAmount("")
      setSelectedGoal(null)

      toast({
        title: "Savings Added",
        description: `₱${Number.parseFloat(savingsAmount).toLocaleString()} added to ${selectedGoal.name}`,
      })
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      await deleteGoal(goalId)
    }
  }

  const openSavingsDialog = (goal: any) => {
    setSelectedGoal(goal)
    setIsSavingsDialogOpen(true)
  }

  const getGoalStatus = (goal: any) => {
    const progress = (goal.current_amount / goal.target_amount) * 100
    const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    if (progress >= 100) return { status: "completed", color: "green", icon: CheckCircle }
    if (progress >= 90) return { status: "nearly_complete", color: "blue", icon: TrendingUp }
    if (daysLeft < 30) return { status: "urgent", color: "red", icon: AlertTriangle }
    return { status: "on_track", color: "yellow", icon: Clock }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Goals & Budgets</h1>
            <p className="text-gray-600">Set financial targets and track your spending limits</p>
          </div>
        </div>

        {/* Goals Tab */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-1 md:gap-0 justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Your Financial Goals</h2>
              <p className="text-gray-600">Track progress towards your financial objectives</p>
            </div>
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button className=" w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>Set a new financial target to work towards</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-name">Goal Name</Label>
                    <Input
                      id="goal-name"
                      placeholder="e.g., Emergency Fund, Vacation"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-description">Description (Optional)</Label>
                    <Textarea
                      id="goal-description"
                      placeholder="Brief description of your goal"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-target">Target Amount (₱)</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newGoal.target_amount}
                      onChange={(e) => setNewGoal((prev) => ({ ...prev, target_amount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-deadline">Target Date</Label>
                    <Input
                      id="goal-deadline"
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal((prev) => ({ ...prev, target_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-category">Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-priority">Priority</Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(value) => setNewGoal((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddGoal} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Goal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100
                const daysLeft = Math.ceil(
                  (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )
                const statusInfo = getGoalStatus(goal)
                const StatusIcon = statusInfo.icon

                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-blue-600" />
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                        </div>
                        <CardDescription className="text-sm">{goal.description}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700"
                          onClick={() => openSavingsDialog(goal)}
                          disabled={goal.status === "completed"}
                        >
                          <PiggyBank className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Progress</span>
                          <Badge
                            variant="outline"
                            className={`text-${statusInfo.color}-600 border-${statusInfo.color}-200`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {progress.toFixed(0)}%
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>₱{goal.current_amount.toLocaleString()}</span>
                          <span>₱{goal.target_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Remaining</p>
                          <p className="font-semibold">
                            ₱{(goal.target_amount - goal.current_amount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Days Left</p>
                          <p className="font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {daysLeft > 0 ? daysLeft : "Overdue"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-gray-500">Priority</span>
                          <Badge
                            variant={
                              goal.priority === "high"
                                ? "destructive"
                                : goal.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {goal.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
                <p className="text-gray-600 mb-4">Create your first financial goal to start tracking your progress</p>
                <Button onClick={() => setIsGoalDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Add Savings Dialog */}
        <Dialog open={isSavingsDialogOpen} onOpenChange={setIsSavingsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Savings</DialogTitle>
              <DialogDescription>Add money to your goal: {selectedGoal?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="savings-amount">Amount (₱)</Label>
                <Input
                  id="savings-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                />
              </div>
              {selectedGoal && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Current Progress</span>
                    <span className="text-sm font-medium">
                      {((selectedGoal.current_amount / selectedGoal.target_amount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(selectedGoal.current_amount / selectedGoal.target_amount) * 100}
                    className="h-2 mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₱{selectedGoal.current_amount.toLocaleString()}</span>
                    <span>₱{selectedGoal.target_amount.toLocaleString()}</span>
                  </div>
                  {savingsAmount && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">After adding savings:</span>
                        <span className="font-medium text-green-600">
                          ₱{(selectedGoal.current_amount + Number.parseFloat(savingsAmount)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSavingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSavings} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Savings"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

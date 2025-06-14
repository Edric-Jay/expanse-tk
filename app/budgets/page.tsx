"use client"

import { useState } from "react"
import { useCategories } from "@/hooks/use-categories"
import { useBudgets, type BudgetWithSpending } from "@/hooks/use-budgets"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Check, Plus, Trash2, Edit, Calendar, Tag } from "lucide-react"
import { format } from "date-fns"

export default function BudgetsPage() {
  const { budgets, isLoading, createBudget, updateBudget, deleteBudget, calculateEndDate } = useBudgets()
  const { categories } = useCategories()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithSpending | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    limit_amount: 0,
    period: "monthly",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(calculateEndDate(new Date(), "monthly"), "yyyy-MM-dd"),
    useCustomEndDate: false,
  })

  const [formErrors, setFormErrors] = useState({
    name: false,
    category_id: false,
    limit_amount: false,
    start_date: false,
    end_date: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter budgets based on active tab
  const filteredBudgets = budgets.filter((budget) => {
    if (activeTab === "all") return true
    if (activeTab === "at-risk") return budget.status === "at-risk"
    if (activeTab === "exceeded") return budget.status === "exceeded"
    return true
  })

  // Calculate summary statistics
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.limit_amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const exceededCount = budgets.filter((budget) => budget.status === "exceeded").length
  const atRiskCount = budgets.filter((budget) => budget.status === "at-risk").length

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: false }))
    }

    // If period changes, update end date automatically (unless using custom end date)
    if (field === "period" && !formData.useCustomEndDate && value !== "custom") {
      const startDate = new Date(formData.start_date)
      const newEndDate = calculateEndDate(startDate, value as string)
      setFormData((prev) => ({
        ...prev,
        end_date: format(newEndDate, "yyyy-MM-dd"),
        useCustomEndDate: value === "custom",
      }))
    }

    // If start date changes, update end date automatically (unless using custom end date)
    if (field === "start_date" && !formData.useCustomEndDate) {
      const startDate = new Date(value as string)
      const newEndDate = calculateEndDate(startDate, formData.period)
      setFormData((prev) => ({ ...prev, end_date: format(newEndDate, "yyyy-MM-dd") }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {
      name: !formData.name.trim(),
      category_id: !formData.category_id,
      limit_amount: formData.limit_amount <= 0,
      start_date: !formData.start_date,
      end_date: !formData.end_date || new Date(formData.end_date) <= new Date(formData.start_date),
    }

    setFormErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  // Handle create budget form submission
  const handleCreateBudget = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const success = await createBudget({
        name: formData.name,
        category_id: formData.category_id,
        limit_amount: formData.limit_amount,
        period: formData.useCustomEndDate ? "custom" : formData.period,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      })

      if (success) {
        setCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit budget form submission
  const handleEditBudget = async () => {
    if (!validateForm() || !selectedBudget) return

    setIsSubmitting(true)

    try {
      const success = await updateBudget(selectedBudget.id, {
        name: formData.name,
        category_id: formData.category_id,
        limit_amount: formData.limit_amount,
        period: formData.useCustomEndDate ? "custom" : formData.period,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      })

      if (success) {
        setEditDialogOpen(false)
        setSelectedBudget(null)
        resetForm()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete budget
  const handleDeleteBudget = async () => {
    if (!selectedBudget) return

    setIsSubmitting(true)

    try {
      const success = await deleteBudget(selectedBudget.id)

      if (success) {
        setDeleteDialogOpen(false)
        setSelectedBudget(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: "",
      category_id: "",
      limit_amount: 0,
      period: "monthly",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(calculateEndDate(new Date(), "monthly"), "yyyy-MM-dd"),
      useCustomEndDate: false,
    })

    setFormErrors({
      name: false,
      category_id: false,
      limit_amount: false,
      start_date: false,
      end_date: false,
    })
  }

  // Set up form for editing
  const setupEditForm = (budget: BudgetWithSpending) => {
    setSelectedBudget(budget)
    setFormData({
      name: budget.name,
      category_id: budget.category_id,
      limit_amount: budget.limit_amount,
      period: budget.period,
      start_date: format(new Date(budget.start_date), "yyyy-MM-dd"),
      end_date: format(new Date(budget.end_date), "yyyy-MM-dd"),
      useCustomEndDate: budget.period === "custom",
    })
    setEditDialogOpen(true)
  }

  // Set up budget for deletion
  const setupDeleteBudget = (budget: BudgetWithSpending) => {
    setSelectedBudget(budget)
    setDeleteDialogOpen(true)
  }

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown Category"
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-500"
      case "at-risk":
        return "bg-yellow-500"
      case "exceeded":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "on-track":
        return "On Track"
      case "at-risk":
        return "At Risk"
      case "exceeded":
        return "Exceeded"
      default:
        return "Unknown"
    }
  }

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    return `${format(new Date(startDate), "MMM d, yyyy")} - ${format(new Date(endDate), "MMM d, yyyy")}`
  }

  // Format period
  const formatPeriod = (period: string) => {
    switch (period) {
      case "weekly":
        return "Weekly"
      case "monthly":
        return "Monthly"
      case "quarterly":
        return "Quarterly"
      case "yearly":
        return "Yearly"
      case "custom":
        return "Custom"
      default:
        return period
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Manage and track your spending limits</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>New Budget</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>Set up a new budget to track your spending in a specific category.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={formErrors.name ? "border-red-500" : ""}
                  placeholder="e.g., Monthly Groceries"
                />
                {formErrors.name && <p className="text-red-500 text-sm">Budget name is required</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                  <SelectTrigger className={formErrors.category_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((category) => category.type === "expense")
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formErrors.category_id && <p className="text-red-500 text-sm">Category is required</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Budget Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.limit_amount || ""}
                    onChange={(e) => handleInputChange("limit_amount", Number.parseFloat(e.target.value) || 0)}
                    className={`pl-8 ${formErrors.limit_amount ? "border-red-500" : ""}`}
                    placeholder="0.00"
                  />
                </div>
                {formErrors.limit_amount && (
                  <p className="text-red-500 text-sm">Budget amount must be greater than zero</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="period">Budget Period</Label>
                <Select value={formData.period} onValueChange={(value) => handleInputChange("period", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                  className={formErrors.start_date ? "border-red-500" : ""}
                />
                {formErrors.start_date && <p className="text-red-500 text-sm">Start date is required</p>}
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="end_date">End Date</Label>
                  {formData.period !== "custom" && (
                    <span className="text-xs text-muted-foreground">Auto-calculated based on period</span>
                  )}
                </div>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                  disabled={formData.period !== "custom" && !formData.useCustomEndDate}
                  className={formErrors.end_date ? "border-red-500" : ""}
                />
                {formErrors.end_date && <p className="text-red-500 text-sm">End date must be after start date</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBudget} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Budget"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budgeted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {budgets.length} active budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : "0"}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exceededCount} Exceeded</div>
            <p className="text-xs text-muted-foreground mt-1">{atRiskCount} budgets at risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Budget List */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Budgets</TabsTrigger>
          <TabsTrigger value="at-risk">At Risk</TabsTrigger>
          <TabsTrigger value="exceeded">Exceeded</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading budgets...</p>
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground mb-4">No budgets found</p>
              <Button onClick={() => setCreateDialogOpen(true)}>Create Your First Budget</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBudgets.map((budget) => (
                <Card key={budget.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{budget.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Tag className="h-3 w-3" />
                          <span>{getCategoryName(budget.category_id)}</span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setupEditForm(budget)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setupDeleteBudget(budget)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(budget.status)}`}></span>
                        <span className="text-sm font-medium">{getStatusText(budget.status)}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit_amount)}
                      </div>
                    </div>
                    <Progress
                      value={budget.percentage > 100 ? 100 : budget.percentage}
                      className={`h-2 ${
                        budget.status === "exceeded"
                          ? "bg-red-200"
                          : budget.status === "at-risk"
                            ? "bg-yellow-200"
                            : "bg-gray-200"
                      }`}
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateRange(budget.start_date, budget.end_date)}</span>
                      </div>
                      <div>{formatPeriod(budget.period)}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="w-full text-sm">
                      {budget.status === "exceeded" ? (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            Exceeded by {formatCurrency(Math.abs(budget.remaining))} (
                            {Math.abs(((budget.spent - budget.limit_amount) / budget.limit_amount) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span>
                            {formatCurrency(budget.remaining)} remaining (
                            {((budget.remaining / budget.limit_amount) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Budget Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>Update your budget details and tracking information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Budget Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-red-500 text-sm">Budget name is required</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                <SelectTrigger className={formErrors.category_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((category) => category.type === "expense")
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formErrors.category_id && <p className="text-red-500 text-sm">Category is required</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Budget Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <Input
                  id="edit-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.limit_amount || ""}
                  onChange={(e) => handleInputChange("limit_amount", Number.parseFloat(e.target.value) || 0)}
                  className={`pl-8 ${formErrors.limit_amount ? "border-red-500" : ""}`}
                />
              </div>
              {formErrors.limit_amount && (
                <p className="text-red-500 text-sm">Budget amount must be greater than zero</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-period">Budget Period</Label>
              <Select value={formData.period} onValueChange={(value) => handleInputChange("period", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-start-date">Start Date</Label>
              <Input
                id="edit-start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                className={formErrors.start_date ? "border-red-500" : ""}
              />
              {formErrors.start_date && <p className="text-red-500 text-sm">Start date is required</p>}
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="edit-end-date">End Date</Label>
                {formData.period !== "custom" && (
                  <span className="text-xs text-muted-foreground">Auto-calculated based on period</span>
                )}
              </div>
              <Input
                id="edit-end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                disabled={formData.period !== "custom" && !formData.useCustomEndDate}
                className={formErrors.end_date ? "border-red-500" : ""}
              />
              {formErrors.end_date && <p className="text-red-500 text-sm">End date must be after start date</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBudget} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Budget Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedBudget && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">{selectedBudget.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(selectedBudget.limit_amount)} • {getCategoryName(selectedBudget.category_id)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBudget} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

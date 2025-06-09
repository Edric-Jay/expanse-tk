"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Tags,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Gamepad2,
  Heart,
  GraduationCap,
  Briefcase,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/hooks/use-categories"

const iconOptions = [
  { name: "Utensils", component: Utensils },
  { name: "Car", component: Car },
  { name: "Home", component: Home },
  { name: "ShoppingBag", component: ShoppingBag },
  { name: "Gamepad2", component: Gamepad2 },
  { name: "Heart", component: Heart },
  { name: "GraduationCap", component: GraduationCap },
  { name: "Briefcase", component: Briefcase },
  { name: "Tags", component: Tags },
]

const colorOptions = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#64748b"]

export default function CategoriesPage() {
  const { toast } = useToast()
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#3b82f6",
    icon: "Tags",
  })

  const handleSaveCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, newCategory)
      } else {
        await createCategory(newCategory)
      }

      setIsDialogOpen(false)
      setEditingCategory(null)
      setNewCategory({ name: "", type: "expense", color: "#3b82f6", icon: "Tags" })
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(categoryId)
    }
  }

  const getIcon = (iconName: string) => {
    const iconOption = iconOptions.find((option) => option.name === iconName)
    return iconOption ? iconOption.component : Tags
  }

  const expenseCategories = categories.filter((cat) => cat.type === "expense")
  const incomeCategories = categories.filter((cat) => cat.type === "income")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Organize your transactions with custom categories</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingCategory(null)
                  setNewCategory({ name: "", type: "expense", color: "#3b82f6", icon: "Tags" })
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update the category details" : "Add a new category to organize your transactions"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    placeholder="e.g., Groceries, Gas, Rent"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-type">Type</Label>
                  <Select
                    value={newCategory.type}
                    onValueChange={(value: "income" | "expense") =>
                      setNewCategory((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-icon">Icon</Label>
                  <Select
                    value={newCategory.icon}
                    onValueChange={(value) => setNewCategory((prev) => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => {
                        const IconComponent = icon.component
                        return (
                          <SelectItem key={icon.name} value={icon.name}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {icon.name}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-color">Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${newCategory.color === color ? "border-gray-900" : "border-gray-300"}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategory((prev) => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCategory} disabled={isLoading}>
                  {isLoading ? "Saving..." : editingCategory ? "Update" : "Create"} Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expenseCategories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Income Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{incomeCategories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {categories.length > 0 ? categories[0].name : "None"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Expense Categories
            </CardTitle>
            <CardDescription>Categories for tracking your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseCategories.length > 0 ? (
                expenseCategories.map((category) => {
                  const Icon = getIcon(category.icon)

                  return (
                    <div key={category.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full" style={{ backgroundColor: `${category.color}20` }}>
                            <Icon className="w-5 h-5" style={{ color: category.color }} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-gray-500">Expense category</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>No expense categories yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Income Categories
            </CardTitle>
            <CardDescription>Categories for tracking your income sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomeCategories.length > 0 ? (
                incomeCategories.map((category) => {
                  const Icon = getIcon(category.icon)

                  return (
                    <div key={category.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full" style={{ backgroundColor: `${category.color}20` }}>
                            <Icon className="w-5 h-5" style={{ color: category.color }} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-gray-500">Income category</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>No income categories yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

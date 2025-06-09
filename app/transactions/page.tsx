"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, ArrowUpRight, ArrowDownRight, Calendar, Download, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTransactions } from "@/hooks/use-transactions"
import { useWallets } from "@/hooks/use-wallets"
import { useCategories } from "@/hooks/use-categories"
import { useToast } from "@/hooks/use-toast"

export default function TransactionsPage() {
  const { transactions, loading, updateTransaction, deleteTransaction } = useTransactions()
  const { wallets } = useWallets()
  const { categories } = useCategories()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedWallet, setSelectedWallet] = useState("All")
  const [activeTab, setActiveTab] = useState("all")
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || transaction.categories?.name === selectedCategory
    const matchesWallet = selectedWallet === "All" || transaction.wallets?.name === selectedWallet
    const matchesType = activeTab === "all" || transaction.type === activeTab

    return matchesSearch && matchesCategory && matchesWallet && matchesType
  })

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0))

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction({
      ...transaction,
      amount: Math.abs(transaction.amount),
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateTransaction = async () => {
    if (
      !editingTransaction.description ||
      !editingTransaction.amount ||
      !editingTransaction.wallet_id ||
      !editingTransaction.category_id
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await updateTransaction(editingTransaction.id, {
        description: editingTransaction.description,
        amount:
          editingTransaction.type === "expense"
            ? -Math.abs(editingTransaction.amount)
            : Math.abs(editingTransaction.amount),
        type: editingTransaction.type,
        category_id: editingTransaction.category_id,
        wallet_id: editingTransaction.wallet_id,
        date: editingTransaction.date,
        notes: editingTransaction.notes,
      })

      setIsEditDialogOpen(false)
      setEditingTransaction(null)
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(transactionId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Track and manage all your financial activities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link href="/transactions/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{totalIncome.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₱{totalExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Net Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ₱{(totalIncome - totalExpenses).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Wallets</SelectItem>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.name}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-fit">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expenses</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No transactions found matching your criteria.</p>
                      <Button asChild className="mt-4">
                        <Link href="/transactions/new">Add your first transaction</Link>
                      </Button>
                    </div>
                  ) : (
                    filteredTransactions.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`p-2 rounded-full flex-shrink-0 ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}
                          >
                            {transaction.type === "income" ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base">{transaction.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {transaction.categories?.name || "Uncategorized"}
                              </Badge>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">{transaction.wallets?.name || "Unknown"}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {transaction.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-right">
                            <p
                              className={`font-semibold text-lg ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                            >
                              {transaction.type === "income" ? "+" : ""}₱{Math.abs(transaction.amount).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Edit Transaction Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>Update the transaction details</DialogDescription>
            </DialogHeader>
            {editingTransaction && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingTransaction.description}
                    onChange={(e) => setEditingTransaction((prev: any) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount (₱)</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingTransaction.amount}
                    onChange={(e) =>
                      setEditingTransaction((prev: any) => ({
                        ...prev,
                        amount: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={editingTransaction.type}
                    onValueChange={(value) => setEditingTransaction((prev: any) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingTransaction.category_id}
                    onValueChange={(value) => setEditingTransaction((prev: any) => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-wallet">Wallet</Label>
                  <Select
                    value={editingTransaction.wallet_id}
                    onValueChange={(value) => setEditingTransaction((prev: any) => ({ ...prev, wallet_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingTransaction.date}
                    onChange={(e) => setEditingTransaction((prev: any) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes (Optional)</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingTransaction.notes || ""}
                    onChange={(e) => setEditingTransaction((prev: any) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTransaction} disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Transaction"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

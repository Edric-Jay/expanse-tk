"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Wallet, CreditCard, Banknote, PiggyBank, Trash2, Edit, ArrowRightLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallets } from "@/hooks/use-wallets"

const walletTypes = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "bank", label: "Bank Account", icon: CreditCard },
  { value: "digital", label: "Digital Wallet", icon: Wallet },
  { value: "savings", label: "Savings Account", icon: PiggyBank },
]

const colorOptions = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#64748b"]

export default function WalletsPage() {
  const { toast } = useToast()
  const { wallets, loading, createWallet, updateWallet, deleteWallet, transferFunds } = useWallets()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingWallet, setEditingWallet] = useState<any>(null)
  const [walletForm, setWalletForm] = useState({
    name: "",
    type: "cash" as "cash" | "bank" | "digital" | "savings",
    balance: "",
    color: "#3b82f6",
  })
  const [transferForm, setTransferForm] = useState({
    fromWalletId: "",
    toWalletId: "",
    amount: "",
  })

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)

  const handleOpenDialog = (wallet?: any) => {
    if (wallet) {
      // Edit mode
      setEditingWallet(wallet)
      setWalletForm({
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance.toString(),
        color: wallet.color,
      })
    } else {
      // Create mode
      setEditingWallet(null)
      setWalletForm({
        name: "",
        type: "cash",
        balance: "",
        color: "#3b82f6",
      })
    }
    setIsDialogOpen(true)
  }

  const handleOpenTransferDialog = () => {
    if (wallets.length < 2) {
      toast({
        title: "Transfer Error",
        description: "You need at least two wallets to transfer funds.",
        variant: "destructive",
      })
      return
    }

    setTransferForm({
      fromWalletId: wallets[0]?.id || "",
      toWalletId: wallets[1]?.id || "",
      amount: "",
    })
    setIsTransferDialogOpen(true)
  }

  const handleSaveWallet = async () => {
    if (!walletForm.name || !walletForm.type || !walletForm.balance) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const walletData = {
        name: walletForm.name,
        type: walletForm.type,
        balance: Number.parseFloat(walletForm.balance),
        color: walletForm.color,
        icon: walletTypes.find((t) => t.value === walletForm.type)?.icon.name || "Wallet",
      }

      if (editingWallet) {
        await updateWallet(editingWallet.id, walletData)
        toast({
          title: "Success",
          description: "Wallet updated successfully!",
        })
      } else {
        await createWallet(walletData)
        toast({
          title: "Success",
          description: "Wallet created successfully!",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransferFunds = async () => {
    if (!transferForm.fromWalletId || !transferForm.toWalletId || !transferForm.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (transferForm.fromWalletId === transferForm.toWalletId) {
      toast({
        title: "Error",
        description: "Source and destination wallets must be different.",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(transferForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    const sourceWallet = wallets.find((w) => w.id === transferForm.fromWalletId)
    if (sourceWallet && sourceWallet.balance < amount) {
      toast({
        title: "Error",
        description: "Insufficient funds in the source wallet.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await transferFunds(transferForm.fromWalletId, transferForm.toWalletId, amount)

      toast({
        title: "Success",
        description: "Funds transferred successfully!",
      })
      setIsTransferDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to transfer funds.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWallet = async (id: string) => {
    if (confirm("Are you sure you want to delete this wallet?")) {
      await deleteWallet(id)
    }
  }

  const getWalletIcon = (type: string) => {
    const walletType = walletTypes.find((t) => t.value === type)
    return walletType ? walletType.icon : Wallet
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallets...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Wallets & Accounts</h1>
            <p className="text-gray-600">Manage your money sources and track balances</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Wallet
            </Button>
            {wallets.length >= 2 && (
              <Button variant="outline" onClick={handleOpenTransferDialog}>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Transfer
              </Button>
            )}
          </div>
        </div>

        {/* Wallet Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingWallet ? "Edit Wallet" : "Add New Wallet"}</DialogTitle>
              <DialogDescription>
                {editingWallet ? "Update your wallet details" : "Create a new wallet or account to track your money"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Wallet Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Savings, Credit Card"
                  value={walletForm.name}
                  onChange={(e) => setWalletForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Wallet Type</Label>
                <Select
                  value={walletForm.type}
                  onValueChange={(value: "cash" | "bank" | "digital" | "savings") =>
                    setWalletForm((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select wallet type" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Balance (₱)</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={walletForm.balance}
                  onChange={(e) => setWalletForm((prev) => ({ ...prev, balance: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${walletForm.color === color ? "border-gray-900" : "border-gray-300"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setWalletForm((prev) => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveWallet} disabled={isLoading}>
                {isLoading ? "Saving..." : editingWallet ? "Update Wallet" : "Add Wallet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer Dialog */}
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Funds</DialogTitle>
              <DialogDescription>Move money between your wallets</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromWallet">From Wallet</Label>
                <Select
                  value={transferForm.fromWalletId}
                  onValueChange={(value) => setTransferForm((prev) => ({ ...prev, fromWalletId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name} (₱{wallet.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toWallet">To Wallet</Label>
                <Select
                  value={transferForm.toWalletId}
                  onValueChange={(value) => setTransferForm((prev) => ({ ...prev, toWalletId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name} (₱{wallet.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTransferFunds} disabled={isLoading}>
                {isLoading ? "Transferring..." : "Transfer Funds"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Total Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">₱{totalBalance.toLocaleString()}</div>
            <p className="text-gray-600 mt-1">Across {wallets.length} wallets and accounts</p>
          </CardContent>
        </Card>

        {/* Wallets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.length > 0 ? (
            wallets.map((wallet) => {
              const Icon = getWalletIcon(wallet.type)
              const balancePercentage = totalBalance > 0 ? (wallet.balance / totalBalance) * 100 : 0

              return (
                <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: `${wallet.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: wallet.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{wallet.name}</CardTitle>
                        <CardDescription className="capitalize">{wallet.type.replace("_", " ")}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(wallet)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteWallet(wallet.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">₱{wallet.balance.toLocaleString()}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Share of total</span>
                        <span>{balancePercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={balancePercentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No wallets yet</h3>
              <p className="text-gray-600 mb-4">Create your first wallet to start tracking your money</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Wallet
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {wallets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cash</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱
                  {wallets
                    .filter((w) => w.type === "cash")
                    .reduce((sum, w) => sum + w.balance, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱
                  {wallets
                    .filter((w) => w.type === "bank")
                    .reduce((sum, w) => sum + w.balance, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Digital Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱
                  {wallets
                    .filter((w) => w.type === "digital")
                    .reduce((sum, w) => sum + w.balance, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱
                  {wallets
                    .filter((w) => w.type === "savings")
                    .reduce((sum, w) => sum + w.balance, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Bell, Shield, Palette, Globe, Download, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"

const currencies = [
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
]

const languages = [
  { code: "en", name: "English" },
  { code: "fil", name: "Filipino" },
  { code: "es", name: "Spanish" },
  { code: "zh", name: "Chinese" },
]

const themes = [
  { value: "light", name: "Light" },
  { value: "dark", name: "Dark" },
  { value: "system", name: "System" },
]

export default function SettingsPage() {
  const { toast } = useToast()
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userSettings, setUserSettings] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    currency: "PHP",
    language: "en",
    theme: "light",
    email_notifications: true,
    push_notifications: true,
    budget_alerts: true,
    goal_reminders: true,
    weekly_reports: true,
    data_sharing: false,
    analytics: true,
    auto_backup: true,
    biometric_auth: false,
  })

  const [stats, setStats] = useState({
    transactions: 0,
    wallets: 0,
    goals: 0,
    categories: 0,
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchStats()
    } else {
      // Demo mode
      setLoading(false)
      setUserProfile({ full_name: "Demo User" })
      setUserSettings({
        currency: "PHP",
        language: "en",
        theme: "light",
        email_notifications: true,
        push_notifications: true,
        budget_alerts: true,
        goal_reminders: true,
        weekly_reports: true,
        data_sharing: false,
        analytics: true,
        auto_backup: true,
        biometric_auth: false,
      })
      setFormData({
        full_name: "Demo User",
        currency: "PHP",
        language: "en",
        theme: "light",
        email_notifications: true,
        push_notifications: true,
        budget_alerts: true,
        goal_reminders: true,
        weekly_reports: true,
        data_sharing: false,
        analytics: true,
        auto_backup: true,
        biometric_auth: false,
      })
      setStats({
        transactions: 12,
        wallets: 3,
        goals: 2,
        categories: 8,
      })
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      if (!supabase) {
        // Demo mode
        setUserProfile({ full_name: "Demo User" })
        setUserSettings({
          currency: "PHP",
          language: "en",
          theme: "light",
          email_notifications: true,
          push_notifications: true,
          budget_alerts: true,
          goal_reminders: true,
          weekly_reports: true,
          data_sharing: false,
          analytics: true,
          auto_backup: true,
          biometric_auth: false,
        })
        setFormData({
          full_name: "Demo User",
          currency: "PHP",
          language: "en",
          theme: "light",
          email_notifications: true,
          push_notifications: true,
          budget_alerts: true,
          goal_reminders: true,
          weekly_reports: true,
          data_sharing: false,
          analytics: true,
          auto_backup: true,
          biometric_auth: false,
        })
        return
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      // Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user?.id)
        .single()

      if (settingsError && settingsError.code !== "PGRST116") {
        throw settingsError
      }

      setUserProfile(profileData)
      setUserSettings(settingsData)

      // Update form data
      setFormData({
        full_name: profileData?.full_name || "",
        currency: settingsData?.currency || "PHP",
        language: settingsData?.language || "en",
        theme: settingsData?.theme || "light",
        email_notifications: settingsData?.email_notifications ?? true,
        push_notifications: settingsData?.push_notifications ?? true,
        budget_alerts: settingsData?.budget_alerts ?? true,
        goal_reminders: settingsData?.goal_reminders ?? true,
        weekly_reports: settingsData?.weekly_reports ?? true,
        data_sharing: settingsData?.data_sharing ?? false,
        analytics: settingsData?.analytics ?? true,
        auto_backup: settingsData?.auto_backup ?? true,
        biometric_auth: settingsData?.biometric_auth ?? false,
      })
    } catch (error: any) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      if (!supabase || !user) {
        // Demo mode
        setStats({
          transactions: 12,
          wallets: 3,
          goals: 2,
          categories: 8,
        })
        return
      }

      // Get transaction count
      const { count: transactionCount } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)

      // Get wallet count
      const { count: walletCount } = await supabase
        .from("wallets")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)

      // Get goal count
      const { count: goalCount } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)

      // Get category count
      const { count: categoryCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)

      setStats({
        transactions: transactionCount || 0,
        wallets: walletCount || 0,
        goals: goalCount || 0,
        categories: categoryCount || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSave = async () => {
    try {
      if (!supabase || !user) {
        // Demo mode
        toast({
          title: "Demo Mode",
          description: "Settings would be saved in a real account.",
        })
        return
      }

      // Update user profile
      const { error: profileError } = await supabase.from("users").upsert({
        id: user?.id,
        email: user?.email,
        full_name: formData.full_name,
        updated_at: new Date().toISOString(),
      })

      if (profileError) throw profileError

      // Update user settings
      const { error: settingsError } = await supabase.from("user_settings").upsert({
        user_id: user?.id,
        currency: formData.currency,
        language: formData.language,
        theme: formData.theme,
        email_notifications: formData.email_notifications,
        push_notifications: formData.push_notifications,
        budget_alerts: formData.budget_alerts,
        goal_reminders: formData.goal_reminders,
        weekly_reports: formData.weekly_reports,
        data_sharing: formData.data_sharing,
        analytics: formData.analytics,
        auto_backup: formData.auto_backup,
        biometric_auth: formData.biometric_auth,
        updated_at: new Date().toISOString(),
      })

      if (settingsError) throw settingsError

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleExportData = async () => {
    try {
      if (!supabase || !user) {
        // Demo mode
        const demoData = {
          transactions: [
            { id: 1, description: "Groceries", amount: 2500, date: new Date().toISOString() },
            { id: 2, description: "Rent", amount: 15000, date: new Date().toISOString() },
          ],
          wallets: [
            { id: 1, name: "Cash", balance: 5000 },
            { id: 2, name: "Bank", balance: 25000 },
          ],
          goals: [{ id: 1, name: "Vacation", target: 50000, current: 15000 }],
          exported_at: new Date().toISOString(),
        }

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(demoData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `expense-tracker-demo-data.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Demo Export",
          description: "Sample data has been exported.",
        })
        return
      }

      // Fetch all user data
      const { data: transactions } = await supabase.from("transactions").select("*").eq("user_id", user?.id)

      const { data: wallets } = await supabase.from("wallets").select("*").eq("user_id", user?.id)

      const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user?.id)

      const exportData = {
        transactions,
        wallets,
        goals,
        exported_at: new Date().toISOString(),
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `expense-tracker-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        if (!supabase || !user) {
          // Demo mode
          toast({
            title: "Demo Mode",
            description: "Account deletion is not available in demo mode.",
          })
          return
        }

        // Delete all user data
        await supabase.from("transactions").delete().eq("user_id", user?.id)
        await supabase.from("goals").delete().eq("user_id", user?.id)
        await supabase.from("wallets").delete().eq("user_id", user?.id)
        await supabase.from("categories").delete().eq("user_id", user?.id)
        await supabase.from("user_settings").delete().eq("user_id", user?.id)
        await supabase.from("users").delete().eq("id", user?.id)

        await signOut()

        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted.",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleChangePassword = () => {
    if (!supabase || !user?.email) {
      toast({
        title: "Demo Mode",
        description: "Password change is not available in demo mode.",
      })
      return
    }

    supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for a link to reset your password.",
    })
  }

  const applyTheme = (theme: string) => {
    // Apply theme to the document
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Save theme preference
    localStorage.setItem("theme", theme)

    toast({
      title: "Theme Applied",
      description: `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme has been applied.`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and app preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1">
            <TabsTrigger value="profile" className="text-xs md:text-sm px-2 py-2">
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs md:text-sm px-2 py-2">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs md:text-sm px-2 py-2">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs md:text-sm px-2 py-2">
              Privacy
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs md:text-sm px-2 py-2">
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.full_name}
                      onChange={(e) => updateFormData("full_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || "demo@example.com"}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Biometric Authentication</Label>
                      <p className="text-sm text-gray-600">Use fingerprint or face recognition to unlock the app</p>
                    </div>
                    <Switch
                      checked={formData.biometric_auth}
                      onCheckedChange={(checked: any) => updateFormData("biometric_auth", checked)}
                    />
                  </div>
                  <Button variant="outline" onClick={handleChangePassword}>
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  App Preferences
                </CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => updateFormData("currency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => updateFormData("language", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) => {
                      updateFormData("theme", value)
                      applyTheme(value)
                    }}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">App Behavior</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-gray-600">Automatically backup your data to the cloud</p>
                    </div>
                    <Switch
                      checked={formData.auto_backup}
                      onCheckedChange={(checked: any) => updateFormData("auto_backup", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={formData.email_notifications}
                      onCheckedChange={(checked: any) => updateFormData("email_notifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={formData.push_notifications}
                      onCheckedChange={(checked: any) => updateFormData("push_notifications", checked)}
                    />
                  </div>

                  <Separator />

                  <h3 className="text-lg font-semibold">Specific Notifications</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Budget Alerts</Label>
                      <p className="text-sm text-gray-600">Get notified when you exceed budget limits</p>
                    </div>
                    <Switch
                      checked={formData.budget_alerts}
                      onCheckedChange={(checked: any) => updateFormData("budget_alerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Goal Reminders</Label>
                      <p className="text-sm text-gray-600">Reminders about your financial goals</p>
                    </div>
                    <Switch
                      checked={formData.goal_reminders}
                      onCheckedChange={(checked: any) => updateFormData("goal_reminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-600">Weekly summary of your financial activity</p>
                    </div>
                    <Switch
                      checked={formData.weekly_reports}
                      onCheckedChange={(checked: any) => updateFormData("weekly_reports", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Sharing</Label>
                      <p className="text-sm text-gray-600">Share anonymized data to help improve the app</p>
                    </div>
                    <Switch
                      checked={formData.data_sharing}
                      onCheckedChange={(checked: any) => updateFormData("data_sharing", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Analytics</Label>
                      <p className="text-sm text-gray-600">Allow collection of usage analytics</p>
                    </div>
                    <Switch
                      checked={formData.analytics}
                      onCheckedChange={(checked: any) => updateFormData("analytics", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Data Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export My Data
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDeleteAccount}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription>Import, export, and manage your financial data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Export Data</h3>
                  <p className="text-sm text-gray-600">Download your data in various formats for backup or analysis</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" onClick={handleExportData}>
                      Export as JSON
                    </Button>
                    <Button variant="outline" onClick={handleExportData}>
                      Export as CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportData}>
                      Export as PDF
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Data Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.transactions}</div>
                      <div className="text-sm text-gray-600">Transactions</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.wallets}</div>
                      <div className="text-sm text-gray-600">Wallets</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.goals}</div>
                      <div className="text-sm text-gray-600">Goals</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.categories}</div>
                      <div className="text-sm text-gray-600">Categories</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

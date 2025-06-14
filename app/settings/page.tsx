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
import { useCurrency } from "@/hooks/use-currency"
import { useTheme } from "next-themes"
import { useNotifications } from "@/hooks/use-notifications"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

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
  const { currency, setCurrency } = useCurrency()
  const { theme, setTheme } = useTheme()
  const { requestNotificationPermission, scheduleNotifications } = useNotifications()
  const supabase = createClientComponentClient<Database>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userSettings, setUserSettings] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    language: "en",
    email_notifications: true,
    push_notifications: true,
    budget_alerts: true,
    goal_reminders: true,
    weekly_reports: true,
    data_sharing: false,
    analytics: true,
    auto_backup: true,
    biometric_auth: false,
    notification_times: ["06:00", "12:00", "20:00"],
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
        language: "en",
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
        language: "en",
        email_notifications: true,
        push_notifications: true,
        budget_alerts: true,
        goal_reminders: true,
        weekly_reports: true,
        data_sharing: false,
        analytics: true,
        auto_backup: true,
        biometric_auth: false,
        notification_times: ["06:00", "12:00", "20:00"],
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

      if (!user) {
        setLoading(false)
        return
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile fetch error:", profileError)
      }

      // Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user?.id)
        .single()

      if (settingsError && settingsError.code !== "PGRST116") {
        console.error("Settings fetch error:", settingsError)
      }

      setUserProfile(profileData)
      setUserSettings(settingsData)

      // Update form data
      setFormData({
        full_name: profileData?.full_name || "",
        language: settingsData?.language || "en",
        email_notifications: settingsData?.notifications?.email ?? true,
        push_notifications: settingsData?.notifications?.push ?? true,
        budget_alerts: settingsData?.notifications?.budgetAlerts ?? true,
        goal_reminders: settingsData?.notifications?.goalUpdates ?? true,
        weekly_reports: settingsData?.notifications?.weeklyReports ?? true,
        data_sharing: settingsData?.privacy?.shareData ?? false,
        analytics: settingsData?.privacy?.anonymousAnalytics ?? true,
        auto_backup: true,
        biometric_auth: false,
        notification_times: settingsData?.notification_times || ["06:00", "12:00", "20:00"],
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
      if (!user) {
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
    if (!user) {
      // Demo mode
      toast({
        title: "Demo Mode",
        description: "Settings would be saved in a real account.",
      })
      return
    }

    try {
      setSaving(true)

      // First, ensure the user has records by calling a function that creates them
      const { error: ensureError } = await supabase.rpc("ensure_user_records", {
        user_id: user.id,
        user_email: user.email || "",
        user_name: formData.full_name || user.email || "",
      })

      if (ensureError) {
        console.log("Ensure records error (may be expected):", ensureError)
      }

      // Now update the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) {
        console.error("Profile update error:", profileError)
        throw new Error(`Failed to save profile: ${profileError.message}`)
      }

      // Update user settings
      const { error: settingsError } = await supabase
        .from("user_settings")
        .update({
          language: formData.language,
          currency: currency,
          theme: theme,
          notifications: {
            email: formData.email_notifications,
            push: formData.push_notifications,
            budgetAlerts: formData.budget_alerts,
            goalUpdates: formData.goal_reminders,
            weeklyReports: formData.weekly_reports,
            insights: true,
          },
          privacy: {
            shareData: formData.data_sharing,
            anonymousAnalytics: formData.analytics,
          },
          notification_times: formData.notification_times,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (settingsError) {
        console.error("Settings update error:", settingsError)
        throw new Error(`Failed to save settings: ${settingsError.message}`)
      }

      // Schedule notifications if push notifications are enabled
      if (formData.push_notifications) {
        await requestNotificationPermission()
        scheduleNotifications()
      }

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      })

      // Refresh the data
      await fetchUserData()
    } catch (error: any) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      if (!user) {
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
        if (!user) {
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
        await supabase.from("profiles").delete().eq("id", user?.id)

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
    if (!user?.email) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and app preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 h-fit">
            <TabsTrigger
              value="profile"
              className="text-xs md:text-sm px-3 py-2 rounded-md data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="text-xs md:text-sm px-3 py-2 rounded-md data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300"
            >
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="text-xs md:text-sm px-3 py-2 rounded-md data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="text-xs md:text-sm px-3 py-2 rounded-md data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300"
            >
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="text-xs md:text-sm px-3 py-2 rounded-md data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300"
            >
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.full_name}
                      onChange={(e) => updateFormData("full_name", e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || "demo@example.com"}
                      disabled
                      className="bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Biometric Authentication</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use fingerprint or face recognition to unlock the app
                      </p>
                    </div>
                    <Switch
                      checked={formData.biometric_auth}
                      onCheckedChange={(checked: any) => updateFormData("biometric_auth", checked)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Palette className="w-5 h-5" />
                  App Preferences
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Customize your app experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-gray-700 dark:text-gray-300">
                      Default Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        {currencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code} className="text-gray-900 dark:text-white">
                            {curr.symbol} {curr.name} ({curr.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-gray-700 dark:text-gray-300">
                      Language
                    </Label>
                    <Select value={formData.language} onValueChange={(value) => updateFormData("language", value)}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        {languages.map((language) => (
                          <SelectItem
                            key={language.code}
                            value={language.code}
                            className="text-gray-900 dark:text-white"
                          >
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-gray-700 dark:text-gray-300">
                    Theme
                  </Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      {themes.map((themeOption) => (
                        <SelectItem
                          key={themeOption.value}
                          value={themeOption.value}
                          className="text-gray-900 dark:text-white"
                        >
                          {themeOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">App Behavior</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Auto Backup</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically backup your data to the cloud
                      </p>
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
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Email Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={formData.email_notifications}
                      onCheckedChange={(checked: any) => updateFormData("email_notifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Push Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={formData.push_notifications}
                      onCheckedChange={(checked: any) => updateFormData("push_notifications", checked)}
                    />
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Specific Notifications</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Budget Alerts</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when you exceed budget limits
                      </p>
                    </div>
                    <Switch
                      checked={formData.budget_alerts}
                      onCheckedChange={(checked: any) => updateFormData("budget_alerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Goal Reminders</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reminders about your financial goals</p>
                    </div>
                    <Switch
                      checked={formData.goal_reminders}
                      onCheckedChange={(checked: any) => updateFormData("goal_reminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Weekly Reports</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Weekly summary of your financial activity
                      </p>
                    </div>
                    <Switch
                      checked={formData.weekly_reports}
                      onCheckedChange={(checked: any) => updateFormData("weekly_reports", checked)}
                    />
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reminder Times</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get reminded to track your expenses at these times: 6:00 AM, 12:00 PM, and 8:00 PM
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Daily reminders enabled
                      </span>
                      <Switch
                        checked={formData.push_notifications}
                        onCheckedChange={(checked: any) => updateFormData("push_notifications", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Data Sharing</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Share anonymized data to help improve the app
                      </p>
                    </div>
                    <Switch
                      checked={formData.data_sharing}
                      onCheckedChange={(checked: any) => updateFormData("data_sharing", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Analytics</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Allow collection of usage analytics</p>
                    </div>
                    <Switch
                      checked={formData.analytics}
                      onCheckedChange={(checked: any) => updateFormData("analytics", checked)}
                    />
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export My Data
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-300 dark:border-red-600"
                      onClick={handleDeleteAccount}
                    >
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
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Globe className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Import, export, and manage your financial data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download your data in various formats for backup or analysis
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      Export as JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      Export as CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      Export as PDF
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.transactions}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Transactions</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.wallets}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Wallets</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.goals}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Goals</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.categories}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

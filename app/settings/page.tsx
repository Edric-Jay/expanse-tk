import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="container py-10">
      <Tabs defaultValue="profile" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="profile" className="text-xs px-2 py-2">
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs px-2 py-2">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs px-2 py-2">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs px-2 py-2">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs px-2 py-2">
            Data
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">Make changes to your profile here.</TabsContent>
        <TabsContent value="preferences">Update your preferences.</TabsContent>
        <TabsContent value="notifications">Manage your notifications.</TabsContent>
        <TabsContent value="privacy">Adjust your privacy settings.</TabsContent>
        <TabsContent value="data">Manage your data.</TabsContent>
      </Tabs>
    </div>
  )
}

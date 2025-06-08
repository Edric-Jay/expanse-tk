"use client";

import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, TrendingUp } from "lucide-react"; // Placeholder icons

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Visualize your spending patterns and financial progress."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Spending Over Time</CardTitle>
            <BarChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-muted-foreground">Chart coming soon...</p>
            </div>
            <CardDescription className="mt-2 text-sm">
              Track your monthly or weekly spending trends.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Category Breakdown</CardTitle>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-muted-foreground">Chart coming soon...</p>
            </div>
            <CardDescription className="mt-2 text-sm">
              See how your expenses are distributed across categories.
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Income vs. Expense (Future)</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="h-[200px] flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-muted-foreground">Feature coming soon...</p>
            </div>
            <CardDescription className="mt-2 text-sm">
              Compare your income with your expenses to understand your cash flow. (This feature will require income tracking.)
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

"use client";

import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/contexts/app-context";
import type { Expense } from "@/types";
import { ArrowUpRight, DollarSign, ListChecks, PlusCircle, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

function StatCard({ title, value, icon: Icon, trend, description, link }: { title: string, value: string, icon: React.ElementType, trend?: 'up' | 'down' | 'neutral', description?: string, link?: { href: string, text: string } }) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
      {link && (
         <CardFooter>
          <Button variant="link" asChild className="p-0 h-auto text-sm">
            <Link href={link.href}>
              {link.text} <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const { expenses, budgets, getCategoryIcon } = useAppContext();

  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const totalBudgetLimit = useMemo(() => budgets.reduce((sum, b) => sum + b.limit, 0), [budgets]);
  const budgetProgress = totalBudgetLimit > 0 ? (totalExpenses / totalBudgetLimit) * 100 : 0;

  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);

  const expensesByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categoryMap).map(([name, total]) => ({ name, total })).sort((a,b) => b.total - a.total);
  }, [expenses]);

  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;


  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Your financial overview at a glance."
        actions={
          <Button asChild>
            <Link href="/expenses?action=add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard title="Total Expenses (This Month)" value={`$${totalExpenses.toFixed(2)}`} icon={DollarSign} description="Sum of all recorded expenses." />
        <StatCard title="Active Budgets" value={budgets.length.toString()} icon={ListChecks} description={`${budgets.filter(b => b.limit > 0).length} with set limits.`} link={{href: "/budgets", text: "Manage Budgets"}}/>
        <StatCard title="Uncategorized Expenses" value={expenses.filter(e => e.category === 'Uncategorized').length.toString()} icon={TrendingDown} description="Expenses needing categorization." link={{href: "/expenses", text: "Categorize Expenses"}}/>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Breakdown of your expenses across different categories.</CardDescription>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expensesByCategory} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-center py-10">No spending data available to display chart.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
            <CardDescription>How you're tracking against your overall budget.</CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length > 0 ? (
              budgets.map(budget => {
                const spentOnBudget = expenses.filter(e => e.category === budget.category).reduce((sum, e) => sum + e.amount, 0);
                const progress = budget.limit > 0 ? (spentOnBudget / budget.limit) * 100 : 0;
                const CategoryIcon = getCategoryIcon(budget.category);
                return (
                  <div key={budget.id} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium flex items-center"><CategoryIcon className="w-4 h-4 mr-2 text-muted-foreground"/>{budget.category}</span>
                      <span className="text-sm text-muted-foreground">${spentOnBudget.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-3" />
                     {progress > 100 && <p className="text-xs text-destructive mt-1">Over budget by ${ (spentOnBudget - budget.limit).toFixed(2) }</p>}
                  </div>
                );
              })
            ) : (
               <p className="text-muted-foreground text-center py-10">No budgets set up yet. <Button variant="link" asChild className="p-0 h-auto"><Link href="/budgets">Create a budget</Link></Button></p>
            )}
          </CardContent>
           <CardFooter>
             <Button variant="outline" asChild className="w-full">
                <Link href="/budgets">View All Budgets</Link>
             </Button>
           </CardFooter>
        </Card>
      </div>

      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your last few recorded expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentExpenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExpenses.map((expense: Expense) => {
                  const CategoryIcon = getCategoryIcon(expense.category);
                  return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell><span className="flex items-center"><CategoryIcon className="w-4 h-4 mr-2 text-muted-foreground"/>{expense.category}</span></TableCell>
                    <TableCell>{format(parseISO(expense.date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
             <p className="text-muted-foreground text-center py-10">No transactions recorded yet. <Button variant="link" asChild className="p-0 h-auto"><Link href="/expenses?action=add">Add your first expense</Link></Button></p>
          )}
        </CardContent>
        {recentExpenses.length > 0 && (
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/expenses">View All Expenses</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </>
  );
}

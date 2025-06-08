"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/contexts/app-context";
import type { Budget } from "@/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const budgetFormSchema = z.object({
  category: z.string().min(1, "Category is required."),
  limit: z.coerce.number().positive("Limit must be a positive number."),
});
type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  budget?: Budget;
  onSave: (budget: Budget) => void;
  onCancel: () => void;
}

function BudgetForm({ budget, onSave, onCancel }: BudgetFormProps) {
  const { categories, budgets, getCategoryIcon } = useAppContext();
  const existingCategoriesInBudgets = useMemo(() => budgets.map(b => b.category), [budgets]);
  const availableCategories = useMemo(() => {
    if (budget) return categories; // Allow editing existing category
    return categories.filter(cat => !existingCategoriesInBudgets.includes(cat) && cat !== "Uncategorized");
  }, [categories, existingCategoriesInBudgets, budget]);


  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budget || { category: "", limit: 0 },
  });

  function onSubmit(values: BudgetFormValues) {
    onSave({ id: budget?.id || crypto.randomUUID(), ...values });
    form.reset();
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!budget}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCategories.map((cat) => {
                    const Icon = getCategoryIcon(cat);
                    return(
                      <SelectItem key={cat} value={cat}>
                         <span className="flex items-center"><Icon className="w-4 h-4 mr-2 text-muted-foreground" />{cat}</span>
                      </SelectItem>
                    );
                  })}
                  {availableCategories.length === 0 && !budget && <SelectItem value="" disabled>No new categories available</SelectItem>}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Limit</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{budget ? "Save Changes" : "Add Budget"}</Button>
        </div>
      </form>
    </Form>
  );
}


export default function BudgetsPage() {
  const { budgets, expenses, addBudget, updateBudget, deleteBudget, getCategoryIcon } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);

  const handleSaveBudget = (budgetData: Budget) => {
    if (editingBudget) {
      updateBudget(budgetData);
    } else {
      addBudget(budgetData);
    }
    setIsDialogOpen(false);
    setEditingBudget(undefined);
  };

  const openAddDialog = () => {
    setEditingBudget(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Budgets"
        description="Set and track your spending goals."
        actions={
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Budget
          </Button>
        }
      />

      {budgets.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>You haven't set any budgets yet.</p>
            <Button variant="link" onClick={openAddDialog} className="mt-2">Create your first budget</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const spentOnBudget = expenses
              .filter((e) => e.category === budget.category)
              .reduce((sum, e) => sum + e.amount, 0);
            const progress = budget.limit > 0 ? Math.min((spentOnBudget / budget.limit) * 100, 100) : 0;
            const remaining = budget.limit - spentOnBudget;
            const CategoryIcon = getCategoryIcon(budget.category);

            return (
              <Card key={budget.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center"><CategoryIcon className="w-5 h-5 mr-2 text-primary"/>{budget.category}</CardTitle>
                      <CardDescription>Limit: ${budget.limit.toFixed(2)}</CardDescription>
                    </div>
                    <div className="flex">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(budget)} aria-label="Edit budget">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteBudget(budget.id)} className="text-destructive hover:text-destructive" aria-label="Delete budget">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Progress value={progress} className="mb-2 h-3" />
                  <div className="flex justify-between text-sm">
                    <span>Spent: ${spentOnBudget.toFixed(2)}</span>
                    <span className={remaining < 0 ? "text-destructive" : "text-muted-foreground"}>
                      {remaining >= 0 ? `Remaining: $${remaining.toFixed(2)}` : `Overspent: $${Math.abs(remaining).toFixed(2)}`}
                    </span>
                  </div>
                  {progress >= 100 && spentOnBudget > budget.limit && (
                    <p className="text-xs text-destructive mt-1">You've exceeded this budget!</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                     <a href={`/expenses?category=${encodeURIComponent(budget.category)}`}>View {budget.category} Expenses</a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit Budget" : "Add New Budget"}</DialogTitle>
            <DialogDescription>
              {editingBudget ? "Update your budget details." : "Set a new spending limit for a category."}
            </DialogDescription>
          </DialogHeader>
          <BudgetForm
            budget={editingBudget}
            onSave={handleSaveBudget}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingBudget(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

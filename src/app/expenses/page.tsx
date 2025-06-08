"use client";

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ExpenseForm from "@/components/expenses/expense-form";
import { useAppContext } from "@/contexts/app-context";
import type { Expense } from "@/types";
import { PlusCircle, Edit, Trash2, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, categories, getCategoryIcon } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setEditingExpense(undefined);
      setIsDialogOpen(true);
      router.replace('/expenses', { scroll: false }); // Remove query param
    }
  }, [searchParams, router]);

  const handleSaveExpense = (expenseData: Expense) => {
    if (editingExpense) {
      updateExpense(expenseData);
    } else {
      addExpense(expenseData);
    }
    setIsDialogOpen(false);
    setEditingExpense(undefined);
  };

  const openAddDialog = () => {
    setEditingExpense(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(expense => 
        filterCategory === "All" || expense.category === filterCategory
      )
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [expenses, searchTerm, filterCategory]);

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track and manage your spending."
        actions={
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        }
      />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>View and manage all your recorded expenses.</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input 
                placeholder="Search expenses..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]" aria-label="Filter by category">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => {
                  const CategoryIcon = getCategoryIcon(expense.category);
                  return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        <CategoryIcon className="w-4 h-4 mr-2 text-muted-foreground"/>
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell>{format(parseISO(expense.date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(expense)} aria-label="Edit expense">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteExpense(expense.id)} className="text-destructive hover:text-destructive" aria-label="Delete expense">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-10">
              No expenses found. {searchTerm || filterCategory !== "All" ? "Try adjusting your filters." : "Add your first expense!"}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
            <DialogDescription>
              {editingExpense ? "Update the details of your expense." : "Enter the details of your new expense."}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            expense={editingExpense}
            onSave={handleSaveExpense}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingExpense(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

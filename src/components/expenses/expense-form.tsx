"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Wand2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { Expense } from "@/types";
import { useAppContext } from "@/contexts/app-context";
import { suggestExpenseCategory } from "@/ai/flows/suggest-expense-category";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const expenseFormSchema = z.object({
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  date: z.date({ required_error: "Date is required." }),
  category: z.string().min(1, "Category is required."),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  onSave: (expense: Expense) => void;
  onCancel: () => void;
}

export default function ExpenseForm({ expense, onSave, onCancel }: ExpenseFormProps) {
  const { categories, getCategoryIcon } = useAppContext();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expense
      ? {
          ...expense,
          date: parseISO(expense.date), // Convert ISO string to Date object
        }
      : {
          description: "",
          amount: 0,
          date: new Date(),
          category: "Uncategorized",
        },
  });

  async function onSubmit(values: ExpenseFormValues) {
    const formattedDate = format(values.date, "yyyy-MM-dd"); // Format date to ISO string
    onSave({
      id: expense?.id || crypto.randomUUID(),
      ...values,
      date: formattedDate,
    });
    form.reset();
  }

  const handleSuggestCategory = async () => {
    const description = form.getValues("description");
    if (!description) {
      toast({ title: "Enter a description", description: "Description is needed to suggest a category.", variant: "destructive" });
      return;
    }
    setIsSuggesting(true);
    setSuggestedCategory(null);
    try {
      const result = await suggestExpenseCategory({ transactionDescription: description });
      if (result.suggestedCategory) {
        setSuggestedCategory(result.suggestedCategory);
        toast({ title: "Category Suggested!", description: `AI suggested: ${result.suggestedCategory} (Confidence: ${(result.confidence * 100).toFixed(0)}%)` });
      } else {
        toast({ title: "Suggestion Failed", description: "Could not suggest a category.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error suggesting category:", error);
      toast({ title: "Suggestion Error", description: "An error occurred while suggesting category.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  const useSuggestedCategory = () => {
    if (suggestedCategory) {
      form.setValue("category", suggestedCategory);
      setSuggestedCategory(null); // Clear suggestion after use
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Groceries, Coffee" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex items-center gap-2">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => {
                      const Icon = getCategoryIcon(cat);
                      return (
                        <SelectItem key={cat} value={cat}>
                          <span className="flex items-center"><Icon className="w-4 h-4 mr-2 text-muted-foreground" />{cat}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isSuggesting} aria-label="Suggest Category">
                  {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                </Button>
              </div>
              {suggestedCategory && (
                <div className="mt-2 p-2 border rounded-md bg-accent/20 text-sm">
                  <p>Suggested: <strong>{suggestedCategory}</strong></p>
                  <Button type="button" variant="link" size="sm" onClick={useSuggestedCategory} className="p-0 h-auto text-primary">
                    Use this suggestion
                  </Button>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {expense ? "Save Changes" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

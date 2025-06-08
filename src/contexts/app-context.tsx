"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Expense, Budget } from '@/types';
import { DEFAULT_CATEGORIES } from '@/types';

interface AppContextProps {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  categories: string[];
  getCategoryIcon: (category: string) => React.FC<React.SVGProps<SVGSVGElement>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const initialExpenses: Expense[] = [];
const initialBudgets: Budget[] = [];

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem('pennywise-expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
      const storedBudgets = localStorage.getItem('pennywise-budgets');
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('pennywise-expenses', JSON.stringify(expenses));
      } catch (error) {
        console.error("Failed to save expenses to localStorage", error);
      }
    }
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('pennywise-budgets', JSON.stringify(budgets));
      } catch (error) {
        console.error("Failed to save budgets to localStorage", error);
      }
    }
  }, [budgets, isLoaded]);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [{ ...expense, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const updateExpense = useCallback((updatedExpense: Expense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    setBudgets((prev) => [{ ...budget, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const updateBudget = useCallback((updatedBudget: Budget) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === updatedBudget.id ? updatedBudget : b))
    );
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);
  
  const getCategoryIcon = useCallback((category: string) => {
    const { CATEGORY_ICONS } = require('@/lib/constants'); // Lazy load to avoid server-side issues
    return CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
  }, []);


  return (
    <AppContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        categories: DEFAULT_CATEGORIES,
        getCategoryIcon,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string format: YYYY-MM-DD
  category: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export const DEFAULT_CATEGORIES = [
  'Food', 
  'Transport', 
  'Utilities', 
  'Entertainment', 
  'Health', 
  'Shopping', 
  'Housing',
  'Education',
  'Personal Care',
  'Gifts & Donations',
  'Travel',
  'Other', 
  'Uncategorized'
];

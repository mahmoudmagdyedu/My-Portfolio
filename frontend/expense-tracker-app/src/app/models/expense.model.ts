export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}

export type ExpenseCategory =
  | '🍔 Food'
  | '🚗 Transport'
  | '🏠 Bills'
  | '🎮 Entertainment'
  | '🛒 Shopping'
  | '💊 Health'
  | '📚 Education'
  | '✈️ Travel'
  | '💼 Other';

export interface BudgetGoal {
  monthlyLimit: number;
  categoryLimits?: Record<ExpenseCategory, number>;
}

export interface ExpenseFilter {
  search: string;
  category: ExpenseCategory | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name-asc';
}

export const CATEGORY_COLORS: Record<string, string> = {
  '🍔 Food': '#ef4444',
  '🚗 Transport': '#f97316',
  '🏠 Bills': '#eab308',
  '🎮 Entertainment': '#8b5cf6',
  '🛒 Shopping': '#3b82f6',
  '💊 Health': '#22c55e',
  '📚 Education': '#06b6d4',
  '✈️ Travel': '#ec4899',
  '💼 Other': '#6b7280',
};

export const CATEGORIES: ExpenseCategory[] = [
  '🍔 Food', '🚗 Transport', '🏠 Bills', '🎮 Entertainment',
  '🛒 Shopping', '💊 Health', '📚 Education', '✈️ Travel', '💼 Other',
];

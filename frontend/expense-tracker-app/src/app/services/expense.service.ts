import { Injectable, signal, computed } from '@angular/core';
import { Expense, ExpenseFilter } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly STORAGE_KEY = 'et_expenses';
  expenses = signal<Expense[]>(this.loadExpenses());

  filter = signal<ExpenseFilter>({
    search: '', category: 'all', dateRange: 'month', sortBy: 'date-desc',
  });

  filteredExpenses = computed(() => {
    let list = [...this.expenses()];
    const f = this.filter();
    const now = new Date();
    if (f.search) { const q = f.search.toLowerCase(); list = list.filter(e => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)); }
    if (f.category !== 'all') list = list.filter(e => e.category === f.category);
    if (f.dateRange === 'today') list = list.filter(e => new Date(e.date).toDateString() === now.toDateString());
    else if (f.dateRange === 'week') { const w = new Date(now); w.setDate(now.getDate() - 7); list = list.filter(e => new Date(e.date) >= w); }
    else if (f.dateRange === 'month') list = list.filter(e => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    switch (f.sortBy) {
      case 'date-desc': list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); break;
      case 'date-asc': list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); break;
      case 'amount-desc': list.sort((a, b) => b.amount - a.amount); break;
      case 'amount-asc': list.sort((a, b) => a.amount - b.amount); break;
      case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  });

  monthlyTotal = computed(() => {
    const now = new Date();
    return this.expenses().filter(e => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, e) => s + e.amount, 0);
  });

  addExpense(expense: Omit<Expense, 'id'>): void {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    this.expenses.update(list => [...list, { ...expense, id }]);
    this.saveExpenses();
  }

  updateExpense(id: string, updates: Partial<Expense>): void {
    this.expenses.update(list => list.map(e => e.id === id ? { ...e, ...updates } : e));
    this.saveExpenses();
  }

  deleteExpense(id: string): void {
    this.expenses.update(list => list.filter(e => e.id !== id));
    this.saveExpenses();
  }

  private loadExpenses(): Expense[] { const d = localStorage.getItem(this.STORAGE_KEY); return d ? JSON.parse(d) : []; }
  private saveExpenses(): void { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.expenses())); }
}

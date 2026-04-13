import { Injectable, signal, computed } from '@angular/core';
import { ExpenseService } from './expense.service';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly STORAGE_KEY = 'et_budget';
  monthlyBudget = signal<number>(this.loadBudget());

  budgetRemaining = computed(() => Math.max(0, this.monthlyBudget() - this.expenseService.monthlyTotal()));
  budgetPercentUsed = computed(() => {
    const b = this.monthlyBudget();
    return b <= 0 ? 0 : Math.min(100, (this.expenseService.monthlyTotal() / b) * 100);
  });

  constructor(private expenseService: ExpenseService) {}

  setBudget(amount: number): void {
    this.monthlyBudget.set(amount);
    localStorage.setItem(this.STORAGE_KEY, amount.toString());
  }

  private loadBudget(): number { const v = localStorage.getItem(this.STORAGE_KEY); return v ? parseFloat(v) : 2000; }
}

import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'expenses', loadComponent: () => import('./components/expense-list/expense-list.component').then(m => m.ExpenseListComponent) },
  { path: 'expenses/new', loadComponent: () => import('./components/expense-form/expense-form.component').then(m => m.ExpenseFormComponent), canDeactivate: [unsavedChangesGuard] },
  { path: 'expenses/edit/:id', loadComponent: () => import('./components/expense-form/expense-form.component').then(m => m.ExpenseFormComponent), canDeactivate: [unsavedChangesGuard] },
  { path: 'expenses/:id', loadComponent: () => import('./components/expense-detail/expense-detail.component').then(m => m.ExpenseDetailComponent) },
  { path: 'analytics', loadComponent: () => import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent) },
  { path: 'budget', loadComponent: () => import('./components/budget/budget.component').then(m => m.BudgetComponent) },
  { path: '**', redirectTo: 'dashboard' },
];

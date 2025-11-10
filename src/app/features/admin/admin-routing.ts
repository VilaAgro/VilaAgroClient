import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./admin-dashboard/admin-dashboard').then(c => c.AdminDashboard)
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users-list/users-list').then(c => c.UsersList)
  }
];

import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./admin-dashboard').then(c => c.AdminDashboard)
  },
  // Adicione mais rotas admin conforme necessário
  // {
  //   path: 'users',
  //   loadComponent: () => import('./users/users-list').then(c => c.UsersList)
  // }
];

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'painel',
    canActivate: [authGuard],
    loadComponent: () => import('./features/user/dashboard/dashboard').then(c => c.UserDashboard)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./shared/components/admin-layout/admin-layout').then(c => c.AdminLayout),
    loadChildren: () => import('./features/admin/admin-routing').then(m => m.AdminRoutes)
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];

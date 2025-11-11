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
  },
  {
    path: 'sale-points',
    loadComponent: () => import('./sale-points/sale-points-list/sale-points-list').then(c => c.SalePointsList)
  },
  {
    path: 'fairs',
    loadComponent: () => import('./fairs/fairs-list/fairs-list').then(c => c.FairsList)
  },
  {
    path: 'attendance',
    loadComponent: () => import('./attendance/attendance-management').then(c => c.AttendanceManagement)
  },
  {
    path: 'courses',
    loadComponent: () => import('./courses/courses-management/courses-management').then(c => c.CoursesList)
  }
];

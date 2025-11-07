import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then(c => c.Login) },
  { path: 'register', loadComponent: () => import('./register/register').then(c => c.Register) },
  { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password').then(c => c.ForgotPassword) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}

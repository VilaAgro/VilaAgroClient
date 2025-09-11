import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

/**
 * Guard que protege rotas administrativas
 * Redireciona para /painel se o usuário não for admin ou não estiver autenticado
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o usuário está logado
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Verifica se o usuário é admin
  if (authService.isAdmin()) {
    return true;
  }

  // Se não for admin, redireciona para a área do usuário
  router.navigate(['/painel']);
  return false;
};

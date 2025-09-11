import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

/**
 * Guard que protege rotas que requerem autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o usuário está logado
  if (authService.isLoggedIn()) {
    return true;
  }

  // Se não estiver logado, redireciona para login
  // Salva a URL tentada para redirecionar após o login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};

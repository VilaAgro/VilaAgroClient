// VilaAgroClient/src/app/core/guards/auth-guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs/operators';

/**
 * Guard que protege rotas que requerem autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera a verificação inicial (GET /api/auth/me) terminar
  return authService.authReady$.pipe(
    take(1),
    map(() => {
      // Após a verificação, checa o estado
      if (authService.isLoggedIn()) {
        return true;
      }

      // Se não estiver logado, redireciona para login
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};
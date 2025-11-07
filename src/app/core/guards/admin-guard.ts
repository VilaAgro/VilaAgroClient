// VilaAgroClient/src/app/core/guards/admin-guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs/operators';

/**
 * Guard que protege rotas administrativas
 * Redireciona se o usuário não for admin ou não estiver autenticado
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera a verificação inicial (GET /api/auth/me) terminar
  return authService.authReady$.pipe(
    take(1),
    map(() => {
      // Verifica se o usuário é admin
      if (authService.isAdmin()) {
        return true;
      }

      // Se não for admin (mas talvez esteja logado como usuário),
      // redireciona para o painel do usuário.
      if (authService.isLoggedIn()) {
        router.navigate(['/painel']);
        return false;
      }

      // Se não estiver logado, redireciona para login
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};

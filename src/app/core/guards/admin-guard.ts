// VilaAgroClient/src/app/core/guards/admin-guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map, take, filter } from 'rxjs/operators';

/**
 * Guard que protege rotas administrativas
 * Redireciona se o usuário não for admin ou não estiver autenticado
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera a verificação inicial (GET /api/auth/me) terminar
  return authService.authReady$.pipe(
  filter(ready => ready === true), // Espera o authReady$ ser 'true'
  take(1),                      // Pega esse valor 'true'
  map(() => {                   // Agora executa a lógica do guard
    if (authService.isAdmin()) {
      return true;
    }

    if (authService.isLoggedIn()) {
      router.navigate(['/painel']);
      return false;
    }

    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  })
);
};

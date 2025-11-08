// VilaAgroClient/src/app/core/guards/auth-guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map, take, filter } from 'rxjs/operators';
import { of } from 'rxjs';


/**
 * Guard que protege rotas que requerem autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const ready$ = (authService as any).authReady$ ?? of(true);
  return ready$.pipe(
    filter(ready => ready === true), // Espera o authReady$ ser 'true'
    take(1),                      // Pega esse valor 'true'
    map(() => {                   // Agora executa a lógica do guard
      if (authService.isLoggedIn()) {
        return true;
      }
      console.log('authGuard: usuário não autenticado, redirecionando para /auth/login');
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};

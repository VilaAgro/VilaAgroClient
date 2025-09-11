import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { environment } from '../../../environments/environment';

/**
 * Interceptor que adiciona automaticamente o token JWT nas requisições para a API
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Verifica se a requisição é para a API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Obtém o token do AuthService
  const token = authService.getToken();

  // Se não há token, prossegue sem modificar a requisição
  if (!token) {
    return next(req);
  }

  // Clona a requisição adicionando o header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};

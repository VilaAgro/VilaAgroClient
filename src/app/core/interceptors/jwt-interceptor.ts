import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Interceptor que garante que os cookies sejam enviados nas requisições para a API
 * Como a API usa cookies HttpOnly, não precisamos adicionar headers manualmente
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Verifica se a requisição é para a API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Clone a requisição adicionando withCredentials: true
  // Isso permite que o navegador envie cookies automaticamente
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq);
};

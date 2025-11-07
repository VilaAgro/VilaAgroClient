// VilaAgroClient/src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
// Importe 'withInterceptors' (NÃO importe 'withCredentials')
import { provideHttpClient, withInterceptors } from '@angular/common/http'; 
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Material from '@primeuix/themes/material';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor'; // <-- Garanta que isso está sendo importado

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Garanta que esta linha esteja usando o interceptor
    provideHttpClient(withInterceptors([jwtInterceptor])),

    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Material,
        options: { darkModeSelector: false || 'none'}
      }
    })
  ]
};
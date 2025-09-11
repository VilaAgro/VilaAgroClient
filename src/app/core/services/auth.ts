import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, AuthState } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);

  private readonly TOKEN_KEY = 'jwt-token';
  private readonly TOKEN_EXPIRY_HOURS = 24;

  // Estado reativo usando Signals
  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Signals públicos para componentes
  public readonly authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  public readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  public readonly currentUser = computed(() => this.authState().user);
  public readonly userRole = computed(() => this.authState().user?.role);

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Inicializa o estado de autenticação verificando se existe um token válido
   */
  private initializeAuthState(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      const user = this.getUserFromToken(token);
      if (user) {
        this.updateAuthState({
          isAuthenticated: true,
          user,
          token
        });
      } else {
        this.clearAuthState();
      }
    } else {
      this.clearAuthState();
    }
  }

  /**
   * Realiza o login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.updateAuthState({
            isAuthenticated: true,
            user: response.user,
            token: response.token
          });

          // Redireciona baseado no role do usuário
          if (response.user.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/painel']);
          }
        }),
        catchError(error => {
          console.error('Erro no login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    // Chama endpoint de logout se necessário
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => {
        this.clearAuthState();
        this.router.navigate(['/login']);
      },
      error: () => {
        // Mesmo com erro na API, limpa o estado local
        this.clearAuthState();
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Força o logout local (sem chamar API)
   */
  forceLogout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Obtém o token do cookie
   */
  getToken(): string | null {
    return this.cookieService.get(this.TOKEN_KEY) || null;
  }

  /**
   * Verifica se o usuário está logado
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && this.isTokenValid(token);
  }

  /**
   * Obtém o role do usuário atual
   */
  getUserRole(): string | null {
    return this.currentUser()?.role || null;
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  /**
   * Verifica se o usuário é user comum
   */
  isUser(): boolean {
    return this.getUserRole() === 'USER';
  }

  /**
   * Obtém os dados do usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Atualiza o perfil do usuário (após edição)
   */
  updateUserProfile(user: User): void {
    this.updateAuthState({
      ...this.authState(),
      user
    });
  }

  /**
   * Define o token no cookie
   */
  private setToken(token: string): void {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + this.TOKEN_EXPIRY_HOURS);

    this.cookieService.set(
      this.TOKEN_KEY,
      token,
      expiryDate,
      '/', // path
      undefined, // domain
      true, // secure (apenas HTTPS em produção)
      'Strict' // sameSite
    );
  }

  /**
   * Remove o token do cookie
   */
  private removeToken(): void {
    this.cookieService.delete(this.TOKEN_KEY, '/');
  }

  /**
   * Verifica se o token é válido (não expirado)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Decodifica o token JWT
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Extrai os dados do usuário do token
   */
  private getUserFromToken(token: string): User | null {
    try {
      const payload = this.decodeToken(token);
      return {
        id: payload.sub || payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        status: payload.status,
        category: payload.category,
        phone: payload.phone,
        document: payload.document,
        createdAt: new Date(payload.createdAt),
        updatedAt: new Date(payload.updatedAt)
      };
    } catch {
      return null;
    }
  }

  /**
   * Atualiza o estado de autenticação
   */
  private updateAuthState(state: AuthState): void {
    this.authState.set(state);
    this.authStateSubject.next(state);
  }

  /**
   * Limpa o estado de autenticação
   */
  private clearAuthState(): void {
    this.removeToken();
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  /**
   * Observable para o estado de autenticação (para compatibilidade)
   */
  get authState$(): Observable<AuthState> {
    return this.authStateSubject.asObservable();
  }
}

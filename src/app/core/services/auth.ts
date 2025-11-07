import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, AuthResponse, AuthState, RegisterRequest, UserType } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // --- LÓGICA DE TOKEN E COOKIE REMOVIDA ---
  // O back-end e o navegador agora gerenciam os cookies HttpOnly

  // Signals públicos para componentes
  public readonly authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  public readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  public readonly currentUser = computed(() => this.authState().user);
  public readonly userRole = computed(() => this.authState().user?.role); // Corrigido de 'role' para 'type'

  // Usado para garantir que os guards esperem a verificação inicial
  private authReadySubject = new BehaviorSubject<boolean>(false);
  public authReady$ = this.authReadySubject.asObservable();

  constructor() {
    this.checkAuthenticationStatus();
  }

  /**
   * Verifica o status de autenticação ao carregar a aplicação.
   * A única forma de saber se temos um cookie HttpOnly válido é
   * fazendo uma requisição a um endpoint protegido.
   * (Corresponde ao antigo 'initializeAuthState')
   */
  private checkAuthenticationStatus(): void {
    // GET /api/auth/me
    this.http.get<AuthResponse>(`${environment.apiUrl}/auth/me`).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.updateAuthState({
            isAuthenticated: true,
            user: response.user
          });
        } else {
          this.clearAuthState();
        }
      }),
      catchError(() => {
        this.clearAuthState();
        return of(null); // Continua o fluxo
      }),
      tap(() => {
        this.authReadySubject.next(true); // Informa aos guards que a verificação terminou
        this.authReadySubject.complete();
      })
    ).subscribe();
  }

  /**
   * Realiza o login do usuário
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // POST /api/auth/login
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (!response.success || !response.user) {
            throw new Error(response.message || 'Erro no login');
          }

          this.updateAuthState({
            isAuthenticated: true,
            user: response.user,
          });

          // Redireciona baseado no tipo de usuário (role)
          this.redirectUser(response.user.role);
        }),
        catchError(error => {
          console.error('Erro no login:', error);
          this.clearAuthState();
          return throwError(() => error);
        })
      );
  }

  /**
   * Realiza o registro do usuário
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    // POST /api/auth/register
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          if (!response.success || !response.user) {
            throw new Error(response.message || 'Erro no registro');
          }

          // O registro no back-end já faz o login (define os cookies)
          this.updateAuthState({
            isAuthenticated: true,
            user: response.user,
          });

          // Redireciona o novo usuário
          this.redirectUser(response.user.role);
        }),
        catchError(error => {
          console.error('Erro no registro:', error);
          this.clearAuthState();
          return throwError(() => error);
        })
      );
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    // POST /api/auth/logout
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: () => this.handleLogoutSuccess(),
      error: () => this.handleLogoutSuccess(), // Mesmo com erro, desloga localmente
      complete: () => this.handleLogoutSuccess()
    });
  }

  private handleLogoutSuccess(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Força o logout local (sem chamar API)
   */
  forceLogout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica se o usuário está logado (usado pelos guards)
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): boolean {
    return this.userRole() === 'ADMIN';
  }

  /**
   * Verifica se o usuário é um tipo de comerciante
   */
  isUser(): boolean {
    const role = this.userRole();
    return role === 'PRODUTOR_RURAL' || role === 'GASTRONOMO' || role === 'PRODUTOR_ARTESANAL';
  }

  /**
   * Obtém os dados do usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Redireciona o usuário após o login baseado no seu tipo
   */
  private redirectUser(userType: UserType): void {
    if (userType === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']); // Rota futura do Admin
    } else {
      this.router.navigate(['/painel']); // Rota futura do Comerciante
    }
  }

  /**
   * Atualiza o estado de autenticação
   */
  private updateAuthState(state: AuthState): void {
    this.authState.set(state);
  }

  /**
   * Limpa o estado de autenticação
   */
  private clearAuthState(): void {
    // Não precisamos mais limpar cookies, o back-end (logout) faz isso.
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
    });
  }
}

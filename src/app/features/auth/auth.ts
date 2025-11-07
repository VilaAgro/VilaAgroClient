import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, AuthState } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

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
   * Inicializa o estado de autenticação verificando cookies/localStorage
   */
  private initializeAuthState(): void {
    // Como a API usa cookies HttpOnly, verificamos chamando /api/auth/me
    this.checkAuthStatus().subscribe({
      next: (response) => {
        if (response.success && response.user) {
          this.updateAuthState({
            isAuthenticated: true,
            user: response.user,
            token: 'cookie' // Token está no cookie HttpOnly
          });
        }
      },
      error: () => {
        this.clearAuthState();
      }
    });
  }

  /**
   * Verifica status de autenticação com o backend
   */
  private checkAuthStatus(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/me`, {
      withCredentials: true // IMPORTANTE: Envia cookies
    });
  }

  /**
   * Realiza o login do usuário
   */
  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/auth/login`,
      credentials,
      { withCredentials: true } // IMPORTANTE: Permite receber e enviar cookies
    ).pipe(
      tap(response => {
        if (response.success && response.user) {
            const user: User = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.type,
            status: response.user.documentsStatus,
            category: this.mapUserTypeToCategory(response.user.type),
            phone: response.user.phone,
            document: response.user.cpf,
            salePointId: response.user.salePointId || null,
            documentsStatus: response.user.documentsStatus,
            createdAt: new Date(response.user.createdAt),
            updatedAt: new Date(response.user.updatedAt)
            };

          this.updateAuthState({
            isAuthenticated: true,
            user: user,
            token: 'cookie'
          });

          // Redireciona baseado no role do usuário
          if (user.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/painel']);
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Realiza o registro de um novo usuário
   */
  register(userData: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/auth/register`,
      userData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success && response.user) {
          const user: User = this.mapResponseToUser(response.user);
          this.updateAuthState({
            isAuthenticated: true,
            user: user,
            token: 'cookie'
          });
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).subscribe({
      complete: () => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Mesmo com erro na API, limpa o estado local
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * Força o logout local (sem chamar API)
   */
  forceLogout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica se o usuário está logado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Obtém o token (no caso, apenas indicador de que está no cookie)
   */
  getToken(): string | null {
    return this.authState().token || null;
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
    const role = this.getUserRole();
    return role !== 'ADMIN' && role !== null;
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

  /**
   * Mapeia UserType do backend para Category do frontend
   */
  private mapUserTypeToCategory(type: string): 'PRODUTOR_RURAL' | 'COMERCIANTE' | 'ARTESAO' | 'OUTRO' {
    const mapping: any = {
      'PRODUTOR_RURAL': 'PRODUTOR_RURAL',
      'GASTRONOMO': 'COMERCIANTE',
      'PRODUTOR_ARTESANAL': 'ARTESAO'
    };
    return mapping[type] || 'OUTRO';
  }

  /**
   * Mapeia resposta da API para modelo User
   */
  private mapResponseToUser(userData: any): User {
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.type,
      status: userData.documentsStatus,
      category: this.mapUserTypeToCategory(userData.type),
      phone: userData.phone,
      document: userData.cpf,
      salePointId: userData.salePointId || null,
      documentsStatus: userData.documentsStatus,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt)
    };
  }

  /**
   * Tratamento de erros HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      errorMessage = error.error?.message || `Erro ${error.status}: ${error.statusText}`;
    }

    console.error('Erro na requisição:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

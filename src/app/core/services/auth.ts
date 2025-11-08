// auth.service.ts - Versão Completa Corrigida

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, AuthResponse, AuthState, RegisterRequest, UserType } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly AUTH_STATE_KEY = 'auth_state';
  private readonly SESSION_VERIFIED_KEY = 'session_verified';

  public readonly authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  public readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  public readonly currentUser = computed(() => this.authState().user);
  public readonly userRole = computed(() => this.authState().user?.type || null);

  private authReadySubject = new BehaviorSubject<boolean>(false);
  public authReady$ = this.authReadySubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa autenticação: primeiro tenta carregar do cache, depois valida com backend
   */
  private initializeAuth(): void {
    const cachedState = this.loadAuthStateFromCache();

    if (cachedState) {
      this.updateAuthState(cachedState);
      console.log('✅ Estado restaurado do cache:', cachedState.user?.email);

      const lastVerification = this.getLastVerificationTime();
      const shouldVerify = !lastVerification || (Date.now() - lastVerification > 5 * 60 * 1000);

      if (shouldVerify) {
        this.verifySessionWithBackend();
      } else {
        console.log('✅ Sessão válida (verificada recentemente)');
        this.authReadySubject.next(true);
      }
    } else {
      console.log('ℹ️ Sem cache, verificando com backend...');
      this.verifySessionWithBackend();
    }
  }

  /**
   * Verifica sessão com o backend (valida cookies)
   */
  private verifySessionWithBackend(): void {
    this.http.get<AuthResponse>(`${environment.apiUrl}/users/me`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.success && response.user) {
          const user = this.mapResponseToUser(response.user);

          this.updateAuthState({
            isAuthenticated: true,
            user: user
          });

          this.saveAuthStateToCache({ isAuthenticated: true, user });
          this.updateLastVerificationTime();

          console.log('✅ Sessão validada com backend:', user.email);
        } else {
          this.clearAuthState();
        }
      }),
      catchError((error) => {
        console.log('❌ Sessão inválida ou expirada');
        this.clearAuthState();
        return of(null);
      }),
      tap(() => {
        this.authReadySubject.next(true);
      })
    ).subscribe();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (!response.success || !response.user) {
          throw new Error(response.message || 'Erro no login');
        }

        const user = this.mapResponseToUser(response.user);

        this.updateAuthState({
          isAuthenticated: true,
          user: user,
        });

        this.saveAuthStateToCache({ isAuthenticated: true, user });
        this.updateLastVerificationTime();

        this.redirectUser(user.type);
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (!response.success || !response.user) {
          throw new Error(response.message || 'Erro no registro');
        }

        const user = this.mapResponseToUser(response.user);

        this.updateAuthState({
          isAuthenticated: true,
          user: user,
        });

        this.saveAuthStateToCache({ isAuthenticated: true, user });
        this.updateLastVerificationTime();

        this.redirectUser(user.type);
      }),
      catchError(error => {
        console.error('Erro no registro:', error);
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).subscribe({
      next: () => this.handleLogoutSuccess(),
      error: () => this.handleLogoutSuccess(),
      complete: () => this.handleLogoutSuccess()
    });
  }

  private handleLogoutSuccess(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  forceLogout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.userRole() === 'ADMIN';
  }

  isUser(): boolean {
    const role = this.userRole();
    return role === 'PRODUTOR_RURAL' || role === 'GASTRONOMO' || role === 'PRODUTOR_ARTESANAL';
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  updateUserProfile(user: User): void {
    this.updateAuthState({
      ...this.authState(),
      user
    });
    this.saveAuthStateToCache({ isAuthenticated: true, user });
  }

  private redirectUser(userType: UserType): void {
    if (userType === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/painel']);
    }
  }

  private updateAuthState(state: AuthState): void {
    this.authState.set(state);
  }

  private clearAuthState(): void {
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
    });

    localStorage.removeItem(this.AUTH_STATE_KEY);
    localStorage.removeItem(this.SESSION_VERIFIED_KEY);
  }

  private saveAuthStateToCache(state: AuthState): void {
    try {
      localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Não foi possível salvar estado no cache:', error);
    }
  }

  private loadAuthStateFromCache(): AuthState | null {
    try {
      const cached = localStorage.getItem(this.AUTH_STATE_KEY);
      if (!cached) return null;

      const state = JSON.parse(cached) as AuthState;

      if (state.user) {
        state.user.createdAt = new Date(state.user.createdAt);
        state.user.updatedAt = new Date(state.user.updatedAt);
      }

      return state;
    } catch (error) {
      console.warn('Erro ao carregar cache:', error);
      return null;
    }
  }

  private updateLastVerificationTime(): void {
    localStorage.setItem(this.SESSION_VERIFIED_KEY, Date.now().toString());
  }

  private getLastVerificationTime(): number | null {
    const timestamp = localStorage.getItem(this.SESSION_VERIFIED_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  }

  private mapResponseToUser(userData: any): User {
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      type: userData.type,
      status: userData.documentsStatus,
      category: this.mapUserTypeToCategory(userData.type),
      phone: userData.phone,
      document: userData.cpfCnpj,
      cpfCnpj: userData.cpfCnpj,
      salePointId: userData.salePointId || null,
      documentsStatus: userData.documentsStatus,
      profilePictureUrl: userData.profilePictureUrl,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt)
    };
  }

  private mapUserTypeToCategory(type: string): 'PRODUTOR_RURAL' | 'COMERCIANTE' | 'ARTESAO' | 'OUTRO' {
    const mapping: any = {
      'PRODUTOR_RURAL': 'PRODUTOR_RURAL',
      'GASTRONOMO': 'COMERCIANTE',
      'PRODUTOR_ARTESANAL': 'ARTESAO',
      'ADMIN': 'OUTRO'
    };
    return mapping[type] || 'OUTRO';
  }
}

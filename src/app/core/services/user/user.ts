import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  documentsStatus: string;
  type: string;
  salePointId?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  /**
   * Lista todos os usuários (Admin)
   */
  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  /**
   * Busca usuário por ID
   */
  getUserById(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Atualiza usuário
   */
  updateUser(id: string, data: Partial<UserDTO>): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.baseUrl}/${id}`, data, {
      withCredentials: true
    });
  }

  /**
   * Atualiza status do usuário (Admin)
   */
  updateUserStatus(id: string, status: string, reason?: string): Observable<UserDTO> {
    return this.http.put<UserDTO>(
      `${this.baseUrl}/${id}/status`,
      { status, reason },
      { withCredentials: true }
    );
  }

  /**
   * Lista usuários pendentes (Admin)
   */
  getPendingUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.baseUrl}/pending`, {
      withCredentials: true
    });
  }

  /**
   * Deleta usuário (Admin)
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Solicita desligamento
   */
  requestTermination(reason: string, details?: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/me/terminate`,
      { reason, details },
      { withCredentials: true }
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SalePointDTO {
  id: string;
  name: string;
  addressId?: string;
  allocatedUser?: {
    id: string;
    name: string;
    email: string;
    type: string;
    documentsStatus: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SalePointCreateDTO {
  name: string;
  addressId?: string;
}

export interface SalePointAllocateDTO {
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalePointService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/sale-points`;

  /**
   * Lista todos os pontos de venda
   */
  getAllSalePoints(): Observable<SalePointDTO[]> {
    return this.http.get<SalePointDTO[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  /**
   * Busca um ponto de venda por ID
   */
  getSalePointById(id: string): Observable<SalePointDTO> {
    return this.http.get<SalePointDTO>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Cria um novo ponto de venda (Admin)
   */
  createSalePoint(data: SalePointCreateDTO): Observable<SalePointDTO> {
    return this.http.post<SalePointDTO>(this.baseUrl, data, {
      withCredentials: true
    });
  }

  /**
   * Atualiza um ponto de venda (Admin)
   */
  updateSalePoint(id: string, data: SalePointCreateDTO): Observable<SalePointDTO> {
    return this.http.put<SalePointDTO>(`${this.baseUrl}/${id}`, data, {
      withCredentials: true
    });
  }

  /**
   * Deleta um ponto de venda (Admin)
   */
  deleteSalePoint(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Aloca um usuário a um ponto de venda (Admin)
   */
  allocateUserToSalePoint(salePointId: string, data: SalePointAllocateDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/${salePointId}/allocate`, data, {
      withCredentials: true
    });
  }

  /**
   * Remove usuário de um ponto de venda (Admin)
   */
  removeUserFromSalePoint(salePointId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${salePointId}/allocate`, {
      withCredentials: true
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FairDTO {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedMerchants: number;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface AttractionDTO {
  id: string;
  timeStart: string;
  timeEnd: string;
  fair: any;
  artist: any;
}

@Injectable({
  providedIn: 'root'
})
export class FairService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/fairs`;

  /**
   * Lista todas as feiras
   */
  getAllFairs(): Observable<FairDTO[]> {
    return this.http.get<FairDTO[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  /**
   * Lista feiras por mês e ano
   */
  getFairsByMonthAndYear(month: number, year: number): Observable<FairDTO[]> {
    return this.http.get<FairDTO[]>(this.baseUrl, {
      params: { month: month.toString(), year: year.toString() },
      withCredentials: true
    });
  }

  /**
   * Busca próxima feira
   */
  getNextFair(): Observable<FairDTO> {
    return this.http.get<FairDTO>(`${this.baseUrl}/next`, {
      withCredentials: true
    });
  }

  /**
   * Cria nova feira (Admin)
   */
  createFair(fair: Partial<FairDTO>): Observable<FairDTO> {
    return this.http.post<FairDTO>(this.baseUrl, fair, {
      withCredentials: true
    });
  }

  /**
   * Atualiza feira (Admin)
   */
  updateFair(id: string, fair: Partial<FairDTO>): Observable<FairDTO> {
    return this.http.put<FairDTO>(`${this.baseUrl}/${id}`, fair, {
      withCredentials: true
    });
  }

  /**
   * Deleta feira (Admin)
   */
  deleteFair(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Lista atrações de uma feira
   */
  getFairAttractions(fairId: string): Observable<AttractionDTO[]> {
    return this.http.get<AttractionDTO[]>(`${this.baseUrl}/${fairId}/attractions`, {
      withCredentials: true
    });
  }
}

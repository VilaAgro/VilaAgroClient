import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AbsenceDTO,
  AttendanceSummaryDTO,
  RegisterAbsencesRequest,
  ReviewJustificationRequest,
} from '../../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/attendance`;

  /**
   * Registra faltas (Admin)
   */
  registerAbsences(request: RegisterAbsencesRequest): Observable<AbsenceDTO[]> {
    return this.http.post<AbsenceDTO[]>(`${this.baseUrl}/absences`, request, {
      withCredentials: true
    });
  }

  /**
   * Lista todas as faltas de todos os usuários (Admin)
   */
  getAllAbsences(): Observable<AbsenceDTO[]> {
    return this.http.get<AbsenceDTO[]>(`${this.baseUrl}/absences`, {
      withCredentials: true
    });
  }

  /**
   * Lista minhas ausências
   */
  getMyAbsences(): Observable<AbsenceDTO[]> {
    return this.http.get<AbsenceDTO[]>(`${this.baseUrl}/absences/me`, {
      withCredentials: true
    });
  }

  /**
   * Lista ausências de um usuário (Admin)
   */
  getUserAbsences(userId: string): Observable<AbsenceDTO[]> {
    return this.http.get<AbsenceDTO[]>(`${this.baseUrl}/absences/user/${userId}`, {
      withCredentials: true
    });
  }

  /**
   * Envia justificativa para ausência
   */
  submitJustification(absenceId: string, description: string, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }

    return this.http.post(`${this.baseUrl}/absences/${absenceId}/justify`, formData, {
      withCredentials: true
    });
  }

  /**
   * Lista justificativas pendentes (Admin)
   */
  getPendingJustifications(): Observable<AbsenceDTO[]> {
    return this.http.get<AbsenceDTO[]>(`${this.baseUrl}/justifications/pending`, {
      withCredentials: true
    });
  }

  /**
   * Revisa justificativa (Admin)
   */
  reviewJustification(
    id: string,
    request: ReviewJustificationRequest
  ): Observable<AbsenceDTO> {
    return this.http.put<AbsenceDTO>(
      `${this.baseUrl}/justifications/${id}/review`,
      request,
      { withCredentials: true }
    );
  }

  /**
   * Obtém resumo de frequência
   */
  getAttendanceSummary(): Observable<AttendanceSummaryDTO> {
    return this.http.get<AttendanceSummaryDTO>(`${this.baseUrl}/summary`, {
      withCredentials: true
    });
  }

  /**
   * Notifica ausência futura
   */
  notifyAbsence(date: string, reason: string, file?: File): Observable<AbsenceDTO> {
    const formData = new FormData();
    formData.append('date', date);
    formData.append('reason', reason);
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<AbsenceDTO>(
      `${this.baseUrl}/absence/notify`,
      formData,
      { withCredentials: true }
    );
  }

  /**
   * Baixa anexo de justificativa
   */
  downloadJustificationAnnex(justificationId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/justifications/${justificationId}/annex`, {
      responseType: 'blob',
      withCredentials: true
    });
  }
}

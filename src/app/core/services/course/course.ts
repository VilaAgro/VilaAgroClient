import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserDTO } from '../user/user';

export interface CourseDTO {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  addressId?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/courses`;

  /**
   * Lista todos os cursos
   */
  getAllCourses(): Observable<CourseDTO[]> {
    return this.http.get<CourseDTO[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  /**
   * Lista cursos futuros
   */
  getUpcomingCourses(): Observable<CourseDTO[]> {
    return this.http.get<CourseDTO[]>(`${this.baseUrl}/upcoming`, {
      withCredentials: true
    });
  }

  /**
   * Busca curso por ID
   */
  getCourseById(id: string): Observable<CourseDTO> {
    return this.http.get<CourseDTO>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Cria novo curso (Admin)
   */
  createCourse(course: Partial<CourseDTO>): Observable<CourseDTO> {
    return this.http.post<CourseDTO>(this.baseUrl, course, {
      withCredentials: true
    });
  }

  /**
   * Atualiza curso (Admin)
   */
  updateCourse(id: string, course: Partial<CourseDTO>): Observable<CourseDTO> {
    return this.http.put<CourseDTO>(`${this.baseUrl}/${id}`, course, {
      withCredentials: true
    });
  }

  /**
   * Deleta curso (Admin)
   */
  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Inscreve-se em um curso
   */
  enrollInCourse(id: string): Observable<CourseDTO> {
    return this.http.post<CourseDTO>(`${this.baseUrl}/${id}/enroll`, {}, {
      withCredentials: true
    });
  }

  /**
   * Cancela inscrição
   */
  cancelEnrollment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/enroll`, {
      withCredentials: true
    });
  }

  /**
   * Lista cursos em que está inscrito
   */
  getMyEnrolledCourses(): Observable<CourseDTO[]> {
    return this.http.get<CourseDTO[]>(`${this.baseUrl}/enrolled/me`, {
      withCredentials: true
    });
  }

  /**
   * Lista usuários inscritos em um curso (Admin)
   */
  getEnrolledUsers(courseId: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.baseUrl}/${courseId}/enrolled-users`, {
      withCredentials: true
    });
  }
}

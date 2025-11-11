import { DatePickerModule } from 'primeng/datepicker';
// src/app/features/admin/courses/courses-list/courses-list.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CourseService, CourseDTO } from '../../../../core/services/course/course';
import { UserService, UserDTO } from '../../../../core/services/user/user';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    TagModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TextareaModule,
    TabsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './courses-management.html',
  styleUrls: ['./courses-management.scss']
})
export class CoursesList implements OnInit {
  private courseService = inject(CourseService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Dados
  courses: CourseDTO[] = [];
  filteredCourses: CourseDTO[] = [];
  enrolledUsers: UserDTO[] = [];
  minDate: Date = new Date();

  loading = false;
  loadingEnrolled = false;

  // Filtros
  searchTerm = '';
  showPastCourses = false;

  // Dialogs
  showCourseDialog = false;
  showEnrolledDialog = false;
  isEditMode = false;

  selectedCourse: CourseDTO | null = null;

  // Formulário
  courseForm = {
    title: '',
    description: '',
    datetime: null as Date | null,
    addressId: undefined as string | undefined
  };

  // Tab ativa
  activeTab = 0;

  ngOnInit() {
    this.loadCourses();
  }

  // ========== CURSOS ==========

  loadCourses() {
    this.loading = true;
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses.sort((a, b) =>
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
        );
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cursos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os cursos'
        });
        this.loading = false;
      }
    });
  }

  openNewCourseDialog() {
    this.isEditMode = false;
    this.selectedCourse = null;
    this.courseForm = {
      title: '',
      description: '',
      datetime: null,
      addressId: undefined
    };
    this.showCourseDialog = true;
  }

  openEditCourseDialog(course: CourseDTO) {
    this.isEditMode = true;
    this.selectedCourse = course;
    this.courseForm = {
      title: course.title,
      description: course.description || '',
      datetime: new Date(course.datetime),
      addressId: course.addressId
    };
    this.showCourseDialog = true;
  }

  saveCourse() {
    if (!this.courseForm.title || !this.courseForm.datetime) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    const courseData = {
      title: this.courseForm.title,
      description: this.courseForm.description,
      datetime: this.courseForm.datetime.toISOString(),
      addressId: this.courseForm.addressId
    };

    if (this.isEditMode && this.selectedCourse) {
      this.courseService.updateCourse(this.selectedCourse.id, courseData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Curso atualizado com sucesso'
          });
          this.showCourseDialog = false;
          this.loadCourses();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível atualizar o curso'
          });
        }
      });
    } else {
      this.courseService.createCourse(courseData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Curso criado com sucesso'
          });
          this.showCourseDialog = false;
          this.loadCourses();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível criar o curso'
          });
        }
      });
    }
  }

  deleteCourse(course: CourseDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o curso "${course.title}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.courseService.deleteCourse(course.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Curso excluído com sucesso'
            });
            this.loadCourses();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: error.error?.message || 'Não foi possível excluir o curso'
            });
          }
        });
      }
    });
  }

  // ========== INSCRITOS ==========

  viewEnrolledUsers(course: CourseDTO) {
    this.selectedCourse = course;
    this.loadingEnrolled = true;
    this.showEnrolledDialog = true;

    this.courseService.getEnrolledUsers(course.id).subscribe({
      next: (users) => {
        this.enrolledUsers = users;
        this.loadingEnrolled = false;
      },
      error: (error) => {
        console.error('Erro ao carregar inscritos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a lista de inscritos'
        });
        this.loadingEnrolled = false;
      }
    });
  }

  // ========== FILTROS ==========

  applyFilters() {
    const now = new Date();

    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch = !this.searchTerm ||
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const courseDate = new Date(course.datetime);
      const isFuture = courseDate >= now;
      const matchesTimeFilter = this.showPastCourses || isFuture;

      return matchesSearch && matchesTimeFilter;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.showPastCourses = false;
    this.applyFilters();
  }

  togglePastCourses() {
    this.showPastCourses = !this.showPastCourses;
    this.applyFilters();
  }

  // ========== HELPERS ==========

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isPastCourse(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  getCourseBadge(dateStr: string): { severity: string; label: string } {
    const isPast = this.isPastCourse(dateStr);
    return isPast
      ? { severity: 'secondary', label: 'Concluído' }
      : { severity: 'success', label: 'Agendado' };
  }

  getUserTypeLabel(type: string): string {
    const labels: any = {
      'PRODUTOR_RURAL': 'Produtor Rural',
      'GASTRONOMO': 'Gastrônomo',
      'PRODUTOR_ARTESANAL': 'Produtor Artesanal',
      'ADMIN': 'Administrador'
    };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): string {
    const severities: any = {
      'PRODUTOR_RURAL': 'success',
      'GASTRONOMO': 'info',
      'PRODUTOR_ARTESANAL': 'warning',
      'ADMIN': 'danger'
    };
    return severities[type] || 'info';
  }

  getUpcomingCoursesCount(): number {
    const now = new Date();
    return this.courses.filter(c => new Date(c.datetime) >= now).length;
  }

  getPastCoursesCount(): number {
    const now = new Date();
    return this.courses.filter(c => new Date(c.datetime) < now).length;
  }

  getTotalEnrollmentsCount(): number {
    // Placeholder - você pode implementar um contador real
    return this.courses.length * 5; // Estimativa
  }
}
